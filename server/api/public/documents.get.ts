import { untypedClient } from '~~/server/utils/resources'

const SIGNED_URL_TTL_SECONDS = 300

/**
 * The one public read route: the private `documents` bucket cannot be read with
 * the anon client, so signed URLs are minted here with the service role.
 * Signed URLs are short-lived, hence `no-store`.
 */
export default defineEventHandler(async (event) => {
  const client = untypedClient(event)

  const { data, error } = await client
    .from('documents')
    .select('id, name, version, file_path, file_type')
    .eq('is_active', true)
    .eq('is_visible', true)
    .order('created_at', { ascending: false })

  if (error) throwDbError(error)

  type DocumentRowSubset = {
    id: string
    name: string
    version: string | null
    file_path: string
    file_type: string | null
  }

  const rows: DocumentRowSubset[] = data ?? []

  const documents = await Promise.all(
    rows.map(async (row) => {
      const { data: signed } = await client.storage
        .from('documents')
        .createSignedUrl(row.file_path, SIGNED_URL_TTL_SECONDS)

      return {
        id: row.id,
        name: row.name,
        version: row.version,
        file_type: row.file_type,
        url: signed?.signedUrl ?? null,
      }
    }),
  )

  setHeader(event, 'cache-control', 'no-store')
  return documents.filter((document) => document.url !== null)
})
