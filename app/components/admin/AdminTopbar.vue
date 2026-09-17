<script setup lang="ts">
const route = useRoute()
const owner = useOwner()
const { theme, toggle: toggleTheme } = useTheme()
const supabase = useSupabaseClient()
const router = useRouter()

const pageTitle = computed(() => (route.meta.title as string | undefined) ?? 'Admin')

const signOutPending = ref(false)

async function signOut() {
  signOutPending.value = true
  try {
    await supabase.auth.signOut()
  } catch {
    // A failed round-trip must not trap the owner in the dashboard.
  } finally {
    owner.value = null
    signOutPending.value = false
    await router.push('/admin/login')
  }
}
</script>

<template>
  <header class="bg-background sticky top-0 z-20 border-b">
    <div class="flex h-14 items-center gap-3 px-4 md:px-6">
      <SidebarTrigger />

      <Separator orientation="vertical" class="hidden h-5 md:block" />

      <h1 class="text-subtitle truncate">{{ pageTitle }}</h1>

      <div class="ml-auto flex items-center gap-1.5">
        <CommandMenu />

        <Button as-child variant="ghost" size="sm" class="hidden md:inline-flex">
          <NuxtLink to="/" target="_blank">
            <Icon name="ph:arrow-up-right" />
            <span class="hidden lg:inline">Open public website</span>
          </NuxtLink>
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          :aria-label="theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'"
          @click="toggleTheme"
        >
          <Icon :name="theme === 'dark' ? 'ph:sun' : 'ph:moon'" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" size="icon-sm" aria-label="Account menu">
              <Avatar class="size-6">
                <AvatarFallback class="text-caption">
                  {{ owner?.displayName?.slice(0, 1) ?? 'O' }}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-48">
            <DropdownMenuLabel class="truncate">
              {{ owner?.displayName ?? 'Owner' }}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem as-child>
              <NuxtLink to="/admin/settings">Account</NuxtLink>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem :disabled="signOutPending" @select="signOut">
              <Icon name="ph:sign-out" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </header>
</template>
