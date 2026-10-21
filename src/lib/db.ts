import { neon } from "@neondatabase/serverless";

export type Event = {
  id: string;
  title: string;
  event_date: string;
  timezone: string;
  organizer_name: string;
  organizer_email: string;
  meeting_link: string;
  organizer_slots: string[];
  manage_token: string;
};

export type Booking = {
  id: string;
  name: string;
  email: string;
  slot: string;
};

export function db() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
  return neon(process.env.DATABASE_URL);
}

export async function getEvent(id: string) {
  const sql = db();
  const rows = await sql`SELECT id, title, event_date::text AS event_date, timezone, organizer_name, organizer_email, meeting_link, organizer_slots, manage_token
    FROM events WHERE id = ${id} LIMIT 1`;
  return (rows[0] as Event | undefined) ?? null;
}

export async function getBookings(eventId: string) {
  const sql = db();
  const rows = await sql`SELECT id, name, email, slot FROM bookings WHERE event_id = ${eventId} ORDER BY slot ASC, created_at ASC`;
  return rows as Booking[];
}
