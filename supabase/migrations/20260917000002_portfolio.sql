-- Portfolio: profile singleton plus the ordered/visible CMS collections.

create table if not exists public.profiles (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  title             text,
  short_description text,
  description       text,
  avatar_url        text,
  location          text,
  email             text,
  phone             text,
  github_username   text,
  website_url       text,
  is_visible        boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table if not exists public.experiences (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  organization  text not null,
  description   text,
  location      text,
  start_date    date not null,
  end_date      date,
  is_current    boolean not null default false,
  logo_url      text,
  display_order integer not null default 0,
  is_visible    boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint experiences_end_date_required_unless_current
    check (is_current or end_date is not null)
);

create table if not exists public.achievements (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  issuer           text not null,
  description      text,
  achievement_date date,
  certificate_url  text,
  image_url        text,
  display_order    integer not null default 0,
  is_visible       boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table if not exists public.educations (
  id            uuid primary key default gen_random_uuid(),
  institution   text not null,
  degree        text not null,
  field         text,
  description   text,
  start_date    date not null,
  end_date      date,
  logo_url      text,
  display_order integer not null default 0,
  is_visible    boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.socials (
  id            uuid primary key default gen_random_uuid(),
  platform      text not null,
  username      text,
  url           text not null,
  icon          text,
  display_order integer not null default 0,
  is_visible    boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.documents (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  file_path   text not null,
  file_type   text,
  file_size   bigint,
  version     text,
  is_active   boolean not null default true,
  is_visible  boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Indexes from docs/SUPABASE_SCHEMA.md §9.
create index if not exists experiences_order_visible  on public.experiences  (display_order, is_visible);
create index if not exists achievements_order_visible on public.achievements (display_order, is_visible);
create index if not exists educations_order_visible   on public.educations   (display_order, is_visible);
create index if not exists socials_order_visible      on public.socials      (display_order, is_visible);

create trigger profiles_set_updated_at     before update on public.profiles     for each row execute function public.set_updated_at();
create trigger experiences_set_updated_at  before update on public.experiences  for each row execute function public.set_updated_at();
create trigger achievements_set_updated_at before update on public.achievements for each row execute function public.set_updated_at();
create trigger educations_set_updated_at   before update on public.educations   for each row execute function public.set_updated_at();
create trigger socials_set_updated_at      before update on public.socials      for each row execute function public.set_updated_at();
create trigger documents_set_updated_at    before update on public.documents    for each row execute function public.set_updated_at();

alter table public.profiles     enable row level security;
alter table public.experiences  enable row level security;
alter table public.achievements enable row level security;
alter table public.educations   enable row level security;
alter table public.socials      enable row level security;
alter table public.documents    enable row level security;

create policy "profiles_anon_select_visible" on public.profiles
  for select to anon using (is_visible);
create policy "profiles_owner_all" on public.profiles
  for all to authenticated using (public.is_owner()) with check (public.is_owner());

create policy "experiences_anon_select_visible" on public.experiences
  for select to anon using (is_visible);
create policy "experiences_owner_all" on public.experiences
  for all to authenticated using (public.is_owner()) with check (public.is_owner());

create policy "achievements_anon_select_visible" on public.achievements
  for select to anon using (is_visible);
create policy "achievements_owner_all" on public.achievements
  for all to authenticated using (public.is_owner()) with check (public.is_owner());

create policy "educations_anon_select_visible" on public.educations
  for select to anon using (is_visible);
create policy "educations_owner_all" on public.educations
  for all to authenticated using (public.is_owner()) with check (public.is_owner());

create policy "socials_anon_select_visible" on public.socials
  for select to anon using (is_visible);
create policy "socials_owner_all" on public.socials
  for all to authenticated using (public.is_owner()) with check (public.is_owner());

create policy "documents_anon_select_active_visible" on public.documents
  for select to anon using (is_active and is_visible);
create policy "documents_owner_all" on public.documents
  for all to authenticated using (public.is_owner()) with check (public.is_owner());
