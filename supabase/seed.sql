-- Seed data. Idempotent: safe to run against an already-seeded database.
--
-- `profiles`, `experiences` and `blog_posts` are deliberately left empty: the
-- public site's empty states are part of MVP acceptance, and seeding fake
-- content would hide them.

insert into public.site_settings
  (site_name, meta_title, meta_description, maintenance_mode)
select
  'Hafiz Agha Al-Baith',
  'Hafiz Agha Al-Baith — Software Engineer & Founder',
  'Portfolio, writing, and a public AI router by Hafiz Agha Al-Baith.',
  false
where not exists (select 1 from public.site_settings);

insert into public.ai_router_settings
  (is_enabled, monthly_token_limit, requests_per_minute, requests_per_hour,
   requests_per_day, quota_exceeded_message)
select
  false, 100000, 10, 120, 1000,
  'Monthly token quota exhausted. Try again next month.'
where not exists (select 1 from public.ai_router_settings);

insert into public.github_settings (username, max_projects, auto_sync)
select null, 6, false
where not exists (select 1 from public.github_settings);

insert into public.navigation_items (label, path, icon, display_order, is_visible, is_external)
select * from (values
  ('Home',       '/',            'ph:house',          0, true, false),
  ('About',      '/about',       'ph:user',           1, true, false),
  ('Experience', '/experience',  'ph:briefcase',      2, true, false),
  ('Projects',   '/projects',    'ph:folders',        3, true, false),
  ('Blog',       '/blog',        'ph:article',        4, true, false),
  ('AI Router',  '/router',      'ph:sparkle',        5, true, false),
  ('Contact',    '/contact',     'ph:envelope',       6, true, false)
) as seed(label, path, icon, display_order, is_visible, is_external)
where not exists (select 1 from public.navigation_items);

insert into public.blog_categories (name, slug, description)
values ('Notes', 'notes', 'Short-form engineering notes.')
on conflict (slug) do nothing;

insert into public.ai_providers (name, base_url, is_active)
select 'OpenAI', 'https://api.openai.com/v1', false
where not exists (select 1 from public.ai_providers where name = 'OpenAI');

insert into public.ai_models (provider_id, model_name, display_name, is_active)
select p.id, 'gpt-4o-mini', 'gpt-4o-mini', false
from public.ai_providers p
where p.name = 'OpenAI'
on conflict (provider_id, model_name) do nothing;
