import { z } from 'zod'
import { serverSupabaseServiceRole } from '#supabase/server'

/** The dashboard's vocabulary; anything else is namespaced as `custom:`. */
const KNOWN_EVENTS = new Set([
  'page_view',
  'cv_download',
  'github_click',
  'social_click',
  'project_view',
  'blog_view',
  'contact_submit',
  'ai_router_request',
])

const SESSION_COOKIE = 'wp_sid'
const SESSION_IDLE_SECONDS = 30 * 60

const bodySchema = z.object({
  path: z.string().max(500).optional(),
  title: z.string().max(300).optional(),
  referrer: z.string().max(1000).optional(),
  event: z.string().max(100).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  duration_ms: z.number().int().min(0).max(86_400_000).optional(),
  /** Marks a dwell update for the page being left, not a new page view. */
  dwell: z.boolean().optional(),
})

/**
 * Anonymous ingest. It always answers 204 and never surfaces an error: a
 * visitor's page must not break because analytics could not be written.
 */
export default defineEventHandler(async (event) => {
  try {
    setResponseStatus(event, 204)

    const userAgent = getHeader(event, 'user-agent')
    if (isBotUserAgent(userAgent)) return null

    const parsed = bodySchema.safeParse(await readBody(event).catch(() => null))
    if (!parsed.success) return null

    // The raw IP is used in memory for the hash and is never persisted.
    const ip = getRequestIP(event, { xForwardedFor: true }) ?? ''
    const salt = useRuntimeConfig(event).analyticsSalt
    const visitorHash = await sha256hex(`${ip}|${userAgent ?? ''}|${salt}`)

    const client: any = serverSupabaseServiceRole(event)
    const now = new Date().toISOString()

    const { data: visitorRow } = await client
      .from('analytics_visitors')
      .select('id')
      .eq('visitor_hash', visitorHash)
      .maybeSingle()

    let visitorId: string | undefined = visitorRow?.id
    const device = parseUserAgent(userAgent)
    // Client Hints are more reliable than the regex when a browser sends them.
    const clientHintsMobile = getHeader(event, 'sec-ch-ua-mobile')
    const clientHintsPlatform = getHeader(event, 'sec-ch-ua-platform')?.replaceAll('"', '')
    if (clientHintsMobile === '?1') device.device_type = 'mobile'

    if (!visitorId) {
      const { data } = await client
        .from('analytics_visitors')
        .insert({
          visitor_hash: visitorHash,
          first_seen_at: now,
          last_seen_at: now,
          country: getHeader(event, 'x-vercel-ip-country') ?? null,
          region: getHeader(event, 'x-vercel-ip-country-region') ?? null,
          device_type: clientHintsMobile
            ? device.device_type
            : device.device_type,
          browser: device.browser,
          os: clientHintsPlatform ? clientHintsPlatform.toLowerCase() : device.os,
        })
        .select('id')
        .single()
      visitorId = data?.id
    } else {
      await client.from('analytics_visitors').update({ last_seen_at: now }).eq('id', visitorId)
    }

    if (!visitorId) return null

    // A session is 30 minutes of inactivity.
    const cookieSessionId = getCookie(event, SESSION_COOKIE)
    let sessionId: string | undefined
    let sessionExpired = true

    if (cookieSessionId) {
      const { data: session } = await client
        .from('analytics_sessions')
        .select('id, last_activity_at')
        .eq('id', cookieSessionId)
        .maybeSingle()

      if (session) {
        sessionId = session.id
        sessionExpired =
          Date.now() - Date.parse(session.last_activity_at) > SESSION_IDLE_SECONDS * 1000
      }
    }

    const path = parsed.data.path ?? '/'

    if (!sessionId || sessionExpired) {
      const { data } = await client
        .from('analytics_sessions')
        .insert({
          visitor_id: visitorId,
          started_at: now,
          last_activity_at: now,
          landing_page: path,
          referrer: parsed.data.referrer ?? null,
        })
        .select('id')
        .single()

      sessionId = data?.id
      if (!sessionId) return null

      setCookie(event, SESSION_COOKIE, sessionId, {
        httpOnly: true,
        sameSite: 'lax',
        secure: !import.meta.dev,
        maxAge: SESSION_IDLE_SECONDS,
        path: '/',
      })
    } else {
      await client
        .from('analytics_sessions')
        .update({ last_activity_at: now, exit_page: path })
        .eq('id', sessionId)
    }

    const eventName = parsed.data.event

    if (!eventName && parsed.data.dwell) {
      // The page being left already has a row; this only fills in its duration.
      const { data: latest } = await client
        .from('analytics_pageviews')
        .select('id')
        .eq('session_id', sessionId)
        .eq('path', path)
        .order('viewed_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (latest?.id && parsed.data.duration_ms !== undefined) {
        await client
          .from('analytics_pageviews')
          .update({ duration_ms: parsed.data.duration_ms })
          .eq('id', latest.id)
      }
      return null
    }

    if (!eventName || eventName === 'page_view') {
      await client.from('analytics_pageviews').insert({
        session_id: sessionId,
        visitor_id: visitorId,
        path,
        title: parsed.data.title ?? null,
        viewed_at: now,
        duration_ms: parsed.data.duration_ms ?? null,
      })
      return null
    }

    await client.from('analytics_events').insert({
      session_id: sessionId,
      visitor_id: visitorId,
      event_name: KNOWN_EVENTS.has(eventName) ? eventName : `custom:${eventName}`,
      path,
      metadata: parsed.data.metadata ?? null,
      created_at: now,
    })

    return null
  } catch {
    // Never let analytics break a visitor's request.
    setResponseStatus(event, 204)
    return null
  }
})
