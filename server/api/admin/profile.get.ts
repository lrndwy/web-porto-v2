import { untypedClient } from '~~/server/utils/resources'

/** The profile is a singleton: the oldest row is the one the site renders. */
export default defineEventHandler(async (event) => {
  await requireOwner(event)

  const { data, error } = await untypedClient(event)
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) throwDbError(error)
  return data ?? null
})
