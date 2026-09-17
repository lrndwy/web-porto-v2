/**
 * Token accounting for an upstream OpenAI-compatible response.
 *
 * Providers are inconsistent: some send only `prompt_tokens` and
 * `completion_tokens`, some only `total_tokens`, some send all three with a
 * `total_tokens` that disagrees with the sum. Getting this wrong silently
 * mis-bills the quota, so the explicit total wins and the parts are only summed
 * when it is missing.
 */
export function parseUsage(raw: unknown): {
  input_tokens: number
  output_tokens: number
  total_tokens: number
} {
  if (typeof raw !== 'object' || raw === null) {
    return { input_tokens: 0, output_tokens: 0, total_tokens: 0 }
  }

  const usage = raw as Record<string, unknown>
  const number = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : 0)

  const input_tokens = number(usage.prompt_tokens)
  const output_tokens = number(usage.completion_tokens)
  const explicitTotal = typeof usage.total_tokens === 'number' ? number(usage.total_tokens) : null

  return {
    input_tokens,
    output_tokens,
    total_tokens: explicitTotal ?? input_tokens + output_tokens,
  }
}
