export type DeviceType = 'desktop' | 'mobile' | 'tablet' | 'unknown'
export type Browser = 'chrome' | 'firefox' | 'safari' | 'edge' | 'opera' | 'other'
export type Os = 'windows' | 'macos' | 'ios' | 'android' | 'linux' | 'other'

export interface ParsedUserAgent {
  device_type: DeviceType
  browser: Browser
  os: Os
}

/**
 * Regex-only classification, used when Client Hints headers are absent.
 * Order matters: Android and iOS user agents also match the Linux and macOS
 * patterns, and Chrome and Edge user agents both contain 'Safari'.
 */
export function parseUserAgent(ua: string | undefined): ParsedUserAgent {
  if (!ua) return { device_type: 'unknown', browser: 'other', os: 'other' }

  let device_type: DeviceType = 'desktop'
  if (/ipad|tablet|playbook|silk|android(?!.*mobile)/i.test(ua)) device_type = 'tablet'
  else if (/mobile|iphone|ipod|android.*mobile|windows phone|blackberry|opera mini/i.test(ua)) {
    device_type = 'mobile'
  }

  let browser: Browser = 'other'
  if (/edg[ea]?\//i.test(ua)) browser = 'edge'
  else if (/opr\/|opera/i.test(ua)) browser = 'opera'
  else if (/firefox|fxios/i.test(ua)) browser = 'firefox'
  else if (/chrome|crios/i.test(ua)) browser = 'chrome'
  else if (/safari/i.test(ua)) browser = 'safari'

  let os: Os = 'other'
  if (/iphone|ipad|ipod/i.test(ua)) os = 'ios'
  else if (/android/i.test(ua)) os = 'android'
  else if (/windows/i.test(ua)) os = 'windows'
  else if (/mac os x|macintosh/i.test(ua)) os = 'macos'
  else if (/linux|x11|cros/i.test(ua)) os = 'linux'

  return { device_type, browser, os }
}

const BOT_PATTERN = /(bot|crawler|spider|crawling|headless|pingdom|uptime|monitor|lighthouse)/i

/**
 * True for crawlers, monitors, and headless browsers that must not be counted.
 *
 * Named `isBotUserAgent` rather than `isBot` because @nuxtjs/robots
 * auto-imports its own `isBot` into the server context, which would silently
 * shadow this one.
 */
export function isBotUserAgent(ua: string | undefined): boolean {
  return !!ua && BOT_PATTERN.test(ua)
}
