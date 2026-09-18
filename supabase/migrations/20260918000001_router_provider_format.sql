-- Providers speak either the OpenAI chat-completions shape or the Anthropic
-- messages shape. The gateway translates between the client's format and the
-- provider's, so this single column decides the upstream path, the auth header,
-- and the request/response body shape.

alter table public.ai_providers
  add column if not exists format text not null default 'openai';

alter table public.ai_providers
  drop constraint if exists ai_providers_format_check;

alter table public.ai_providers
  add constraint ai_providers_format_check check (format in ('openai', 'anthropic'));
