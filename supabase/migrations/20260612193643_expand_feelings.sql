-- Drop the actual old constraint (now we know its name)
alter table public.match_logs drop constraint if exists moods_valid;

-- Also drop the new one if a partial run added it
alter table public.match_logs drop constraint if exists match_logs_feelings_check;

-- Translate retired values in existing rows
update public.match_logs set moods = array_replace(moods, 'heartbreak', 'heartbreaking') where 'heartbreak' = any(moods);
update public.match_logs set moods = array_replace(moods, 'dramatic', 'historic') where 'dramatic' = any(moods);
update public.match_logs set moods = array_replace(moods, 'disappointing', 'frustrating') where 'disappointing' = any(moods);

-- Add the new constraint with all 12 feelings
alter table public.match_logs
  add constraint match_logs_feelings_check
  check (
    moods <@ ARRAY[
      'electric','tense','joyful','heartbreaking','loud','historic',
      'quiet','relieved','frustrating','euphoric','proud','emotional'
    ]::text[]
  );