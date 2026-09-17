-- Run once by hand against a Supabase project, after creating the Owner user in
-- the dashboard (Authentication → Users → Add user). This is not a migration:
-- it needs a real auth.users UUID, so it cannot be part of the numbered set.
--
--   psql "$DATABASE_URL" -f scripts/bootstrap-owner.sql
--
-- Replace owner_id below with that user's UUID.

do $$
declare
  owner_id   uuid := '00000000-0000-0000-0000-000000000000';
  owner_name text := 'Hafiz Agha Al-Baith';
begin
  if owner_id = '00000000-0000-0000-0000-000000000000'::uuid then
    raise exception 'Set owner_id to the UUID of the user you created in Supabase Auth.';
  end if;

  if not exists (select 1 from auth.users where id = owner_id) then
    raise exception 'No auth.users row with id %. Create the user in the dashboard first.', owner_id;
  end if;

  insert into public.user_profiles (id, display_name, role)
  values (owner_id, owner_name, 'OWNER')
  on conflict (id) do update
    set role = 'OWNER', display_name = excluded.display_name;
end $$;
