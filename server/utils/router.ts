import type { SupabaseClient } from '@supabase/supabase-js'

export const MODEL_SELECT = '*, ai_providers(name)'

/**
 * `display_name` is how router clients address a model, so a case-insensitive
 * collision would make routing ambiguous. Refusing it here keeps the invariant
 * (which the database index also enforces) explicable to the Owner.
 */
export async function assertDisplayNameFree(
  client: SupabaseClient,
  displayName: string,
  ignoreId?: string,
): Promise<void> {
  let request = client.from('ai_models').select('id, display_name').ilike('display_name', displayName)
  if (ignoreId) request = request.neq('id', ignoreId)

  const { data } = await request
  const clash = ((data ?? []) as unknown as { display_name: string }[]).find(
    (row) => row.display_name.toLowerCase() === displayName.toLowerCase(),
  )
  if (clash) {
    throw createError({
      statusCode: 409,
      statusMessage: `"${clash.display_name}" already uses that display name.`,
    })
  }
}
