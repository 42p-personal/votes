-- Run this SQL in the Supabase SQL editor:
-- https://supabase.com/dashboard/project/yfrhphvtkrcrmwjlvmen/sql

CREATE TABLE IF NOT EXISTS vote_rounds (
  id          UUID PRIMARY KEY,
  guild_id    TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'open',
  created_by  TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vote_nominations (
  id                    UUID PRIMARY KEY,
  round_id              UUID REFERENCES vote_rounds(id) ON DELETE CASCADE,
  guild_id              TEXT NOT NULL,
  steam_id              TEXT,
  name                  TEXT NOT NULL,
  cover_url             TEXT,
  steam_url             TEXT,
  platforms             TEXT DEFAULT '',
  nominated_by          TEXT NOT NULL,
  nominated_by_name     TEXT,
  nominated_by_username TEXT,
  voters                TEXT DEFAULT '[]',
  created_at            TIMESTAMPTZ DEFAULT now()
);
