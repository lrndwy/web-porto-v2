/** Column descriptor for the admin tables. Plain data, so a page can declare
 *  its table without passing render functions across component boundaries. */
export interface ColumnDef {
  key: string
  label: string
  class?: string
  /** Render the cell in the mono face (numbers, identifiers, dates). */
  mono?: boolean
  /** Cell text; defaults to the row's value, or an em dash when empty. */
  value?: (row: Record<string, unknown>) => string
  /** Hidden below `md`, where the table becomes a card list. */
  secondary?: boolean
}

export type FieldType =
  | 'text'
  | 'textarea'
  | 'date'
  | 'url'
  | 'email'
  | 'switch'
  | 'select'
  | 'image'
  | 'file'

/** Field descriptor driving the generated admin forms. */
export interface FieldDef {
  name: string
  label: string
  type: FieldType
  placeholder?: string
  description?: string
  rows?: number
  /** Storage bucket for `image` / `file` fields. */
  bucket?: string
  options?: { label: string; value: string }[]
  /** Span both columns of the two-column form grid. */
  wide?: boolean
}
