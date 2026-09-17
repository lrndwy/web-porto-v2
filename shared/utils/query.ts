/** Shared parsing for query strings across the admin and analytics routes. */

/** An integer query parameter, falling back when absent or unparseable. */
export function intParam(value: unknown, fallback: number): number {
  const raw = Array.isArray(value) ? value[0] : value
  const parsed = Number.parseInt(String(raw ?? ''), 10)
  return Number.isFinite(parsed) ? parsed : fallback
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/** A trimmed string query parameter; '' when absent. */
export function stringParam(value: unknown): string {
  const raw = Array.isArray(value) ? value[0] : value
  return typeof raw === 'string' ? raw.trim() : ''
}

/**
 * Reads a numeric property from a value the compiler only knows as `unknown` —
 * e.g. a row selected by a column name that is itself a variable. `in` cannot
 * narrow a non-literal key, so the cast is confined here and the value is
 * checked before it is used.
 */
export function readNumber(value: unknown, key: string): number | undefined {
  if (typeof value !== 'object' || value === null) return undefined
  const found = (value as Record<string, unknown>)[key]
  return typeof found === 'number' ? found : undefined
}

/** Neutralises the characters that carry meaning inside a PostgREST `or()` filter. */
export function escapeLikePattern(value: string): string {
  return value.replace(/[%_,()]/g, ' ').trim()
}
