import { test } from 'node:test'
import assert from 'node:assert/strict'

import {
  anthropicToOpenAI,
  anthropicToOpenAIResponse,
  openAIToAnthropic,
  openAIToAnthropicResponse,
} from '../../shared/utils/ai-format.ts'

test('anthropicToOpenAI lifts the system prompt and unwraps text blocks', () => {
  const out = anthropicToOpenAI({
    model: 'claude',
    system: 'Be terse.',
    max_tokens: 128,
    stop_sequences: ['\n\n'],
    messages: [{ role: 'user', content: [{ type: 'text', text: 'Hi' }] }],
  })

  assert.deepEqual(out.messages, [
    { role: 'system', content: 'Be terse.' },
    { role: 'user', content: [{ type: 'text', text: 'Hi' }] },
  ])
  assert.equal(out.max_tokens, 128)
  assert.deepEqual(out.stop, ['\n\n'])
  // Anthropic-only fields must not leak upstream.
  assert.equal('stop_sequences' in out, false)
  assert.equal('system' in out, false)
})

test('openAIToAnthropic folds system turns and defaults max_tokens', () => {
  const out = openAIToAnthropic({
    model: 'gpt',
    messages: [
      { role: 'system', content: 'Be terse.' },
      { role: 'user', content: 'Hi' },
    ],
    temperature: 0.2,
  })

  assert.equal(out.system, 'Be terse.')
  assert.deepEqual(out.messages, [{ role: 'user', content: 'Hi' }])
  assert.equal(out.max_tokens, 1024)
  assert.equal(out.temperature, 0.2)
  // OpenAI-only fields must not leak upstream.
  assert.equal('max_completion_tokens' in out, false)
})

test('openAIToAnthropic keeps an explicit max_tokens and maps stop', () => {
  const out = openAIToAnthropic({
    model: 'gpt',
    max_tokens: 42,
    stop: 'END',
    messages: [{ role: 'user', content: 'Hi' }],
  })

  assert.equal(out.max_tokens, 42)
  assert.deepEqual(out.stop_sequences, ['END'])
})

test('openAIToAnthropicResponse produces an Anthropic message with usage', () => {
  const out = openAIToAnthropicResponse(
    {
      id: 'chatcmpl-1',
      choices: [{ message: { role: 'assistant', content: 'Hello' }, finish_reason: 'length' }],
      usage: { prompt_tokens: 10, completion_tokens: 4 },
    },
    'claude',
  )

  assert.equal(out.type, 'message')
  assert.equal(out.model, 'claude')
  assert.deepEqual(out.content, [{ type: 'text', text: 'Hello' }])
  assert.equal(out.stop_reason, 'max_tokens')
  assert.deepEqual(out.usage, { input_tokens: 10, output_tokens: 4 })
})

test('anthropicToOpenAIResponse produces a chat completion with summed usage', () => {
  const out = anthropicToOpenAIResponse(
    {
      id: 'msg-1',
      content: [
        { type: 'text', text: 'Hel' },
        { type: 'text', text: 'lo' },
      ],
      stop_reason: 'end_turn',
      usage: { input_tokens: 7, output_tokens: 3 },
    },
    'gpt',
  )

  assert.equal(out.object, 'chat.completion')
  const choices = out.choices as { message: { content: string }; finish_reason: string }[]
  assert.equal(choices[0].message.content, 'Hello')
  assert.equal(choices[0].finish_reason, 'stop')
  assert.deepEqual(out.usage, { prompt_tokens: 7, completion_tokens: 3, total_tokens: 10 })
})
