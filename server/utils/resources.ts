import type { ZodType } from 'zod'
import type { H3Event } from 'h3'
import type { SupabaseClient } from '@supabase/supabase-js'
import { serverSupabaseServiceRole } from '#supabase/server'
import { resourceSchemas } from '#shared/schemas/resources'

export interface ResourceDef {
  table: string
  insert: ZodType
  update: ZodType
  /** Column holding manual ordering; absent when the resource has no manual order. */
  orderColumn?: string
  defaultOrder: { column: string; ascending: boolean }
  /** Columns matched by the list handler's `?q=`. */
  searchColumns?: string[]
  /** Normalises a validated payload before it is written. */
  normalize?: (values: Record<string, unknown>) => Record<string, unknown>
}

/**
 * One registry instead of twenty-four hand-written endpoint files. Adding a
 * resource means adding a row here and a schema in shared/schemas/resources.ts.
 */
export const resources: Record<string, ResourceDef> = {
  experience: {
    table: 'experiences',
    ...resourceSchemas.experience,
    orderColumn: 'display_order',
    defaultOrder: { column: 'display_order', ascending: true },
    searchColumns: ['title', 'organization'],
    // A current role must not keep a stale end date.
    normalize: (values) =>
      values.is_current === true ? { ...values, end_date: null } : values,
  },
  achievement: {
    table: 'achievements',
    ...resourceSchemas.achievement,
    orderColumn: 'display_order',
    defaultOrder: { column: 'display_order', ascending: true },
    searchColumns: ['title', 'issuer'],
  },
  education: {
    table: 'educations',
    ...resourceSchemas.education,
    orderColumn: 'display_order',
    defaultOrder: { column: 'display_order', ascending: true },
    searchColumns: ['institution', 'degree'],
  },
  socials: {
    table: 'socials',
    ...resourceSchemas.socials,
    orderColumn: 'display_order',
    defaultOrder: { column: 'display_order', ascending: true },
    searchColumns: ['platform', 'username'],
  },
  documents: {
    table: 'documents',
    ...resourceSchemas.documents,
    defaultOrder: { column: 'created_at', ascending: false },
    searchColumns: ['name', 'version'],
  },
  navigation: {
    table: 'navigation_items',
    ...resourceSchemas.navigation,
    orderColumn: 'display_order',
    defaultOrder: { column: 'display_order', ascending: true },
    searchColumns: ['label', 'path'],
  },
  'blog-categories': {
    table: 'blog_categories',
    ...resourceSchemas['blog-categories'],
    defaultOrder: { column: 'name', ascending: true },
    searchColumns: ['name'],
  },
  'blog-tags': {
    table: 'blog_tags',
    ...resourceSchemas['blog-tags'],
    defaultOrder: { column: 'name', ascending: true },
    searchColumns: ['name'],
  },
}

export function getResource(name: string | undefined): ResourceDef {
  const def = name ? resources[name] : undefined
  if (!def) {
    throw createError({ statusCode: 404, statusMessage: 'unknown_resource' })
  }
  return def
}

/**
 * The generated Database type names tables as string literals, so a
 * Database-typed client cannot be indexed by a resource name that only exists
 * at runtime. The cast is confined to this one boundary: every value that
 * reaches it has already been validated by the resource's zod schema.
 */
export function untypedClient(event: H3Event): SupabaseClient {
  return serverSupabaseServiceRole(event) as unknown as SupabaseClient
}

/** Columns a client may sort by: the natural order plus the audit timestamps. */
export function sortColumnsFor(def: ResourceDef): string[] {
  return [...new Set([def.defaultOrder.column, 'created_at', 'updated_at'])]
}

/**
 * Maps a Postgres constraint failure onto an HTTP status. Without this every
 * constraint violation would surface as an opaque 500.
 */
export function throwDbError(error: { code?: string; message: string }): never {
  const statusCode =
    error.code === '23505' ? 409 : error.code === '23514' || error.code === '23503' ? 422 : 500

  throw createError({ statusCode, statusMessage: error.message })
}
