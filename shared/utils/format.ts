export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-GB').format(n)
}

/** 82421 → '82.4K' */
export function formatCompact(n: number): string {
  return new Intl.NumberFormat('en-GB', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(n)
}

/** 0.182 → '18.2%' */
export function formatPercent(n: number, digits = 1): string {
  return `${(n * 100).toFixed(digits)}%`
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const

/**
 * '2026-09-17' → '17 Sep 2026'; null or unparseable → '—'.
 *
 * Parsed from the string rather than through Intl: every day-first locale
 * abbreviates September as 'Sept' in current CLDR, so Intl cannot produce the
 * design contract's 'Sep'. This also costs no Date allocation per render.
 */
export function formatDate(iso: string | null): string {
  if (!iso) return '—'

  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  if (!match) return '—'

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (month < 1 || month > 12 || day < 1 || day > 31) return '—'

  return `${day} ${MONTHS[month - 1]} ${year}`
}

/** '2026 — Present' while current, otherwise '2024 — 2026'. */
export function formatMonthRange(
  start: string,
  end: string | null,
  isCurrent: boolean,
): string {
  const from = start.slice(0, 4)
  if (isCurrent) return `${from} — Present`
  return `${from} — ${end ? end.slice(0, 4) : 'Present'}`
}

/**
 * How long a role lasted, in whole months: '1 yr 8 mo', '7 mo'.
 *
 * Both ends are inclusive — a role that started and ended in the same month
 * reads as '1 mo', not '0 mo'. A current role is measured to today.
 */
export function formatDuration(
  start: string,
  end: string | null,
  isCurrent: boolean,
  now = new Date(),
): string {
  const from = new Date(start)
  if (Number.isNaN(from.getTime())) return '—'

  const to = isCurrent || !end ? now : new Date(end)
  if (Number.isNaN(to.getTime())) return '—'

  const months = Math.max(
    1,
    (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth()) + 1,
  )

  const years = Math.floor(months / 12)
  const remainder = months % 12
  if (years && remainder) return `${years} yr ${remainder} mo`
  if (years) return `${years} yr`
  return `${months} mo`
}
