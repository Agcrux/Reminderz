CREATE TABLE IF NOT EXISTS events (
  id text PRIMARY KEY,
  title text NOT NULL,
  event_date date NOT NULL,
  timezone text NOT NULL,
  organizer_name text NOT NULL,
  organizer_email text NOT NULL,
  meeting_link text NOT NULL,
  organizer_slots jsonb NOT NULL,
  manage_token text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY,
  event_id text NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  slot text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, email)
);

-- Upgrade databases created by the earlier group and individual version
DROP TABLE IF EXISTS participants;
ALTER TABLE events DROP COLUMN IF EXISTS mode;
ALTER TABLE events DROP COLUMN IF EXISTS finalized_time;
ALTER TABLE events ADD COLUMN IF NOT EXISTS meeting_link text NOT NULL;
