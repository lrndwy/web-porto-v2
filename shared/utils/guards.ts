/**
 * Narrowing helpers for values that arrive as `unknown` — thrown errors and
 * decoded JWT claims. Reading a property directly off a cast would silently
 * succeed with the wrong value; these check before they read.
 */

/** The HTTP status of a thrown Nuxt/ofetch error, when it has one. */
export function errorStatusCode(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null || !('statusCode' in error)) return undefined
  const code = error.statusCode
  return typeof code === 'number' ? code : undefined
}

/** The `sub` claim, which is the authenticated user's id. */
export function jwtSubject(claims: unknown): string | undefined {
  if (typeof claims !== 'object' || claims === null || !('sub' in claims)) return undefined
  const sub = claims.sub
  return typeof sub === 'string' ? sub : undefined
}
