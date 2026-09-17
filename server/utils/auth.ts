import type { H3Event } from 'h3'
// The Supabase module exposes its server helpers through this alias; it does
// not register them as Nitro auto-imports.
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

/**
 * The single authorisation gate for every `/api/admin/**` handler and
 * `GET /api/me`.
 *
 * It is a utility rather than a server middleware on purpose: a path-matching
 * middleware silently stops covering a route the moment a new one is added,
 * while a missing first statement here is visible in the handler itself.
 *
 * 401 when there is no session, 403 when the session is not an OWNER.
 */
export async function requireOwner(event: H3Event): Promise<OwnerIdentity> {
  const userId = jwtSubject(await serverSupabaseUser(event))

  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: 'unauthenticated' })
  }

  const client = await serverSupabaseClient(event)
  const { data, error } = await client
    .from('user_profiles')
    .select('display_name, role')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'profile_lookup_failed' })
  }

  // No profile row, or a non-OWNER role: authenticated but not authorised.
  if (!data || data.role !== 'OWNER') {
    throw createError({ statusCode: 403, statusMessage: 'forbidden' })
  }

  return {
    userId,
    displayName: data.display_name ?? 'Owner',
    role: data.role,
  }
}
