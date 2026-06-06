-- When a new auth user is created, automatically create their public profile.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, username, display_name)
  values (
    new.id,
    -- derive a starting username from the email, plus a short random suffix to avoid clashes
    split_part(new.email, '@', 1) || '_' || substr(new.id::text, 1, 4),
    split_part(new.email, '@', 1)
  );
  return new;
end;
$$;

-- Fire the function after each new auth user is inserted
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();