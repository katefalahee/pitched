select conname, pg_get_constraintdef(oid)
from pg_constraint
where conrelid = 'public.match_logs'::regclass and contype = 'c';