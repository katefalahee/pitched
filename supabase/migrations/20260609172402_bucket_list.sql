-- A user's bucket-list of grounds they want to visit
create table if not exists public.bucket_list (
  user_id uuid not null references auth.users(id) on delete cascade,
  venue_id uuid not null references public.venues(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, venue_id)
);

alter table public.bucket_list enable row level security;

-- Users manage their own bucket-list
create policy "own bucket list - select" on public.bucket_list
  for select using (auth.uid() = user_id);
create policy "own bucket list - insert" on public.bucket_list
  for insert with check (auth.uid() = user_id);
create policy "own bucket list - delete" on public.bucket_list
  for delete using (auth.uid() = user_id);