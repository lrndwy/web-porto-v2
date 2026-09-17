-- Schema assertions. Every block raises on failure, so the script exits non-zero
-- the moment a migration, policy, or function regresses.

\set ON_ERROR_STOP on

-- 1. The rate-limit counter is atomic and honours the limit.
do $$
declare a boolean; b boolean; c boolean;
begin
  select allowed into a from public.ai_rate_limit_hit('probe', 'minute', 60, 2);
  select allowed into b from public.ai_rate_limit_hit('probe', 'minute', 60, 2);
  select allowed into c from public.ai_rate_limit_hit('probe', 'minute', 60, 2);
  if not (a and b and not c) then
    raise exception 'ai_rate_limit_hit expected true,true,false got %,%,%', a, b, c;
  end if;
end $$;

-- 2. A limit of 0 means unlimited.
do $$
declare a boolean;
begin
  select allowed into a from public.ai_rate_limit_hit('unlimited', 'day', 60, 0);
  if not a then
    raise exception 'ai_rate_limit_hit with p_limit=0 should allow';
  end if;
end $$;

-- 3. A client role cannot execute the counter.
do $$
declare denied boolean := false;
begin
  set role authenticated;
  begin
    perform public.ai_rate_limit_hit('probe', 'minute', 60, 2);
  exception when insufficient_privilege then
    denied := true;
  end;
  reset role;
  if not denied then
    raise exception 'authenticated must not execute ai_rate_limit_hit';
  end if;
end $$;

-- 4. Singleton tables accept exactly one row.
do $$
declare blocked boolean := false;
begin
  begin
    insert into public.ai_router_settings (is_enabled) values (true);
  exception when unique_violation then
    blocked := true;
  end;
  if not blocked then
    raise exception 'ai_router_settings singleton index did not block a second row';
  end if;
end $$;

-- 5. anon cannot read router secrets, analytics, or settings tables.
do $$
declare n int;
begin
  set role anon;
  select count(*) into n from public.ai_providers;
  if n <> 0 then raise exception 'anon read % ai_providers rows', n; end if;
  select count(*) into n from public.ai_usage_logs;
  if n <> 0 then raise exception 'anon read % ai_usage_logs rows', n; end if;
  select count(*) into n from public.analytics_pageviews;
  if n <> 0 then raise exception 'anon read % analytics_pageviews rows', n; end if;
  select count(*) into n from public.github_settings;
  if n <> 0 then raise exception 'anon read % github_settings rows', n; end if;
  reset role;
end $$;

-- 6. anon sees only visible portfolio rows.
do $$
declare n int;
begin
  insert into public.experiences (title, organization, start_date, end_date, is_visible)
    values ('Visible role', 'Acme', '2024-01-01', '2024-12-31', true),
           ('Hidden role', 'Acme', '2023-01-01', '2023-12-31', false);

  set role anon;
  select count(*) into n from public.experiences;
  if n <> 1 then raise exception 'anon saw % experiences, expected 1', n; end if;
  reset role;

  set role authenticated;
  select count(*) into n from public.experiences;
  reset role;
  if n <> 0 then raise exception 'non-owner authenticated saw % experiences', n; end if;
end $$;

-- 7. anon sees only published, non-future posts.
do $$
declare n int;
begin
  insert into public.blog_posts (title, slug, status, published_at) values
    ('Live',    'live',    'published', now() - interval '1 day'),
    ('Draft',   'draft',   'draft',     null),
    ('Future',  'future',  'published', now() + interval '1 day'),
    ('Archive', 'archive', 'archived',  now() - interval '2 days');

  set role anon;
  select count(*) into n from public.blog_posts;
  if n <> 1 then raise exception 'anon saw % blog_posts, expected 1', n; end if;
  reset role;
end $$;

-- 8. The owner sees everything, and is_owner() reflects user_profiles.
do $$
declare n int; uid uuid := gen_random_uuid();
begin
  insert into auth.users (id) values (uid);
  insert into public.user_profiles (id, display_name, role) values (uid, 'Owner', 'OWNER');

  perform set_config('request.jwt.claim.sub', uid::text, false);
  set role authenticated;
  select count(*) into n from public.experiences;
  reset role;
  if n <> 2 then raise exception 'owner saw % experiences, expected 2', n; end if;
end $$;

-- 9. A non-owner cannot promote themselves to OWNER.
do $$
declare uid uuid := gen_random_uuid(); blocked boolean := false;
begin
  insert into auth.users (id) values (uid);
  insert into public.user_profiles (id, display_name, role) values (uid, 'Editor', 'EDITOR');

  perform set_config('request.jwt.claim.sub', uid::text, false);
  set role authenticated;
  begin
    update public.user_profiles set role = 'OWNER' where id = uid;
  exception when insufficient_privilege then
    blocked := true;
  end;
  reset role;

  if not blocked then
    raise exception 'a non-owner escalated their own role to OWNER';
  end if;
end $$;

-- 10. A non-owner cannot escalate through a writable column either.
do $$
declare uid uuid := gen_random_uuid(); still text;
begin
  insert into auth.users (id) values (uid);
  insert into public.user_profiles (id, display_name, role) values (uid, 'Editor', 'EDITOR');

  perform set_config('request.jwt.claim.sub', uid::text, false);
  set role authenticated;
  update public.user_profiles set display_name = 'Renamed' where id = uid;
  reset role;

  select role into still from public.user_profiles where id = uid;
  if still <> 'EDITOR' then
    raise exception 'role changed to % during a display_name update', still;
  end if;
end $$;

-- 11. updated_at actually moves on update.
--     now() is transaction-scoped, so the insert and the update must happen in
--     separate statements to observe a change.
with ins as (
  insert into public.socials (platform, url) values ('GitHub', 'https://github.com/x')
  returning id, updated_at
)
select id, updated_at into temp table t11 from ins;

do $$
declare before_ts timestamptz; after_ts timestamptz; rid uuid;
begin
  select id, updated_at into rid, before_ts from t11;
  update public.socials set platform = 'GitLab' where id = rid returning updated_at into after_ts;
  if after_ts <= before_ts then
    raise exception 'updated_at did not advance (before %, after %)', before_ts, after_ts;
  end if;
end $$;

-- 12. ai_models.display_name is unique case-insensitively.
do $$
declare pid uuid; blocked boolean := false;
begin
  select id into pid from public.ai_providers where name = 'OpenAI';
  if pid is null then raise exception 'seed did not create the OpenAI provider'; end if;

  begin
    insert into public.ai_models (provider_id, model_name, display_name)
      values (pid, 'gpt-4o-mini-2', 'GPT-4O-MINI');
  exception when unique_violation then
    blocked := true;
  end;
  if not blocked then
    raise exception 'display_name collided case-insensitively without error';
  end if;
end $$;

-- 13. The seed is idempotent.
do $$
declare nav int; settings int;
begin
  select count(*) into nav from public.navigation_items;
  if nav <> 7 then raise exception 'expected 7 navigation items, got %', nav; end if;
  select count(*) into settings from public.site_settings;
  if settings <> 1 then raise exception 'expected 1 site_settings row, got %', settings; end if;
end $$;

-- 14. Storage: all five buckets exist, four are public, and anon can list only
--     the public ones.
do $$
declare n int;
begin
  select count(*) into n from storage.buckets;
  if n <> 5 then raise exception 'expected 5 buckets, got %', n; end if;
  select count(*) into n from storage.buckets where public;
  if n <> 4 then raise exception 'expected 4 public buckets, got %', n; end if;
  if (select public from storage.buckets where id = 'documents') then
    raise exception 'documents bucket must be private';
  end if;

  insert into storage.objects (bucket_id, name) values
    ('avatars', 'public.png'), ('documents', 'private.pdf');

  set role anon;
  select count(*) into n from storage.objects;
  reset role;
  if n <> 1 then raise exception 'anon listed % storage objects, expected 1', n; end if;
end $$;

select 'all schema assertions passed' as result;
