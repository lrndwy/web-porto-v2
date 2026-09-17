-- The public router key is meant to be published: `/router` hands it to
-- visitors so they can call the endpoint, and it is bounded by the rate limits
-- and the monthly token quota rather than by secrecy.
--
-- `key_hash` stays the lookup path for validation; `key_plain` exists only so
-- the Owner can display and copy the working key at any time instead of only
-- once at generation. Keys created before this migration have no plaintext and
-- fall back to showing their prefix until they are regenerated.

alter table public.ai_api_keys
  add column if not exists key_plain text;

comment on column public.ai_api_keys.key_plain is
  'The public key in plaintext, for display on /router and in the dashboard. Public by design; never a provider secret.';
