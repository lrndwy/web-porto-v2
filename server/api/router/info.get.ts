import { untypedClient } from '~~/server/utils/resources'

/**
 * The public read path for router state. `ai_router_settings` has no anon
 * policy, so the public nav and the `/router` page read it here instead.
 */
export default defineEventHandler(async (event) => {
  const client = untypedClient(event)

  const [settingsResult, modelsResult, providersResult, keyResult] = await Promise.all([
    client.from('ai_router_settings').select('*').limit(1).maybeSingle(),
    client.from('ai_models').select('display_name, provider_id').eq('is_active', true),
    client.from('ai_providers').select('id, name').eq('is_active', true),
    client
      .from('ai_api_keys')
      .select('key_prefix')
      .eq('is_active', true)
      .is('revoked_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  if (settingsResult.error) throwDbError(settingsResult.error)

  const settings: AiRouterSettingsRow | null = settingsResult.data
  const models: { display_name: string; provider_id: string }[] = modelsResult.data ?? []
  const providers: { id: string; name: string }[] = providersResult.data ?? []

  // Joined in code rather than with PostgREST embedding, so the shape is
  // independent of how the generated types describe the foreign key.
  const providerNameById = new Map(providers.map((provider) => [provider.id, provider.name]))
  const availableModels = models
    .filter((model) => providerNameById.has(model.provider_id))
    .map((model) => ({
      display_name: model.display_name,
      provider_name: providerNameById.get(model.provider_id) ?? '',
    }))

  const monthStart = new Date()
  monthStart.setUTCDate(1)
  monthStart.setUTCHours(0, 0, 0, 0)

  const { data: usageRows } = await client
    .from('ai_usage_logs')
    .select('total_tokens')
    .gte('created_at', monthStart.toISOString())

  const used = ((usageRows ?? []) as { total_tokens: number | null }[]).reduce(
    (sum, row) => sum + Number(row.total_tokens ?? 0),
    0,
  )
  const limit = Number(settings?.monthly_token_limit ?? 0)

  const config = useRuntimeConfig(event)
  const base = String(config.public.siteUrl || '').replace(/\/$/, '')

  const activeKey: { key_prefix: string } | null = keyResult.data

  return {
    enabled: settings?.is_enabled === true,
    endpoint: `${base}/api/router`,
    // Published on purpose: `/router` is a demo endpoint, so visitors need a key
    // that actually works. `key_hash` remains the validation path, and a key
    // stored before the whole value was kept is reported as absent rather than
    // as a prefix that would fail when used.
    key: isPublicKey(activeKey?.key_prefix) ? activeKey.key_prefix : null,
    models: availableModels,
    quota: { limit, used, remaining: Math.max(0, limit - used) },
  }
})
