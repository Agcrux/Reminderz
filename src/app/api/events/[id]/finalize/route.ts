import { z } from "zod";
import { db, getEvent, getParticipants } from "@/lib/db";
import { sendFinalEmails } from "@/lib/email";
import { isValidSlot } from "@/lib/time";

const finalizeSchema = z.object({ token: z.string(), time: z.string() });

export async function POST(request: Request, context: RouteContext<"/api/events/[id]/finalize">) {
  try {
    const { id } = await context.params;
    const parsed = finalizeSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: "Choose a valid time." }, { status: 400 });
    const event = await getEvent(id);
    if (!event || event.manage_token !== parsed.data.token) return Response.json({ error: "Organizer link not found." }, { status: 404 });
    if (!isValidSlot(parsed.data.time, event.event_date)) return Response.json({ error: "Choose a valid time." }, { status: 400 });
    if (event.mode !== "group") return Response.json({ error: "Use individual scheduling for this event." }, { status: 400 });
    if (!event.organizer_slots.includes(parsed.data.time)) return Response.json({ error: "Choose one of your available times." }, { status: 400 });
    if (event.finalized_time) return Response.json({ error: "This event is already scheduled." }, { status: 409 });
    const participants = await getParticipants(id);
    if (!participants.length) return Response.json({ error: "Wait for at least one response." }, { status: 400 });
    if (participants.some((person) => !person.slots.includes(parsed.data.time))) return Response.json({ error: "Choose a time that works for everyone." }, { status: 400 });
    const sql = db();
    const updated = await sql`UPDATE events SET finalized_time = ${parsed.data.time}
      WHERE id = ${id} AND finalized_time IS NULL RETURNING id`;
    if (!updated.length) return Response.json({ error: "This event is already scheduled." }, { status: 409 });
    event.finalized_time = parsed.data.time;
    const origin = new URL(request.url).origin;
    let emailSent = true;
    try { await sendFinalEmails(event, participants, `${origin}/e/${id}`); }
    catch (error) { emailSent = false; console.error("Final email failed", error); }
    return Response.json({ ok: true, emailSent });
  } catch (error) {
    console.error("Finalize event failed", error);
    return Response.json({ error: "Could not schedule this event." }, { status: 500 });
  }
}
