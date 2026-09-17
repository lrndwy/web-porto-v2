import { z } from 'zod'

/** Blog post payloads, shared by the editor form and the server routes. */

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .optional()
    .transform((value) => (value ? value : null))

const blogPostBase = z.object({
  title: z.string().trim().min(1).max(200),
  slug: z.string().trim().min(1).max(200).optional(),
  excerpt: optionalText(500),
  /** TipTap's `editor.getJSON()`; never HTML. */
  content: z.unknown().nullable().optional(),
  thumbnail_url: optionalText(500),
  category_id: z.uuid().nullable().optional(),
  status: z.enum(['draft', 'published', 'archived']),
  published_at: z.string().nullable().optional(),
  meta_title: optionalText(200),
  meta_description: optionalText(500),
  tag_ids: z.array(z.uuid()).max(20).optional(),
})

export const blogPostSchema = blogPostBase.refine(
  (value) => value.status !== 'published' || !!value.excerpt,
  { message: 'An excerpt is required before an article can be published.', path: ['excerpt'] },
)

export const blogPostUpdateSchema = blogPostBase.partial()

export const blogTaxonomySchema = z.object({
  kind: z.enum(['category', 'tag']),
  name: z.string().trim().min(1).max(100),
  slug: z.string().trim().max(100).optional(),
  description: optionalText(500),
})
