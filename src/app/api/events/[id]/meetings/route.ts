import { z } from "zod";
import { db, getEvent, getParticipants } from "@/lib/db";
import { sendIndividualEmails } from "@/lib/email";
import { isValidSlot } from "@/lib/time";

const meetingSchema = z.object({ token: z.string(), participantId: z.uuid(), time: z.string() });

export async function POST(request: Request, context: RouteContext<"/api/events/[id]/meetings">) {
  try {
    const { id } = await context.params;
    const parsed = meetingSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: "Choose a valid time." }, { status: 400 });
    const event = await getEvent(id);
    if (!event || event.manage_token !== parsed.data.token) return Response.json({ error: "Organizer link not found." }, { status: 404 });
    if (!isValidSlot(parsed.data.time, event.event_date)) return Response.json({ error: "Choose a valid time." }, { status: 400 });
    if (event.mode !== "individual") return Response.json({ error: "This is a group event." }, { status: 400 });
    if (!event.organizer_slots.includes(parsed.data.time)) return Response.json({ error: "Choose one of your available times." }, { status: 400 });
    const participants = await getParticipants(id);
    const participant = participants.find((p) => p.id === parsed.data.participantId);
    if (!participant || participant.confirmed_time) return Response.json({ error: "This guest is already scheduled or was not found." }, { status: 409 });
    if (!participant.slots.includes(parsed.data.time)) return Response.json({ error: "That guest is not available then." }, { status: 400 });
    const sql = db();
    const rows = await sql`UPDATE participants SET confirmed_time = ${parsed.data.time}
      WHERE id = ${participant.id} AND event_id = ${id} AND confirmed_time IS NULL
      AND NOT EXISTS (SELECT 1 FROM participants WHERE event_id = ${id} AND confirmed_time = ${parsed.data.time})
      RETURNING id`;
    if (!rows.length) return Response.json({ error: "That time was just booked. Choose another." }, { status: 409 });
    participant.confirmed_time = parsed.data.time;
    let emailSent = true;
    try { await sendIndividualEmails(event, participant, `${new URL(request.url).origin}/e/${id}`); }
    catch (error) { emailSent = false; console.error("Individual meeting email failed", error); }
    return Response.json({ ok: true, emailSent });
  } catch (error) {
    console.error("Individual scheduling failed", error);
    return Response.json({ error: "Could not schedule this meeting." }, { status: 500 });
  }
}
