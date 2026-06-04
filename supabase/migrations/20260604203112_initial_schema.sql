-- ══════════════════════════════════════════
-- PITCHED — Initial Schema
-- ══════════════════════════════════════════

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- ── USERS (extends Supabase auth.users) ──────────────
create table public.users (
  id              uuid primary key references auth.users(id) on delete cascade,
  username        text unique not null check (length(username) >= 3),
  display_name    text,
  avatar_url      text,
  bio             text check (length(bio) <= 300),
  location        text,
  date_of_birth   date,
  is_pro          boolean not null default false,
  is_verified     boolean not null default false,
  sport_prefs     text[] default '{}',
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── VENUES ────────────────────────────────────────────
create table public.venues (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  slug            text unique not null,
  lat             numeric(10,7),
  lng             numeric(10,7),
  capacity        integer,
  county          text,
  country         text default 'IE',
  photo_url       text,
  visitor_count   integer default 0,
  created_at      timestamptz default now()
);

-- ── TEAMS ─────────────────────────────────────────────
create table public.teams (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  slug            text unique not null,
  sport           text not null,
  county          text,
  country         text default 'IE',
  crest_url       text,
  primary_colour  text,
  follower_count  integer default 0,
  created_at      timestamptz default now()
);

-- ── COMPETITIONS ──────────────────────────────────────
create table public.competitions (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  slug            text unique not null,
  sport           text not null,
  country         text default 'IE',
  gender          text check (gender in ('women','men','mixed')),
  level           text,
  current_season  text
);

-- ── MATCHES ───────────────────────────────────────────
create table public.matches (
  id              uuid primary key default gen_random_uuid(),
  home_team_id    uuid references teams(id),
  away_team_id    uuid references teams(id),
  competition_id  uuid references competitions(id),
  venue_id        uuid references venues(id),
  kickoff_at      timestamptz not null,
  home_score      text,
  away_score      text,
  sport           text not null,
  status          text default 'upcoming' check (status in ('upcoming','live','completed')),
  external_id     text unique,
  avg_rating      numeric(3,2) default 0,
  log_count       integer default 0,
  created_at      timestamptz default now()
);

-- ── MATCH LOGS (core entity) ──────────────────────────
create table public.match_logs (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users(id) on delete cascade,
  match_id        uuid not null references public.matches(id),
  rating          numeric(2,1) check (rating >= 0.5 and rating <= 5.0 and rating * 2 = floor(rating * 2)),
  review          text check (length(review) <= 2000),
  mood            text check (mood in ('electric','emotional','tense','proud','heartbreak','joyful','dramatic','disappointing')),
  attended        boolean not null default true,
  visibility      text not null default 'public' check (visibility in ('public','friends','private')),
  like_count      integer default 0,
  comment_count   integer default 0,
  logged_at       timestamptz default now(),
  created_at      timestamptz default now(),
  unique(user_id, match_id)
);

-- ── LOG MEDIA ─────────────────────────────────────────
create table public.log_media (
  id              uuid primary key default gen_random_uuid(),
  log_id          uuid not null references match_logs(id) on delete cascade,
  media_type      text default 'photo',
  url             text not null,
  thumbnail_url   text,
  caption         text,
  sort_order      integer default 0,
  created_at      timestamptz default now()
);

-- ── SOCIAL GRAPH ──────────────────────────────────────
create table public.follows (
  follower_id     uuid not null references public.users(id) on delete cascade,
  following_id    uuid not null references public.users(id) on delete cascade,
  followed_at     timestamptz default now(),
  primary key (follower_id, following_id),
  check (follower_id != following_id)
);

-- ── LOG LIKES ─────────────────────────────────────────
create table public.log_likes (
  user_id         uuid not null references public.users(id) on delete cascade,
  log_id          uuid not null references match_logs(id) on delete cascade,
  created_at      timestamptz default now(),
  primary key (user_id, log_id)
);

-- ── GROUND COLLECTION ─────────────────────────────────
create table public.user_venues (
  user_id         uuid not null references public.users(id) on delete cascade,
  venue_id        uuid not null references public.venues(id),
  first_visited   date,
  visit_count     integer default 1,
  primary key (user_id, venue_id)
);

-- ── NOTIFICATIONS ─────────────────────────────────────
create table public.notifications (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users(id) on delete cascade,
  type            text not null,
  actor_id        uuid,
  entity_type     text,
  entity_id       uuid,
  message         text,
  is_read         boolean default false,
  created_at      timestamptz default now()
);

-- ── INDEXES ───────────────────────────────────────────
create index idx_logs_user_date    on match_logs(user_id, logged_at desc);
create index idx_logs_match         on match_logs(match_id, rating);
create index idx_matches_kickoff    on matches(kickoff_at);
create index idx_matches_sport      on matches(sport);
create index idx_notifs_user        on notifications(user_id, is_read, created_at desc);
create index idx_follows_following  on follows(following_id);

-- ── ROW LEVEL SECURITY ────────────────────────────────
alter table public.users         enable row level security;
alter table public.match_logs    enable row level security;
alter table public.notifications enable row level security;

create policy "Public profiles" on public.users for select using (true);
create policy "Own profile update" on public.users for update using (auth.uid() = id);

create policy "Public logs readable" on public.match_logs for select
  using (visibility = 'public' or user_id = auth.uid());
create policy "Own logs insert" on public.match_logs for insert with check (user_id = auth.uid());
create policy "Own logs delete" on public.match_logs for delete using (user_id = auth.uid());

create policy "Own notifications" on public.notifications for all using (user_id = auth.uid());