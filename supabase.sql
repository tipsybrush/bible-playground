-- Shared leaderboard table for Bible Playground.
-- Run this once in the Supabase SQL editor.
create table if not exists public.scores (
  id bigint generated always as identity primary key,
  game text not null check (game in ('quiz', 'ladder', 'blanks', 'riddles', 'word', 'snake', 'timeline', 'ark', 'map', 'crossword', 'verse', 'trail', 'sling', 'truths')),
  name text not null check (char_length(name) between 2 and 16),
  score integer not null check (score between 1 and 1000000),
  detail text not null default '' check (char_length(detail) <= 60),
  secs integer check (secs between 0 and 86400),
  boost boolean not null default false,  -- the run used a Coin Shop power-up
  crown boolean not null default false,  -- the player owns the Golden Crown
  at bigint not null,
  created_at timestamptz not null default now()
);
create index if not exists scores_game_score on public.scores (game, score desc, secs);
-- If the table already existed before times were added:
alter table public.scores add column if not exists secs integer check (secs between 0 and 86400);
alter table public.scores add column if not exists boost boolean not null default false;
alter table public.scores add column if not exists crown boolean not null default false;

alter table public.scores enable row level security;

-- Anyone can read the boards and add a score. Nobody can edit or delete through the
-- website; remove unwanted names from the Supabase dashboard.
create policy "read scores" on public.scores for select using (true);
create policy "add a score" on public.scores for insert with check (true);
