import { untypedClient } from '~~/server/utils/resources'

/**
 * Every analytics breakdown route has this shape: resolve the period, read the
 * rows it covers, aggregate in process. Kept as one helper so the panels cannot
 * disagree about their window.
 */
export async function withAnalyticsPeriod<T>(
  event: Parameters<typeof requireOwner>[0],
  handler: (context: {
    client: ReturnType<typeof untypedClient>
    from: Date
    to: Date
    range: PeriodRange
  }) => Promise<T>,
): Promise<T> {
  await requireOwner(event)

  const requested = stringParam(getQuery(event).range)
  const range = isPeriodRange(requested) ? requested : '30d'
  const { from, to } = resolvePeriod(range)

  return handler({ client: untypedClient(event), from, to, range })
}

/** Groups rows by a key, returning the count per key in descending order. */
export function countBy<T>(rows: T[], key: (row: T) => string | null | undefined) {
  const counts = new Map<string, number>()
  for (const row of rows) {
    const value = key(row)
    if (!value) continue
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])
}
