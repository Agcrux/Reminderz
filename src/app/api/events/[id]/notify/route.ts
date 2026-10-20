import { z } from "zod";
import { getEvent, getParticipants } from "@/lib/db";
import { sendFinalEmails, sendIndividualEmails } from "@/lib/email";

const notifySchema = z.object({ token: z.string(), participantId: z.uuid().optional() });

export async function POST(request: Request, context: RouteContext<"/api/events/[id]/notify">) {
  try {
    const { id } = await context.params;
    const parsed = notifySchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: "Invalid request." }, { status: 400 });
    const event = await getEvent(id);
    if (!event || event.manage_token !== parsed.data.token) return Response.json({ error: "Organizer link not found." }, { status: 404 });
    const participants = await getParticipants(id);
    const guestUrl = `${new URL(request.url).origin}/e/${id}`;
    if (event.mode === "group" && event.finalized_time && !parsed.data.participantId) {
      await sendFinalEmails(event, participants, guestUrl);
    } else if (event.mode === "individual" && parsed.data.participantId) {
      const participant = participants.find((p) => p.id === parsed.data.participantId && p.confirmed_time);
      if (!participant) return Response.json({ error: "Meeting not found." }, { status: 404 });
      await sendIndividualEmails(event, participant, guestUrl);
    } else return Response.json({ error: "This meeting has not been scheduled." }, { status: 400 });
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Reminder email failed", error);
    return Response.json({ error: "Email delivery failed. Check Resend settings and try again." }, { status: 502 });
  }
}
