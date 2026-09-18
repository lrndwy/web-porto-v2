/**
 * Translation between the two chat shapes the gateway speaks:
 *
 *   - OpenAI    `POST /v1/chat/completions` — `messages[]` with a leading
 *     `system` turn; content is a string or a list of typed parts.
 *   - Anthropic `POST /v1/messages` — a top-level `system` string and
 *     `messages[]` of `{ role, content }`, content a string or typed blocks.
 *
 * Only text and inline images are translated. Tool-call plumbing passes
 * through untouched and is only reliable when the client and the provider
 * speak the same format.
 *
 * ponytail: that is the ceiling — add a tool-call mapper when a cross-format
 * tool-using client actually shows up.
 */

import { isRecord } from './guards.ts'

type Json = Record<string, unknown>

function asArray(value: unknown): unknown[] {
 return Array.isArray(value) ? value : []
}

/** The plain text of a string or content-block list, for `system` turns. */
function contentToText(content: unknown): string {
 if (typeof content === 'string') return content
 return asArray(content)
  .map((part) => (isRecord(part) && typeof part.text === 'string' ? part.text : ''))
  .filter(Boolean)
  .join('\n')
}

/** An Anthropic content block as its OpenAI equivalent. */
function anthropicPartToOpenAI(part: unknown): unknown {
 if (!isRecord(part)) return part
 if (part.type === 'text') return { type: 'text', text: String(part.text ?? '') }
 if (part.type === 'image' && isRecord(part.source)) {
  const source = part.source
  if (source.type === 'base64') {
   const url = `data:${source.media_type ?? 'image/png'};base64,${source.data ?? ''}`
   return { type: 'image_url', image_url: { url } }
  }
  if (source.type === 'url') {
   return { type: 'image_url', image_url: { url: String(source.url ?? '') } }
  }
 }
 return part
}

/** An OpenAI content part as its Anthropic block equivalent. */
function openAIPartToAnthropic(part: unknown): unknown {
 if (!isRecord(part)) return part
 if (part.type === 'text') return { type: 'text', text: String(part.text ?? '') }
 if (part.type === 'image_url' && isRecord(part.image_url)) {
  const url = String(part.image_url.url ?? '')
  const inline = /^data:([^;]+);base64,(.*)$/s.exec(url)
  if (inline) {
   return { type: 'image', source: { type: 'base64', media_type: inline[1], data: inline[2] } }
  }
  return { type: 'image', source: { type: 'url', url } }
 }
 return part
}

/** Parameters both APIs accept, so a mixed call does not leak foreign fields. */
const OPENAI_PARAMS = ['temperature', 'top_p', 'max_tokens', 'stop'] as const
const ANTHROPIC_PARAMS = ['temperature', 'top_p', 'top_k', 'metadata'] as const

/** An Anthropic `/v1/messages` body as an OpenAI chat request. */
export function anthropicToOpenAI(body: Json): Json {
 const out: Json = {}
 for (const key of OPENAI_PARAMS) {
  if (body[key] !== undefined) out[key] = body[key]
 }
 if (body.max_tokens !== undefined) out.max_tokens = body.max_tokens
 if (body.stop_sequences !== undefined) out.stop = body.stop_sequences

 const turns: Json[] = []
 if (body.system !== undefined) turns.push({ role: 'system', content: contentToText(body.system) })
 for (const message of asArray(body.messages)) {
  if (!isRecord(message)) continue
  turns.push({
   role: typeof message.role === 'string' ? message.role : 'user',
   content: Array.isArray(message.content)
    ? message.content.map(anthropicPartToOpenAI)
    : message.content,
  })
 }
 out.messages = turns
 return out
}

/** An OpenAI chat request as an Anthropic `/v1/messages` body. */
export function openAIToAnthropic(body: Json): Json {
 const out: Json = {}
 for (const key of ANTHROPIC_PARAMS) {
  if (body[key] !== undefined) out[key] = body[key]
 }

 const systems: string[] = []
 const turns: Json[] = []
 for (const message of asArray(body.messages)) {
  if (!isRecord(message)) continue
  if (message.role === 'system') {
   systems.push(contentToText(message.content))
   continue
  }
  turns.push({
   role: message.role === 'assistant' ? 'assistant' : 'user',
   content: Array.isArray(message.content)
    ? message.content.map(openAIPartToAnthropic)
    : message.content,
  })
 }
 if (systems.length) out.system = systems.join('\n\n')
 out.messages = turns

 // Anthropic requires `max_tokens`; OpenAI leaves it optional.
 const max = Number(body.max_tokens ?? body.max_completion_tokens ?? 0)
 out.max_tokens = Number.isFinite(max) && max > 0 ? max : 1024
 if (body.stop !== undefined) {
  out.stop_sequences = Array.isArray(body.stop) ? body.stop : [body.stop]
 }
 return out
}

const FINISH_TO_ANTHROPIC: Record<string, string> = {
 stop: 'end_turn',
 length: 'max_tokens',
 tool_calls: 'tool_use',
 content_filter: 'end_turn',
}

const STOP_TO_OPENAI: Record<string, string> = {
 end_turn: 'stop',
 stop_sequence: 'stop',
 max_tokens: 'length',
 tool_use: 'tool_calls',
}

/** An OpenAI chat-completion response as an Anthropic message. */
export function openAIToAnthropicResponse(payload: Json, model: string): Json {
 const choice = asArray(payload.choices)[0]
 const message = isRecord(choice) && isRecord(choice.message) ? choice.message : {}
 const text = typeof message.content === 'string' ? message.content : ''
 const finish = isRecord(choice) && typeof choice.finish_reason === 'string' ? choice.finish_reason : ''
 const usage = isRecord(payload.usage) ? payload.usage : {}

 return {
  id: typeof payload.id === 'string' ? payload.id : `msg_${crypto.randomUUID()}`,
  type: 'message',
  role: 'assistant',
  model,
  content: [{ type: 'text', text }],
  stop_reason: FINISH_TO_ANTHROPIC[finish] ?? 'end_turn',
  stop_sequence: null,
  usage: {
   input_tokens: Number(usage.prompt_tokens ?? 0),
   output_tokens: Number(usage.completion_tokens ?? 0),
  },
 }
}

/** An Anthropic message as an OpenAI chat-completion response. */
export function anthropicToOpenAIResponse(payload: Json, model: string): Json {
 const text = asArray(payload.content)
  .map((block) => (isRecord(block) && block.type === 'text' ? String(block.text ?? '') : ''))
  .join('')
 const stop = typeof payload.stop_reason === 'string' ? payload.stop_reason : ''
 const usage = isRecord(payload.usage) ? payload.usage : {}
 const inputTokens = Number(usage.input_tokens ?? 0)
 const outputTokens = Number(usage.output_tokens ?? 0)

 return {
  id: typeof payload.id === 'string' ? payload.id : `chatcmpl-${crypto.randomUUID()}`,
  object: 'chat.completion',
  created: Math.floor(Date.now() / 1000),
  model,
  choices: [
   {
    index: 0,
    message: { role: 'assistant', content: text },
    finish_reason: STOP_TO_OPENAI[stop] ?? 'stop',
   },
  ],
  usage: {
   prompt_tokens: inputTokens,
   completion_tokens: outputTokens,
   total_tokens: inputTokens + outputTokens,
  },
 }
}
