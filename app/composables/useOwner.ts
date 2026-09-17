/** Shared owner identity, populated once by the admin middleware. */
export function useOwner() {
  return useState<OwnerIdentity | null>('owner', () => null)
}
