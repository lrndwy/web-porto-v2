import { z } from 'zod'

/**
 * Shared between the admin forms (via vee-validate's toTypedSchema) and the
 * resource endpoints, so a rule can never exist on only one side.
 *
 * Nullable-optional is the shape Postgres offers: a column is either NOT NULL
 * or accepts null, and a partial PATCH may omit it entirely.
 */

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the YYYY-MM-DD format')

/** Optional text: '' from an empty input becomes NULL, never an empty string. */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .optional()
    .transform((value) => (value ? value : null))

/** Optional date: an empty date input is a legitimate "not set". */
const optionalIsoDate = z
  .union([isoDate, z.literal('')])
  .nullable()
  .optional()
  .transform((value) => (value ? value : null))

const ORDERABLE = {
  display_order: z.number().int().min(0).optional(),
  is_visible: z.boolean(),
}

/** `end_date` is required unless the row is current; the DB enforces it too. */
const endDateRequiredUnlessCurrent = (value: { is_current: boolean; end_date?: string | null }) =>
  value.is_current || (value.end_date !== null && value.end_date !== undefined)

const CURRENT_ROLE_MESSAGE = {
  message: 'An end date is required unless the role is current.',
  path: ['end_date'],
}

const experienceBase = z.object({
  title: z.string().trim().min(1).max(200),
  organization: z.string().trim().min(1).max(200),
  description: optionalText(5000),
  location: optionalText(200),
  start_date: isoDate,
  end_date: optionalIsoDate,
  is_current: z.boolean(),
  logo_url: optionalText(500),
  ...ORDERABLE,
})

export const experienceSchema = experienceBase.refine(
  endDateRequiredUnlessCurrent,
  CURRENT_ROLE_MESSAGE,
)

export const educationSchema = z.object({
  institution: z.string().trim().min(1).max(200),
  degree: z.string().trim().min(1).max(200),
  field: optionalText(200),
  description: optionalText(5000),
  start_date: isoDate,
  end_date: optionalIsoDate,
  logo_url: optionalText(500),
  ...ORDERABLE,
})

export const achievementSchema = z.object({
  title: z.string().trim().min(1).max(200),
  issuer: z.string().trim().min(1).max(200),
  description: optionalText(5000),
  achievement_date: optionalIsoDate,
  certificate_url: optionalText(500),
  image_url: optionalText(500),
  ...ORDERABLE,
})

export const socialSchema = z.object({
  platform: z.string().trim().min(1).max(100),
  username: optionalText(200),
  url: z.url('Must be a full URL, e.g. https://github.com/you'),
  icon: optionalText(100),
  ...ORDERABLE,
})

export const documentSchema = z.object({
  name: z.string().trim().min(1).max(200),
  file_path: z.string().trim().min(1).max(500),
  file_type: optionalText(100),
  file_size: z.number().int().min(0).nullable().optional(),
  version: optionalText(50),
  is_active: z.boolean(),
  is_visible: z.boolean(),
})

export const navigationSchema = z.object({
  label: z.string().trim().min(1).max(100),
  path: z.string().trim().min(1).max(500),
  icon: optionalText(100),
  display_order: z.number().int().min(0).optional(),
  is_visible: z.boolean(),
  is_external: z.boolean(),
})

export const blogCategorySchema = z.object({
  name: z.string().trim().min(1).max(100),
  slug: z.string().trim().min(1).max(100).optional(),
  description: optionalText(500),
})

export const blogTagSchema = z.object({
  name: z.string().trim().min(1).max(100),
  slug: z.string().trim().min(1).max(100).optional(),
})

/**
 * The profile singleton. It is not in `resourceSchemas` because it is a single
 * row with its own GET/PUT pair rather than a collection.
 */
export const profileSchema = z.object({
  name: z.string().trim().min(1).max(200),
  title: optionalText(200),
  short_description: optionalText(500),
  description: optionalText(10000),
  avatar_url: optionalText(500),
  location: optionalText(200),
  email: z
    .string()
    .trim()
    .max(320)
    .nullable()
    .optional()
    .refine(
      (value) => !value || z.email().safeParse(value).success,
      'Must be a valid email address',
    ),
  phone: optionalText(50),
  github_username: optionalText(100),
  website_url: optionalText(500),
  is_visible: z.boolean(),
})

/** A partial of the insert shape. The cross-field rule is only checked on the
 *  complete object, because a partial PATCH cannot see the stored values; the
 *  `experiences_end_date_required_unless_current` constraint backstops it. */
export const experienceUpdateSchema = experienceBase.partial()

export const educationUpdateSchema = educationSchema.partial()
export const achievementUpdateSchema = achievementSchema.partial()
export const socialUpdateSchema = socialSchema.partial()
export const documentUpdateSchema = documentSchema.partial()
export const navigationUpdateSchema = navigationSchema.partial()
export const blogCategoryUpdateSchema = blogCategorySchema.partial()
export const blogTagUpdateSchema = blogTagSchema.partial()

/** Every schema keyed by resource name; the admin forms read the same map. */
export const resourceSchemas = {
  experience: { insert: experienceSchema, update: experienceUpdateSchema },
  education: { insert: educationSchema, update: educationUpdateSchema },
  achievement: { insert: achievementSchema, update: achievementUpdateSchema },
  socials: { insert: socialSchema, update: socialUpdateSchema },
  documents: { insert: documentSchema, update: documentUpdateSchema },
  navigation: { insert: navigationSchema, update: navigationUpdateSchema },
  'blog-categories': { insert: blogCategorySchema, update: blogCategoryUpdateSchema },
  'blog-tags': { insert: blogTagSchema, update: blogTagUpdateSchema },
} as const

export type ResourceName = keyof typeof resourceSchemas
