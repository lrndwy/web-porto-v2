export default defineEventHandler(async (event) => {
  const owner = await requireOwner(event)
  return owner
})
