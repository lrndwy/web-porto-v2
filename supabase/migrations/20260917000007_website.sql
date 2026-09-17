-- Website: the settings singleton and the navigation menu.

create table if not exists public.site_settings (
  id               uuid primary key default gen_random_uuid(),
  site_name        text not null,
  logo_url         text,
  favicon_url      text,
  meta_title       text,
  meta_description text,
  og_image_url     text,
  maintenance_mode boolean not null default false,
  updated_at       timestamptz not null default now()
);

create table if not exists public.navigation_items (
  id            uuid primary key default gen_random_uuid(),
  label         text not null,
  path          text not null,
  icon          text,
  display_order integer not null default 0,
  is_visible    boolean not null default true,
  is_external   boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create unique index if not exists site_settings_singleton on public.site_settings ((true));
create index if not exists navigation_items_order_visible on public.navigation_items (display_order, is_visible);

create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();
create trigger navigation_items_set_updated_at
  before update on public.navigation_items
  for each row execute function public.set_updated_at();

alter table public.site_settings    enable row level security;
alter table public.navigation_items enable row level security;

-- Site name / logo / meta are needed to render the public shell.
create policy "site_settings_anon_select" on public.site_settings
  for select to anon using (true);
create policy "site_settings_owner_update" on public.site_settings
  for update to authenticated using (public.is_owner()) with check (public.is_owner());

create policy "navigation_items_anon_select_visible" on public.navigation_items
  for select to anon using (is_visible);
create policy "navigation_items_owner_all" on public.navigation_items
  for all to authenticated using (public.is_owner()) with check (public.is_owner());
