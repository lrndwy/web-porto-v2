export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'wp-theme'

/**
 * Dark-first theme control. The pre-hydration script in nuxt.config adds the
 * `.dark` class before first paint unless the visitor has explicitly chosen
 * light, so this composable only reflects that state and keeps it in sync.
 */
export function useTheme() {
  const theme = useState<Theme>('wp-theme', () => 'dark')
  const synced = useState('wp-theme-synced', () => false)

  // Runs after hydration so the toggle's markup matches what the server sent.
  onMounted(() => {
    if (synced.value) return
    synced.value = true
    theme.value = document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  })

  function setTheme(next: Theme) {
    theme.value = next
    if (import.meta.client) {
      document.documentElement.classList.toggle('dark', next === 'dark')
      localStorage.setItem(STORAGE_KEY, next)
    }
  }

  return {
    theme,
    setTheme,
    toggle: () => setTheme(theme.value === 'dark' ? 'light' : 'dark'),
  }
}
