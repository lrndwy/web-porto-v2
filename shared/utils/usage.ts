/**
 * Token accounting for an upstream chat response, in either shape the gateway
 * speaks.
 *
 * OpenAI reports `prompt_tokens` / `completion_tokens`; Anthropic reports
 * `input_tokens` / `output_tokens`. Providers are inconsistent within a shape
 * too: some send only one half, some send a `total_tokens` that disagrees with
 * the sum. Getting this wrong silently mis-bills the quota, so an explicit
 * total wins and the parts are only summed when it is missing.
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
 const number = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isFinite(value) ? value : undefined

 const input_tokens = number(usage.prompt_tokens) ?? number(usage.input_tokens) ?? 0
 const output_tokens = number(usage.completion_tokens) ?? number(usage.output_tokens) ?? 0
 const explicitTotal = number(usage.total_tokens)

 return {
  input_tokens,
  output_tokens,
  total_tokens: explicitTotal ?? input_tokens + output_tokens,
 }
}
