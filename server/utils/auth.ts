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
 *
 * The role row behind a session is the dominant cost of every admin request:
 * each one re-reads the same `user_profiles` row from Supabase, and at the
 * observed round-trip time that alone is ~250 ms. The verified user id is
 * stable for the session, so the lookup is cached briefly — long enough to
 * collapse the burst of requests a single dashboard page makes, short enough
 * that a role change is felt within a minute.
 *
 * ponytail: in-process cache, keyed by user id. Move to unstorage/Redis only
 * if this ever needs sub-minute revocation across multiple instances.
 */
const OWNER_CACHE_TTL_MS = 60_000
const ownerCache = new Map<string, { identity: OwnerIdentity; expiresAt: number }>()

export async function requireOwner(event: H3Event): Promise<OwnerIdentity> {
 const userId = jwtSubject(await serverSupabaseUser(event))

 if (!userId) {
  throw createError({ statusCode: 401, statusMessage: 'unauthenticated' })
 }

 const cached = ownerCache.get(userId)
 if (cached && cached.expiresAt > Date.now()) return cached.identity

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

 const identity: OwnerIdentity = {
  userId,
  displayName: data.display_name ?? 'Owner',
  role: data.role,
 }
 // Bound the map: only owners are ever cached, so this is one entry in
 // practice, but a deleted user must not pin memory forever.
 if (ownerCache.size > 100) ownerCache.clear()
 ownerCache.set(userId, { identity, expiresAt: Date.now() + OWNER_CACHE_TTL_MS })

 return identity
}
