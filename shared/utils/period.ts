export type PeriodRange = 'today' | 'yesterday' | '7d' | '30d' | '90d'

export const PERIODS: { value: PeriodRange; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
]

export function isPeriodRange(value: string): value is PeriodRange {
  return PERIODS.some((period) => period.value === value)
}

function startOfUtcDay(date: Date): Date {
  const copy = new Date(date)
  copy.setUTCHours(0, 0, 0, 0)
  return copy
}

/**
 * Turns a period name into an inclusive-from, inclusive-to window, in UTC.
 * Every analytics route resolves its window through this so the charts cannot
 * disagree with the KPI cards about where a day starts.
 */
export function resolvePeriod(range: PeriodRange, now = new Date()): { from: Date; to: Date } {
  const endOfToday = new Date(startOfUtcDay(now).getTime() + 24 * 60 * 60 * 1000 - 1)

  switch (range) {
    case 'today':
      return { from: startOfUtcDay(now), to: endOfToday }
    case 'yesterday': {
      const start = new Date(startOfUtcDay(now).getTime() - 24 * 60 * 60 * 1000)
      return { from: start, to: new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1) }
    }
    case '7d':
      return { from: new Date(startOfUtcDay(now).getTime() - 6 * 24 * 60 * 60 * 1000), to: endOfToday }
    case '30d':
      return { from: new Date(startOfUtcDay(now).getTime() - 29 * 24 * 60 * 60 * 1000), to: endOfToday }
    case '90d':
      return { from: new Date(startOfUtcDay(now).getTime() - 89 * 24 * 60 * 60 * 1000), to: endOfToday }
  }
}

/** The window immediately preceding the same-length one, for deltas. */
export function previousPeriod(range: PeriodRange, now = new Date()): { from: Date; to: Date } {
  const current = resolvePeriod(range, now)
  const length = current.to.getTime() - current.from.getTime()
  return {
    from: new Date(current.from.getTime() - length - 1),
    to: new Date(current.from.getTime() - 1),
  }
}
