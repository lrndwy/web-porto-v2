import { serverSupabaseServiceRole } from '#supabase/server'

const ALLOWED_BUCKETS = new Set([
  'avatars',
  'documents',
  'blog-images',
  'achievement-images',
  'site-assets',
])

const ALLOWED_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/avif',
  'application/pdf',
])

const MAX_BYTES = 5 * 1024 * 1024

const PUBLIC_BUCKETS = new Set(['avatars', 'blog-images', 'achievement-images', 'site-assets'])

export default defineEventHandler(async (event) => {
  await requireOwner(event)

  const form = await readMultipartFormData(event)
  const bucket = form?.find((part) => part.name === 'bucket')?.data.toString().trim()
  const file = form?.find((part) => part.name === 'file')

  if (!bucket || !ALLOWED_BUCKETS.has(bucket)) {
    throw createError({ statusCode: 400, statusMessage: 'invalid_bucket' })
  }
  if (!file?.filename || !file.data.byteLength) {
    throw createError({ statusCode: 400, statusMessage: 'missing_file' })
  }
  if (file.data.byteLength > MAX_BYTES) {
    throw createError({ statusCode: 413, statusMessage: 'file_too_large' })
  }
  const contentType = file.type ?? ''
  if (!ALLOWED_MIME_TYPES.has(contentType)) {
    throw createError({ statusCode: 415, statusMessage: 'unsupported_media_type' })
  }

  const path = `${crypto.randomUUID()}/${slugify(file.filename)}`
  const storage = serverSupabaseServiceRole(event).storage.from(bucket)

  const { error } = await storage.upload(path, file.data, { contentType, upsert: false })
  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  // The private bucket is only ever read through a signed URL, so it gets no
  // public URL here.
  if (!PUBLIC_BUCKETS.has(bucket)) {
    return { path }
  }

  const { data } = storage.getPublicUrl(path)
  return { path, publicUrl: data.publicUrl }
})
