/**
 * Records page views and dwell time.
 *
 * Two payloads per navigation: a dwell update for the page being left, and a
 * page view for the page being entered. The dwell payload is explicitly marked
 * so the ingest updates the existing row instead of inserting a second one.
 *
 * `useTrackEvent` and this plugin both honour the visitor's opt-out flag.
 */
export default defineNuxtPlugin(() => {
  const router = useRouter()

  let current: { path: string; startedAt: number } | null = null

  function send(payload: Record<string, unknown>) {
    if (document.documentElement.dataset.track === 'off') return

    const body = JSON.stringify(payload)
    if (body.length > 64 * 1024) return

    const blob = new Blob([body], { type: 'application/json' })
    if (navigator.sendBeacon?.('/api/analytics/collect', blob)) return

    $fetch('/api/analytics/collect', {
      method: 'POST',
      body,
      headers: { 'content-type': 'application/json' },
      keepalive: true,
    }).catch(() => {
      // Analytics must never surface an error to the visitor.
    })
  }

  function enter(path: string) {
    send({ path, title: document.title, referrer: document.referrer || undefined })
    current = { path, startedAt: performance.now() }
  }

  function leave() {
    if (!current) return
    send({
      path: current.path,
      dwell: true,
      duration_ms: Math.round(performance.now() - current.startedAt),
    })
    current = null
  }

  // afterEach fires for the initial navigation too, so there is no separate
  // bootstrap call (which would double-count the landing page).
  router.afterEach((to, from) => {
    if (from.fullPath && from.fullPath !== to.fullPath) leave()
    enter(to.fullPath)
  })

  // A closing tab reports its dwell time through the same beacon.
  window.addEventListener('pagehide', leave)
})
