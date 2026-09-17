-- GitHub: sync settings singleton plus the cached repository mirror.

create table if not exists public.github_settings (
  id             uuid primary key default gen_random_uuid(),
  username       text,
  max_projects   integer not null default 6,
  auto_sync      boolean not null default false,
  last_synced_at timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists public.github_repositories (
  id            uuid primary key default gen_random_uuid(),
  github_id     bigint not null unique,
  name          text not null,
  full_name     text not null,
  description   text,
  html_url      text not null,
  homepage_url  text,
  language      text,
  stars         integer not null default 0,
  forks         integer not null default 0,
  pushed_at     timestamptz,
  is_featured   boolean not null default false,
  is_visible    boolean not null default true,
  display_order integer not null default 0,
  synced_at     timestamptz not null default now()
);

-- Singleton: exactly one settings row, no surrogate column needed.
create unique index if not exists github_settings_singleton on public.github_settings ((true));

create index if not exists github_repositories_pushed_at        on public.github_repositories (pushed_at);
create index if not exists github_repositories_featured_visible on public.github_repositories (is_featured, is_visible);

create trigger github_settings_set_updated_at
  before update on public.github_settings
  for each row execute function public.set_updated_at();

alter table public.github_settings     enable row level security;
alter table public.github_repositories enable row level security;

create policy "github_repositories_anon_select_visible" on public.github_repositories
  for select to anon using (is_visible);
create policy "github_repositories_owner_all" on public.github_repositories
  for all to authenticated using (public.is_owner()) with check (public.is_owner());

-- Settings hold the sync username and are never anon-readable.
create policy "github_settings_owner_all" on public.github_settings
  for all to authenticated using (public.is_owner()) with check (public.is_owner());
