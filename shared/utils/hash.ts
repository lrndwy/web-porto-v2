/** SHA-256 as lowercase hex. Works on the server and in workers. */
export async function sha256hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

const BASE62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

/** `pk_uhuy_` plus 32 characters of CSPRNG output. */
export function generatePublicKey(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  let key = ''
  for (const byte of bytes) key += BASE62[byte % BASE62.length]
  return `pk_uhuy_${key}`
}

/**
 * Matches a complete key: a `pk_` prefix, a short slug, then the 32-character
 * body. Deliberately prefix-agnostic so keys issued under an older prefix stay
 * valid and displayable.
 */
const PUBLIC_KEY_PATTERN = /^pk_[a-z0-9]+_[A-Za-z0-9]{32}$/

/**
 * True only for a complete key. Rows written before the whole key was stored
 * hold its first 20 characters and nothing else — that prefix can never be
 * turned back into a working key, so callers must treat it as "nothing to
 * show" rather than publishing a value that looks like a key and is not one.
 */
export function isPublicKey(value: string | null | undefined): value is string {
  return typeof value === 'string' && PUBLIC_KEY_PATTERN.test(value)
}
