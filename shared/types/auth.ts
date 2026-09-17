/** The signed-in owner, as returned by `GET /api/me`. */
export interface OwnerIdentity {
  userId: string
  displayName: string
  role: 'OWNER' | 'ADMIN' | 'EDITOR'
}
