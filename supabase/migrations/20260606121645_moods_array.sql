-- Replace single mood with a moods array (max 3 enforced in app + a check here)
alter table public.match_logs drop column if exists mood;

alter table public.match_logs add column moods text[] not null default '{}';

-- Guardrails: at most 3 moods, and each must be from the allowed set
alter table public.match_logs add constraint moods_max_three
  check (array_length(moods, 1) is null or array_length(moods, 1) <= 3);

alter table public.match_logs add constraint moods_valid
  check (moods <@ array['electric','emotional','tense','proud','heartbreak','joyful','dramatic','disappointing']::text[]);