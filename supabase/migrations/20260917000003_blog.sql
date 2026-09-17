-- Blog: taxonomy, posts, and the post/tag join.

create table if not exists public.blog_categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  created_at  timestamptz not null default now()
);

create table if not exists public.blog_tags (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id               uuid primary key default gen_random_uuid(),
  author_id        uuid references auth.users (id) on delete set null,
  category_id      uuid references public.blog_categories (id) on delete set null,
  title            text not null,
  slug             text not null unique,
  excerpt          text,
  content          jsonb,
  thumbnail_url    text,
  status           text not null default 'draft'
                     check (status in ('draft', 'published', 'archived')),
  published_at     timestamptz,
  meta_title       text,
  meta_description text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table if not exists public.blog_post_tags (
  post_id uuid not null references public.blog_posts (id) on delete cascade,
  tag_id  uuid not null references public.blog_tags (id) on delete cascade,
  primary key (post_id, tag_id)
);

-- blog_posts(slug) is already indexed by its UNIQUE constraint; only the
-- listing index is missing.
create index if not exists blog_posts_status_published_at on public.blog_posts (status, published_at);
create index if not exists blog_post_tags_tag_id            on public.blog_post_tags (tag_id);

create trigger blog_posts_set_updated_at
  before update on public.blog_posts
  for each row execute function public.set_updated_at();

alter table public.blog_categories enable row level security;
alter table public.blog_tags       enable row level security;
alter table public.blog_posts      enable row level security;
alter table public.blog_post_tags  enable row level security;

-- Public taxonomy is readable by anon.
create policy "blog_categories_anon_select" on public.blog_categories
  for select to anon using (true);
create policy "blog_tags_anon_select" on public.blog_tags
  for select to anon using (true);
create policy "blog_post_tags_anon_select" on public.blog_post_tags
  for select to anon using (true);

create policy "blog_categories_owner_all" on public.blog_categories
  for all to authenticated using (public.is_owner()) with check (public.is_owner());
create policy "blog_tags_owner_all" on public.blog_tags
  for all to authenticated using (public.is_owner()) with check (public.is_owner());
create policy "blog_post_tags_owner_all" on public.blog_post_tags
  for all to authenticated using (public.is_owner()) with check (public.is_owner());

create policy "blog_posts_anon_select_published" on public.blog_posts
  for select to anon using (status = 'published' and published_at <= now());
create policy "blog_posts_owner_all" on public.blog_posts
  for all to authenticated using (public.is_owner()) with check (public.is_owner());
