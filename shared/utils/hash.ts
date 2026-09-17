/** SHA-256 as lowercase hex. Works on the server and in workers. */
export async function sha256hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

const BASE62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

/** `pk_portfolio_` plus 32 characters of CSPRNG output. */
export function generatePublicKey(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  let key = ''
  for (const byte of bytes) key += BASE62[byte % BASE62.length]
  return `pk_portfolio_${key}`
}
