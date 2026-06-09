-- Grounds a user follows (a subscription, distinct from bucket-list)
create table if not exists public.ground_follows (
  user_id uuid not null references auth.users(id) on delete cascade,
  venue_id uuid not null references public.venues(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, venue_id)
);

alter table public.ground_follows enable row level security;

create policy "ground follows - select" on public.ground_follows
  for select using (auth.uid() = user_id);
create policy "ground follows - insert" on public.ground_follows
  for insert with check (auth.uid() = user_id);
create policy "ground follows - delete" on public.ground_follows
  for delete using (auth.uid() = user_id);