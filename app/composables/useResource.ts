import { useDebounceFn } from '@vueuse/core'
import { toast } from 'vue-sonner'

export interface ResourceRecord {
  id: string
  [key: string]: unknown
}

interface ListResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface UseResourceOptions {
  /** Base path override, e.g. the GitHub repository endpoints. */
  endpoint?: string
  /** Extra query parameters merged into every list request. */
  extraQuery?: () => Record<string, unknown>
}

/**
 * The single client for the admin list endpoints. Pages never fetch directly
 * and never build their own error handling: failures surface as toasts here.
 */
export function useResource<T extends ResourceRecord = ResourceRecord>(
  resource: string,
  options: UseResourceOptions = {},
) {
  const base = options.endpoint ?? `/api/admin/resources/${resource}`
  // shallowRef: the list is always replaced wholesale, never mutated in place.
  const items = shallowRef<T[]>([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(20)
  const q = ref('')
  const pending = ref(false)

  async function refresh() {
    pending.value = true
    try {
      const response = await $fetch<ListResponse<T>>(base, {
        query: {
          page: page.value,
          pageSize: pageSize.value,
          q: q.value || undefined,
          ...(options.extraQuery?.() ?? {}),
        },
      })
      items.value = response.items
      total.value = response.total
    } catch (error) {
      toast.error(errorMessage(error, 'Could not load this list.'))
    } finally {
      pending.value = false
    }
  }

  async function create(payload: Record<string, unknown>): Promise<T | null> {
    try {
      const row = await $fetch<T>(base, {
        method: 'POST',
        body: payload,
      })
      await refresh()
      toast.success('Created.')
      return row
    } catch (error) {
      toast.error(errorMessage(error, 'Could not create this row.'))
      return null
    }
  }

  async function update(id: string, payload: Record<string, unknown>): Promise<T | null> {
    try {
      const row = await $fetch<T>(`${base}/${id}`, {
        method: 'PATCH',
        body: payload,
      })
      await refresh()
      toast.success('Saved.')
      return row
    } catch (error) {
      toast.error(errorMessage(error, 'Could not save this row.'))
      return null
    }
  }

  async function remove(id: string): Promise<boolean> {
    try {
      const endpoint: string = `${base}/${id}`
      await $fetch(endpoint, { method: 'DELETE' })
      // Stepping back a page keeps the operator from landing on an empty list.
      if (items.value.length === 1 && page.value > 1) page.value -= 1
      await refresh()
      toast.success('Deleted.')
      return true
    } catch (error) {
      toast.error(errorMessage(error, 'Could not delete this row.'))
      return false
    }
  }

  async function reorder(ids: string[]): Promise<void> {
    const previous = [...items.value]
    try {
      await $fetch(`${base}/reorder`, {
        method: 'PATCH',
        body: { ids },
      })
      await refresh()
    } catch (error) {
      items.value = previous
      toast.error(errorMessage(error, 'Could not save the new order.'))
    }
  }

  // Debounced search; a new term always returns to the first page.
  watch(
    q,
    useDebounceFn(() => {
      page.value = 1
      refresh()
    }, 250),
  )

  watch(page, refresh)

  return {
    items,
    total,
    page,
    pageSize,
    q,
    pending,
    refresh,
    create,
    update,
    remove,
    reorder,
  }
}
