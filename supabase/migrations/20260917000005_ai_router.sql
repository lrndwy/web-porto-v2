-- AI Router: settings, providers, models, the public key, usage logs, rate limits.

create table if not exists public.ai_router_settings (
  id                     uuid primary key default gen_random_uuid(),
  is_enabled             boolean not null default false,
  monthly_token_limit    bigint not null default 100000,
  requests_per_minute    integer not null default 10,
  requests_per_hour      integer not null default 120,
  requests_per_day       integer not null default 1000,
  quota_exceeded_message text not null default 'Monthly token quota exhausted. Try again next month.',
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create table if not exists public.ai_providers (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  base_url       text not null,
  secret_api_key text,
  is_active      boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists public.ai_models (
  id           uuid primary key default gen_random_uuid(),
  provider_id  uuid not null references public.ai_providers (id) on delete restrict,
  model_name   text not null,
  display_name text not null,
  input_price  numeric,
  output_price numeric,
  is_active    boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (provider_id, model_name)
);

create table if not exists public.ai_api_keys (
  id           uuid primary key default gen_random_uuid(),
  key_prefix   text not null,
  key_hash     text not null unique,
  label        text,
  is_active    boolean not null default true,
  last_used_at timestamptz,
  created_at   timestamptz not null default now(),
  revoked_at   timestamptz
);

create table if not exists public.ai_usage_logs (
  id            uuid primary key default gen_random_uuid(),
  api_key_id    uuid references public.ai_api_keys (id) on delete set null,
  provider_id   uuid references public.ai_providers (id) on delete set null,
  model_id      uuid references public.ai_models (id) on delete set null,
  request_id    text not null,
  input_tokens  bigint not null default 0,
  output_tokens bigint not null default 0,
  total_tokens  bigint not null default 0,
  status_code   integer not null,
  latency_ms    integer,
  error_code    text,
  created_at    timestamptz not null default now()
);

create table if not exists public.ai_rate_limits (
  id                uuid primary key default gen_random_uuid(),
  identifier        text not null,
  window_type       text not null,
  request_count     integer not null default 0,
  window_started_at timestamptz not null default now(),
  expires_at        timestamptz not null
);

-- Singleton tables: exactly one row, enforced without a surrogate column.
create unique index if not exists ai_router_settings_singleton on public.ai_router_settings ((true));

-- The window key the atomic counter upserts on.
create unique index if not exists ai_rate_limits_key on public.ai_rate_limits (identifier, window_type);

-- ai_models.display_name is the public identifier sent by router clients, so it
-- must be unambiguous: globally unique, case-insensitive.
create unique index if not exists ai_models_display_name_key on public.ai_models (lower(display_name));
create index if not exists ai_models_provider_active on public.ai_models (provider_id, is_active);

create index if not exists ai_usage_logs_created_at       on public.ai_usage_logs (created_at);
create index if not exists ai_usage_logs_model_created_at on public.ai_usage_logs (model_id, created_at);

create trigger ai_router_settings_set_updated_at before update on public.ai_router_settings for each row execute function public.set_updated_at();
create trigger ai_providers_set_updated_at       before update on public.ai_providers       for each row execute function public.set_updated_at();
create trigger ai_models_set_updated_at          before update on public.ai_models          for each row execute function public.set_updated_at();

-- Atomic fixed-window counter. A read-then-write in application code would race
-- under concurrent router requests, so the whole cycle is one statement here.
create or replace function public.ai_rate_limit_hit(
  p_identifier text, p_window_type text, p_window_seconds int, p_limit int
) returns table (allowed boolean, current_count int, reset_at timestamptz)
language plpgsql security definer set search_path = public as $$
declare v_now timestamptz := now(); v_row public.ai_rate_limits;
begin
  insert into public.ai_rate_limits
    (identifier, window_type, request_count, window_started_at, expires_at)
  values (p_identifier, p_window_type, 0, v_now, v_now + make_interval(secs => p_window_seconds))
  on conflict (identifier, window_type) do update set
    request_count = case when public.ai_rate_limits.expires_at <= v_now
                         then 0 else public.ai_rate_limits.request_count end,
    window_started_at = case when public.ai_rate_limits.expires_at <= v_now
                             then v_now else public.ai_rate_limits.window_started_at end,
    expires_at = case when public.ai_rate_limits.expires_at <= v_now
                      then v_now + make_interval(secs => p_window_seconds)
                      else public.ai_rate_limits.expires_at end
  returning * into v_row;

  if p_limit > 0 and v_row.request_count >= p_limit then
    return query select false, v_row.request_count, v_row.expires_at;
    return;
  end if;

  update public.ai_rate_limits
     set request_count = request_count + 1
   where id = v_row.id
  returning request_count, expires_at into v_row.request_count, v_row.expires_at;

  return query select true, v_row.request_count, v_row.expires_at;
end $$;

-- The router calls this with the service-role key. Client-side roles must never
-- reach it, so the default PUBLIC execute grant is revoked.
revoke all on function public.ai_rate_limit_hit(text, text, int, int)
  from public, anon, authenticated;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant execute on function public.ai_rate_limit_hit(text, text, int, int) to service_role;
  end if;
end $$;

alter table public.ai_router_settings enable row level security;
alter table public.ai_providers       enable row level security;
alter table public.ai_models          enable row level security;
alter table public.ai_api_keys        enable row level security;
alter table public.ai_usage_logs      enable row level security;
alter table public.ai_rate_limits     enable row level security;

-- No anon policy anywhere in this group: every read and write goes through a
-- service-role server route. RLS with no policy is unreadable to anon by design.
create policy "ai_router_settings_owner_all" on public.ai_router_settings
  for all to authenticated using (public.is_owner()) with check (public.is_owner());
create policy "ai_providers_owner_all" on public.ai_providers
  for all to authenticated using (public.is_owner()) with check (public.is_owner());
create policy "ai_models_owner_all" on public.ai_models
  for all to authenticated using (public.is_owner()) with check (public.is_owner());
create policy "ai_api_keys_owner_all" on public.ai_api_keys
  for all to authenticated using (public.is_owner()) with check (public.is_owner());
create policy "ai_usage_logs_owner_all" on public.ai_usage_logs
  for all to authenticated using (public.is_owner()) with check (public.is_owner());
create policy "ai_rate_limits_owner_all" on public.ai_rate_limits
  for all to authenticated using (public.is_owner()) with check (public.is_owner());
