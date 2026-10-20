import { randomBytes } from "node:crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { isValidSlot, weekStart } from "@/lib/time";

const createSchema = z.object({
  title: z.string().trim().min(3).max(100),
  date: z.iso.date(),
  timezone: z.string().min(1).max(80),
  organizerName: z.string().trim().min(1).max(80),
  organizerEmail: z.email().max(254),
  mode: z.enum(["group", "individual"]),
  organizerSlots: z.array(z.string()).min(1).max(336),
  website: z.string().max(0).optional(),
});

export async function POST(request: Request) {
  try {
    if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM) {
      return Response.json({ error: "Email setup is still in progress. Please try again soon." }, { status: 503 });
    }
    const parsed = createSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: "Please check the event details." }, { status: 400 });
    const input = parsed.data;
    if (weekStart(input.date) !== input.date || input.organizerSlots.some((slot) => !isValidSlot(slot, input.date))) return Response.json({ error: "Choose valid times within a Monday–Sunday week." }, { status: 400 });
    try { new Intl.DateTimeFormat("en-US", { timeZone: input.timezone }); }
    catch { return Response.json({ error: "Choose a valid time zone." }, { status: 400 }); }
    const day = new Date(`${input.date}T12:00:00Z`);
    const now = new Date();
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: input.timezone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
    const value = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
    const today = `${value("year")}-${value("month")}-${value("day")}`;
    if (input.organizerSlots.some((slot) => slot.slice(0, 10) < today) || day.getTime() > now.getTime() + 366 * 24 * 60 * 60 * 1000) {
      return Response.json({ error: "Choose a date within the next year." }, { status: 400 });
    }

    const id = randomBytes(9).toString("base64url");
    const token = randomBytes(32).toString("base64url");
    const sql = db();
    const organizerSlots = [...new Set(input.organizerSlots)].sort();
    await sql`INSERT INTO events (id, title, event_date, timezone, organizer_name, organizer_email, mode, organizer_slots, manage_token)
      VALUES (${id}, ${input.title}, ${input.date}, ${input.timezone}, ${input.organizerName}, ${input.organizerEmail}, ${input.mode}, ${JSON.stringify(organizerSlots)}::jsonb, ${token})`;
    return Response.json({ id, token }, { status: 201 });
  } catch (error) {
    console.error("Create event failed", error);
    return Response.json({ error: "Could not create the event. Check the database setup." }, { status: 500 });
  }
}
