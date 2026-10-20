# Reminderz

Group scheduling for one day. An organizer creates an event, selects their available half-hour slots, and shares a guest link. Guests enter their name, email, and choose from the organizer's slots. The organizer can choose one time for the group or schedule separate meetings with each guest. Resend emails the organizer and affected guests after each time is confirmed.

## Stack

- Next.js App Router, TypeScript, React
- Neon Postgres for events and responses
- Resend for transactional email
- Vercel for hosting

Supabase is not required. The private organizer link is a capability URL, so keep it private. There are no accounts in this initial version.

## Setup

1. Create a Neon Postgres database. Run [`schema.sql`](schema.sql) in its SQL editor.
2. Verify a sending domain in Resend and create an API key.
3. Copy `.env.example` to `.env.local` and fill in `DATABASE_URL`, `RESEND_API_KEY`, and `RESEND_FROM`.
4. Run `npm install` and `npm run dev`.

## Vercel

Import this repository into Vercel. Attach Neon from the Vercel Marketplace or set `DATABASE_URL` yourself. Set `RESEND_API_KEY` and `RESEND_FROM` in the project environment variables. Run `schema.sql` against the production database before sharing links. Deployments from the production branch then happen automatically through Vercel's Git integration.

## Notes

- Guest emails are used only for scheduling notices. Guests may update their availability by submitting again with the same email.
- Availability is expressed in the organizer's selected time zone. A guest's device time zone does not shift the displayed slots.
- Only times the organizer selected can be offered to guests or confirmed. One-to-one meetings cannot be booked twice at the same time.
- Anyone with the organizer URL can see guest names and emails and finalize the event. Treat it like a password.
- The app does not create calendar events or video meeting links.
