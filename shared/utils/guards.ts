/**
 * Narrowing helpers for values that arrive as `unknown` — thrown errors and
 * decoded JWT claims. Reading a property directly off a cast would silently
 * succeed with the wrong value; these check before they read.
 */

/** True for a plain object, narrowing to `Record<string, unknown>`. */
export function isRecord(value: unknown): value is Record<string, unknown> {
 return typeof value === 'object' && value !== null && !Array.isArray(value)
}

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

/**
 * A human-readable message from a thrown error, preferring the server's
 * `statusMessage` over ofetch's generic wrapper text.
 */
export function errorMessage(error: unknown, fallback = 'Something went wrong.'): string {
 if (typeof error !== 'object' || error === null) return fallback

 if ('data' in error) {
  const data = error.data
  if (typeof data === 'string' && data) return data
  if (typeof data === 'object' && data !== null && 'statusMessage' in data) {
   const message = data.statusMessage
   if (typeof message === 'string' && message) return message
  }
 }
 if ('statusMessage' in error && typeof error.statusMessage === 'string' && error.statusMessage) {
  return error.statusMessage
 }
 if ('message' in error && typeof error.message === 'string' && error.message) {
  return error.message
 }
 return fallback
}
