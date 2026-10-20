import { randomUUID } from "node:crypto";
import { z } from "zod";
import { db, getEvent } from "@/lib/db";
import { isValidSlot } from "@/lib/time";

const availabilitySchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.email().max(254),
  slots: z.array(z.string()).min(1).max(336),
  website: z.string().max(0).optional(),
});

export async function POST(request: Request, context: RouteContext<"/api/events/[id]/availability">) {
  try {
    const { id } = await context.params;
    const event = await getEvent(id);
    if (!event) return Response.json({ error: "Event not found." }, { status: 404 });
    if (event.finalized_time) return Response.json({ error: "This event is already scheduled." }, { status: 409 });
    const parsed = availabilitySchema.safeParse(await request.json());
    if (!parsed.success || parsed.data.slots.some((slot) => !isValidSlot(slot, event.event_date) || !event.organizer_slots.includes(slot))) {
      return Response.json({ error: "Enter your name, email, and at least one time." }, { status: 400 });
    }
    const input = parsed.data;
    const slots = [...new Set(input.slots)].sort();
    const sql = db();
    if (event.mode === "individual") {
      const booked = await sql`SELECT confirmed_time FROM participants WHERE event_id = ${id} AND confirmed_time IS NOT NULL`;
      if (booked.some((row) => slots.includes(row.confirmed_time as string))) return Response.json({ error: "One of those times was just booked. Refresh and try again." }, { status: 409 });
    }
    const rows = await sql`INSERT INTO participants (id, event_id, name, email, slots)
      VALUES (${randomUUID()}, ${id}, ${input.name}, ${input.email.toLowerCase()}, ${JSON.stringify(slots)}::jsonb)
      ON CONFLICT (event_id, email) DO UPDATE SET name = EXCLUDED.name, slots = EXCLUDED.slots
      WHERE participants.confirmed_time IS NULL
      RETURNING id`;
    if (!rows.length) return Response.json({ error: "Your meeting is already scheduled." }, { status: 409 });
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Availability submission failed", error);
    return Response.json({ error: "Could not save your availability." }, { status: 500 });
  }
}
