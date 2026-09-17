/**
 * Turns arbitrary text into a URL-safe slug.
 * Diacritics are stripped, everything else non-alphanumeric becomes a single
 * dash, and empty input falls back to 'untitled' so a row always has a slug.
 */
export function slugify(input: string): string {
  const slug = (input ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return slug || 'untitled'
}

/** `base` when free, otherwise `base-2`, `base-3`, … */
export function uniqueSlug(base: string, taken: string[]): string {
  const set = new Set(taken)
  if (!set.has(base)) return base

  let n = 2
  while (set.has(`${base}-${n}`)) n += 1
  return `${base}-${n}`
}
