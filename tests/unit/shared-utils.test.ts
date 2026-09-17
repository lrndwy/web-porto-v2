import { test } from 'node:test'
import assert from 'node:assert/strict'

import { slugify, uniqueSlug } from '../../shared/utils/slug.ts'
import { isBotUserAgent, parseUserAgent } from '../../shared/utils/ua.ts'
import { formatDate, formatMonthRange, formatPercent } from '../../shared/utils/format.ts'

const CHROME_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
const IPHONE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
const IPAD_UA =
  'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
const ANDROID_UA =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
const MAC_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
const EDGE_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
const FIREFOX_UA =
  'Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0'

test('slugify normalises punctuation and case', () => {
  assert.equal(slugify('Halo, Dunia!'), 'halo-dunia')
  assert.equal(slugify('  Multi   Space  '), 'multi-space')
  assert.equal(slugify('Résumé — 2026'), 'resume-2026')
})

test('slugify falls back for empty input', () => {
  assert.equal(slugify(''), 'untitled')
  assert.equal(slugify('!!!'), 'untitled')
})

test('uniqueSlug numbers collisions', () => {
  assert.equal(uniqueSlug('notes', []), 'notes')
  assert.equal(uniqueSlug('notes', ['notes']), 'notes-2')
  assert.equal(uniqueSlug('notes', ['notes', 'notes-2']), 'notes-3')
})

test('isBotUserAgent separates crawlers from browsers', () => {
  assert.equal(isBotUserAgent(CHROME_UA), false)
  assert.equal(isBotUserAgent(IPHONE_UA), false)
  assert.equal(isBotUserAgent('Googlebot/2.1 (+http://www.google.com/bot.html)'), true)
  assert.equal(isBotUserAgent(undefined), false)
})

test('parseUserAgent maps device, browser, and os', () => {
  assert.deepEqual(parseUserAgent(IPHONE_UA), {
    device_type: 'mobile',
    browser: 'safari',
    os: 'ios',
  })
  assert.deepEqual(parseUserAgent(CHROME_UA), {
    device_type: 'desktop',
    browser: 'chrome',
    os: 'windows',
  })
  assert.deepEqual(parseUserAgent(IPAD_UA), {
    device_type: 'tablet',
    browser: 'safari',
    os: 'ios',
  })
  assert.deepEqual(parseUserAgent(ANDROID_UA), {
    device_type: 'mobile',
    browser: 'chrome',
    os: 'android',
  })
  assert.deepEqual(parseUserAgent(MAC_UA), {
    device_type: 'desktop',
    browser: 'chrome',
    os: 'macos',
  })
  assert.deepEqual(parseUserAgent(EDGE_UA), {
    device_type: 'desktop',
    browser: 'edge',
    os: 'windows',
  })
  assert.deepEqual(parseUserAgent(FIREFOX_UA), {
    device_type: 'desktop',
    browser: 'firefox',
    os: 'linux',
  })
})

test('parseUserAgent handles a missing user agent', () => {
  assert.deepEqual(parseUserAgent(undefined), {
    device_type: 'unknown',
    browser: 'other',
    os: 'other',
  })
})

test('formatPercent renders one decimal by default', () => {
  assert.equal(formatPercent(0.182), '18.2%')
  assert.equal(formatPercent(0, 1), '0.0%')
  assert.equal(formatPercent(0.5, 0), '50%')
})

test('formatDate renders a stable UTC date and a dash for null', () => {
  assert.equal(formatDate('2026-09-17'), '17 Sep 2026')
  assert.equal(formatDate(null), '—')
  assert.equal(formatDate('not-a-date'), '—')
})

test('formatMonthRange covers current and finished roles', () => {
  assert.equal(formatMonthRange('2026-01-01', null, true), '2026 — Present')
  assert.equal(formatMonthRange('2024-03-01', '2026-02-28', false), '2024 — 2026')
})
