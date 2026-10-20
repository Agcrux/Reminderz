import { neon } from "@neondatabase/serverless";

export type Event = {
  id: string;
  title: string;
  event_date: string | Date;
  timezone: string;
  organizer_name: string;
  organizer_email: string;
  mode: "group" | "individual";
  organizer_slots: string[];
  manage_token: string;
  finalized_time: string | null;
};

export type Participant = {
  id: string;
  name: string;
  email: string;
  slots: string[];
  confirmed_time: string | null;
};

export function db() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
  return neon(process.env.DATABASE_URL);
}

export async function getEvent(id: string) {
  const sql = db();
  const rows = await sql`SELECT * FROM events WHERE id = ${id} LIMIT 1`;
  return (rows[0] as Event | undefined) ?? null;
}

export async function getParticipants(eventId: string) {
  const sql = db();
  const rows = await sql`SELECT id, name, email, slots, confirmed_time FROM participants WHERE event_id = ${eventId} ORDER BY created_at ASC`;
  return rows as Participant[];
}
