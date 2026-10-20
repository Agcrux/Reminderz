CREATE TABLE IF NOT EXISTS events (
  id text PRIMARY KEY,
  title text NOT NULL,
  event_date date NOT NULL,
  timezone text NOT NULL,
  organizer_name text NOT NULL,
  organizer_email text NOT NULL,
  mode text NOT NULL CHECK (mode IN ('group', 'individual')),
  organizer_slots jsonb NOT NULL,
  manage_token text NOT NULL,
  finalized_time text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS participants (
  id uuid PRIMARY KEY,
  event_id text NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  slots jsonb NOT NULL,
  confirmed_time text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, email)
);

CREATE INDEX IF NOT EXISTS participants_event_id_idx ON participants(event_id);
CREATE UNIQUE INDEX IF NOT EXISTS participants_unique_meeting_time_idx ON participants(event_id, confirmed_time) WHERE confirmed_time IS NOT NULL;
