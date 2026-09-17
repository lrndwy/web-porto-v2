-- Identity: user_profiles, the owner helper, and the shared updated_at trigger.

create table if not exists public.user_profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  role        text not null default 'EDITOR' check (role in ('OWNER', 'ADMIN', 'EDITOR')),
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Shared trigger: keeps updated_at honest on every table that has the column.
create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger user_profiles_set_updated_at
  before update on public.user_profiles
  for each row execute function public.set_updated_at();

-- Owner check. SECURITY DEFINER so RLS policies can read user_profiles without recursion.
create or replace function public.is_owner() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_profiles
    where id = auth.uid() and role = 'OWNER'
  );
$$;

alter table public.user_profiles enable row level security;

create policy "user_profiles_select_self" on public.user_profiles
  for select to authenticated
  using (id = auth.uid());

create policy "user_profiles_update_self" on public.user_profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- `role` is never client-writable; only self-service profile fields are.
revoke update on public.user_profiles from authenticated;
grant update (display_name, avatar_url) on public.user_profiles to authenticated;
