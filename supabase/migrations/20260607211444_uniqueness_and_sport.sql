-- ══════════════════════════════════════════
-- Uniqueness constraint + constrained sport category
-- ══════════════════════════════════════════

-- 1. Uniqueness: a match is unique by home team + away team + kickoff timestamp.
--    (kickoff_at is a full timestamp, so it captures both date and time.)
alter table public.matches
  add constraint matches_unique_fixture
  unique (home_team_id, away_team_id, kickoff_at);

-- 2. Constrain the sport field on matches to the agreed category list.
alter table public.matches
  add constraint matches_sport_valid
  check (sport in (
    'lgfa', 'camogie', 'gaa_football', 'hurling',
    'womens_soccer', 'mens_soccer', 'womens_rugby', 'mens_rugby',
    'afl', 'aflw'
  ));

-- 3. Same constrained sport category on teams.
alter table public.teams
  add constraint teams_sport_valid
  check (sport in (
    'lgfa', 'camogie', 'gaa_football', 'hurling',
    'womens_soccer', 'mens_soccer', 'womens_rugby', 'mens_rugby',
    'afl', 'aflw'
  ));