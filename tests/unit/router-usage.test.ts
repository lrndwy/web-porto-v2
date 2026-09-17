import { test } from 'node:test'
import assert from 'node:assert/strict'

import { parseUsage } from '../../shared/utils/usage.ts'
import { generatePublicKey, sha256hex } from '../../shared/utils/hash.ts'

test('parseUsage sums input and output when the total is absent', () => {
  assert.deepEqual(parseUsage({ prompt_tokens: 10, completion_tokens: 5 }), {
    input_tokens: 10,
    output_tokens: 5,
    total_tokens: 15,
  })
})

test('parseUsage trusts an explicit total, even when it disagrees', () => {
  assert.deepEqual(parseUsage({ total_tokens: 99 }), {
    input_tokens: 0,
    output_tokens: 0,
    total_tokens: 99,
  })
  assert.deepEqual(parseUsage({ prompt_tokens: 10, completion_tokens: 5, total_tokens: 5 }), {
    input_tokens: 10,
    output_tokens: 5,
    total_tokens: 5,
  })
})

test('parseUsage returns zeros for missing or malformed usage', () => {
  const zeros = { input_tokens: 0, output_tokens: 0, total_tokens: 0 }
  assert.deepEqual(parseUsage({}), zeros)
  assert.deepEqual(parseUsage(undefined), zeros)
  assert.deepEqual(parseUsage(null), zeros)
  assert.deepEqual(parseUsage({ prompt_tokens: 'ten' }), zeros)
  assert.deepEqual(parseUsage({ prompt_tokens: Number.NaN }), zeros)
})

test('public keys carry the expected shape and hash stably', async () => {
  const key = generatePublicKey()
  assert.match(key, /^pk_portfolio_[0-9A-Za-z]{32}$/)
  assert.notEqual(key, generatePublicKey())

  const digest = await sha256hex(key)
  assert.match(digest, /^[0-9a-f]{64}$/)
  assert.equal(digest, await sha256hex(key))
})
