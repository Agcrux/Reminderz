import { Resend } from "resend";
import type { Event, Participant } from "./db";
import { formatDate, formatTime } from "./time";

function mailer() {
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM) throw new Error("Resend is not configured");
  return new Resend(process.env.RESEND_API_KEY);
}

async function send(to: string, subject: string, body: string) {
  const { error } = await mailer().emails.send({
    from: process.env.RESEND_FROM!, to, subject, text: body,
  });
  if (error) throw new Error(error.message);
}

export async function sendFinalEmails(event: Event, participants: Participant[], guestUrl: string) {
  if (!event.finalized_time) return;
  const when = `${formatDate(event.event_date)} at ${formatTime(event.finalized_time)} (${event.timezone})`;
  const message = `${event.title} is set for ${when}.\n\nView the event: ${guestUrl}`;
  await Promise.all([
    send(event.organizer_email, `${event.title} is scheduled`, `Hi ${event.organizer_name},\n\n${message}`),
    ...participants.map((p) => send(p.email, `${event.title} is scheduled`, `Hi ${p.name},\n\n${message}`)),
  ]);
}

export async function sendIndividualEmails(event: Event, participant: Participant, guestUrl: string) {
  if (!participant.confirmed_time) return;
  const when = `${formatDate(event.event_date)} at ${formatTime(participant.confirmed_time)} (${event.timezone})`;
  await Promise.all([
    send(event.organizer_email, `Meeting with ${participant.name} is scheduled`, `Hi ${event.organizer_name},\n\nYour meeting with ${participant.name} (${participant.email}) is set for ${when}.\n\nView the event: ${guestUrl}`),
    send(participant.email, `${event.title} is scheduled`, `Hi ${participant.name},\n\nYour meeting with ${event.organizer_name} is set for ${when}.\n\nView the event: ${guestUrl}`),
  ]);
}
