/** The event names the dashboard understands; anything else is namespaced. */
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

/**
 * Anonymous event tracking. Disabled entirely when the visitor has opted out
 * from `/privacy`, in which case nothing is sent at all.
 *
 * Transport prefers `sendBeacon` so a click that navigates away still lands;
 * `keepalive` fetch is the fallback.
 */
export function useTrackEvent() {
  function trackEvent(name: string, metadata?: Record<string, unknown>) {
    if (!import.meta.client) return
    if (document.documentElement.dataset.track === 'off') return

    const event = KNOWN_EVENTS.has(name) ? name : `custom:${name}`
    const payload = JSON.stringify({
      path: window.location.pathname,
      title: document.title,
      referrer: document.referrer || undefined,
      event,
      metadata,
    })

    // The ingest endpoint caps its own body; this guard keeps a fat metadata
    // object from being dropped silently by the transport.
    if (payload.length > 64 * 1024) return

    const blob = new Blob([payload], { type: 'application/json' })
    if (navigator.sendBeacon?.('/api/analytics/collect', blob)) return

    $fetch('/api/analytics/collect', {
      method: 'POST',
      body: payload,
      headers: { 'content-type': 'application/json' },
      keepalive: true,
    }).catch(() => {
      // Analytics must never surface an error to the visitor.
    })
  }

  return { trackEvent }
}
