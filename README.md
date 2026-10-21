# Reminderz

Share your availability for one Monday–Sunday week and let people book themselves a meeting. The organizer selects their free half-hour times on each day, adds a Zoom link, and shares one booking link. A guest picks a time, enters their name and email, and is booked immediately: the page shows the Zoom link and Resend emails the guest an invitation with it. The organizer gets an email for each booking and can see everyone on a private dashboard.

## Stack

- Next.js App Router, TypeScript, React
- Neon Postgres for events and responses
- Resend for transactional email
- Vercel for hosting

Supabase is not required. The private organizer link is a capability URL, so keep it private. There are no accounts in this initial version.

## Setup

1. Create a Neon Postgres database. Set its connection string in `.env.local`, then run `npm run db:migrate` to apply [`schema.sql`](schema.sql). The same command upgrades a database created by the earlier group and individual version; that upgrade drops its old responses table and needs the events table to be empty.
2. Verify a sending domain in Resend and create an API key.
3. Copy `.env.example` to `.env.local` and fill in `DATABASE_URL`, `RESEND_API_KEY`, and `RESEND_FROM`.
4. Run `npm install` and `npm run dev`.

## Vercel

Import this repository into Vercel. Attach Neon from the Vercel Marketplace or set `DATABASE_URL` yourself. Set `RESEND_API_KEY` and `RESEND_FROM` in the project environment variables. Pull the production environment to `.env.local` and run `npm run db:migrate` before sharing links. Deployments from the production branch then happen automatically through Vercel's Git integration.

## Notes

- Guest emails are used only for invitations and booking notices. A guest who books again with the same email moves their meeting to the new time.
- Availability is expressed in the organizer's selected time zone. A guest's device time zone does not shift the displayed slots.
- Guests can only book times the organizer selected, and times that have already passed are hidden. A booked time stays open, so several guests can choose the same time and join the same Zoom call.
- Anyone with the organizer URL can see guest names and emails. Treat it like a password.
- The app does not create calendar events or Zoom meetings. It sends guests the Zoom link the organizer provided.
