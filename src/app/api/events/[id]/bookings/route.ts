import { randomUUID } from "node:crypto";
import { z } from "zod";
import { db, getEvent, type Booking } from "@/lib/db";
import { sendBookingEmails } from "@/lib/email";
import { isUpcoming, isValidSlot } from "@/lib/time";

const bookingSchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.email().max(254),
  slot: z.string(),
  website: z.string().max(0).optional(),
});

export async function POST(request: Request, context: RouteContext<"/api/events/[id]/bookings">) {
  try {
    const { id } = await context.params;
    const event = await getEvent(id);
    if (!event) return Response.json({ error: "Event not found." }, { status: 404 });
    const parsed = bookingSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: "Enter your name, email, and a time." }, { status: 400 });
    const input = parsed.data;
    if (!isValidSlot(input.slot, event.event_date) || !event.organizer_slots.includes(input.slot) || !isUpcoming(input.slot, event.timezone)) {
      return Response.json({ error: "That time is no longer available. Choose another." }, { status: 400 });
    }
    // Times stay open after a booking, so several guests can share one. Booking again with the same email moves that guest's meeting.
    const email = input.email.toLowerCase();
    const sql = db();
    const rows = await sql`WITH previous AS (SELECT slot FROM bookings WHERE event_id = ${id} AND email = ${email})
      INSERT INTO bookings (id, event_id, name, email, slot)
      VALUES (${randomUUID()}, ${id}, ${input.name}, ${email}, ${input.slot})
      ON CONFLICT (event_id, email) DO UPDATE SET name = EXCLUDED.name, slot = EXCLUDED.slot, updated_at = now()
      RETURNING id, name, email, slot, (SELECT slot FROM previous) AS previous_slot`;
    const { previous_slot: previousSlot, ...booking } = rows[0] as Booking & { previous_slot: string | null };
    let emailSent = true;
    try { await sendBookingEmails(event, booking, previousSlot, new URL(request.url).origin); }
    catch (error) { emailSent = false; console.error("Booking email failed", error); }
    return Response.json({ ok: true, slot: booking.slot, meetingLink: event.meeting_link, emailSent });
  } catch (error) {
    console.error("Booking failed", error);
    return Response.json({ error: "Could not book this time." }, { status: 500 });
  }
}
