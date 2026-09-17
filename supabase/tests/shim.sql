-- Minimal emulation of the parts of Supabase the migrations depend on:
-- the auth and storage schemas, auth.uid(), and the anon/authenticated/
-- service_role roles. This never runs against a real project; it exists so
-- `verify-schema.sh` can apply the migrations to a throwaway Postgres.

create schema if not exists auth;
create schema if not exists storage;

create table if not exists auth.users (
  id    uuid primary key default gen_random_uuid(),
  email text
);

create table if not exists storage.buckets (
  id     text primary key,
  name   text not null,
  public boolean not null default false
);

create table if not exists storage.objects (
  id        uuid primary key default gen_random_uuid(),
  bucket_id text not null references storage.buckets (id),
  name      text not null,
  owner     uuid
);

alter table storage.objects enable row level security;

create or replace function auth.uid() returns uuid
language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin bypassrls;
  end if;
end $$;

-- Supabase grants these by default on the public schema; the migrations then
-- tighten user_profiles and revoke ai_rate_limit_hit, so the harness has to
-- start from the same baseline.
grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;

grant usage on schema storage to anon, authenticated, service_role;
grant select on storage.buckets, storage.objects to anon, authenticated, service_role;
