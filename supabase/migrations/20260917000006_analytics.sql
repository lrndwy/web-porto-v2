-- Analytics: anonymous visitors, sessions, pageviews, events.
-- No anon policy anywhere here: visitors must never read the analytics tables.
-- The owner reads them through service-role dashboard routes.

create table if not exists public.analytics_visitors (
  id            uuid primary key default gen_random_uuid(),
  visitor_hash  text not null unique,
  first_seen_at timestamptz not null default now(),
  last_seen_at  timestamptz not null default now(),
  country       text,
  region        text,
  device_type   text,
  browser       text,
  os            text
);

create table if not exists public.analytics_sessions (
  id               uuid primary key default gen_random_uuid(),
  visitor_id       uuid not null references public.analytics_visitors (id) on delete cascade,
  started_at       timestamptz not null default now(),
  last_activity_at timestamptz not null default now(),
  landing_page     text,
  exit_page        text,
  referrer         text
);

create table if not exists public.analytics_pageviews (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references public.analytics_sessions (id) on delete cascade,
  visitor_id  uuid not null references public.analytics_visitors (id) on delete cascade,
  path        text not null,
  title       text,
  viewed_at   timestamptz not null default now(),
  duration_ms integer
);

create table if not exists public.analytics_events (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.analytics_sessions (id) on delete cascade,
  visitor_id uuid not null references public.analytics_visitors (id) on delete cascade,
  event_name text not null,
  path       text,
  metadata   jsonb,
  created_at timestamptz not null default now()
);

-- docs/SUPABASE_SCHEMA.md §9 indexes plus the visitor/session rollups.
create index if not exists analytics_pageviews_viewed_at      on public.analytics_pageviews (viewed_at);
create index if not exists analytics_pageviews_path_viewed_at on public.analytics_pageviews (path, viewed_at);
create index if not exists analytics_sessions_started_at      on public.analytics_sessions (started_at);
create index if not exists analytics_events_event_created_at  on public.analytics_events (event_name, created_at);
create index if not exists analytics_visitors_last_seen       on public.analytics_visitors (last_seen_at);
create index if not exists analytics_sessions_visitor         on public.analytics_sessions (visitor_id, last_activity_at);
create index if not exists analytics_events_created_at        on public.analytics_events (created_at);

alter table public.analytics_visitors enable row level security;
alter table public.analytics_sessions enable row level security;
alter table public.analytics_pageviews enable row level security;
alter table public.analytics_events   enable row level security;

create policy "analytics_visitors_owner_select" on public.analytics_visitors
  for select to authenticated using (public.is_owner());
create policy "analytics_sessions_owner_select" on public.analytics_sessions
  for select to authenticated using (public.is_owner());
create policy "analytics_pageviews_owner_select" on public.analytics_pageviews
  for select to authenticated using (public.is_owner());
create policy "analytics_events_owner_select" on public.analytics_events
  for select to authenticated using (public.is_owner());
