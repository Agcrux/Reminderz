import { Resend } from "resend";
import type { Booking, Event } from "./db";
import { formatSlot, shortSlot } from "./time";

function mailer() {
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM) throw new Error("Resend is not configured");
  return new Resend(process.env.RESEND_API_KEY);
}

async function send(to: string, subject: string, body: string, replyTo: string) {
  const { error } = await mailer().emails.send({
    from: process.env.RESEND_FROM!, to, subject, text: body, replyTo,
  });
  if (error) throw new Error(error.message);
}

export async function sendInvitation(event: Event, booking: Booking, guestUrl: string) {
  const when = `${formatSlot(booking.slot)} (${event.timezone})`;
  await send(booking.email, `Invitation: ${event.title} with ${event.organizer_name}, ${shortSlot(booking.slot)}`,
    `Hi ${booking.name},\n\nYou're booked for ${event.title} with ${event.organizer_name}.\n\nWhen: ${when}\nJoin Zoom: ${event.meeting_link}\n\nNeed a different time? Book again at ${guestUrl} with this email address and your meeting will move.`,
    event.organizer_email);
}

// Invites the guest, and tells the organizer unless the guest re-booked the time they already had.
export async function sendBookingEmails(event: Event, booking: Booking, previousSlot: string | null, origin: string) {
  const invitation = sendInvitation(event, booking, `${origin}/e/${event.id}`);
  if (previousSlot === booking.slot) return invitation;
  const when = `${formatSlot(booking.slot)} (${event.timezone})`;
  const change = previousSlot ? `moved their ${event.title} meeting to ${when}. It was ${formatSlot(previousSlot)}.` : `booked ${event.title} for ${when}.`;
  await Promise.all([
    invitation,
    send(event.organizer_email, `${previousSlot ? "Moved" : "New booking"}: ${booking.name}, ${shortSlot(booking.slot)}`,
      `Hi ${event.organizer_name},\n\n${booking.name} (${booking.email}) ${change}\n\nZoom: ${event.meeting_link}\n\nSee everyone who's booked: ${origin}/manage/${event.id}/${event.manage_token}`,
      booking.email),
  ]);
}
