<script setup lang="ts">
import { useWindowScroll } from '@vueuse/core'

const { data: items } = await useNavigation()
const { data: settings } = await useSiteSettings()

const route = useRoute()
const { y } = useWindowScroll()
const { theme, toggle: toggleTheme } = useTheme()
const mobileOpen = ref(false)

// The hairline and blur appear only once the page has moved, so the nav sits
// flush against the hero at rest.
const scrolled = computed(() => y.value > 8)

watch(() => route.fullPath, () => (mobileOpen.value = false))

const siteName = computed(() => settings.value?.site_name ?? '')
const logoUrl = computed(() => settings.value?.logo_url ?? null)
</script>

<template>
  <header
    class="sticky top-0 z-40 border-b transition-colors duration-200"
    :class="
      scrolled
        ? 'bg-background/75 border-border/70 backdrop-blur-md shadow-[inset_0_-1px_0_oklch(1_0_0/0.06)]'
        : 'border-transparent'
    "
  >
    <div class="mx-auto flex h-16 w-full max-w-[1400px] items-center gap-3 px-4 md:px-6">
      <!-- Brand: the name truncates before it can push the controls off-screen. -->
      <NuxtLink to="/" class="flex min-w-0 items-center gap-2.5">
        <img
          v-if="logoUrl"
          :src="logoUrl"
          alt=""
          width="24"
          height="24"
          class="size-6 shrink-0 rounded"
        >
        <span class="text-subtitle truncate">{{ siteName }}</span>
      </NuxtLink>

      <nav class="ml-auto hidden items-center gap-1 md:flex" aria-label="Main">
        <template v-for="item in items" :key="item.id">
          <a
            v-if="item.is_external"
            :href="item.path"
            target="_blank"
            rel="noopener noreferrer"
            class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm transition-colors duration-200"
          >
            <Icon v-if="item.icon" :name="item.icon" class="size-4" />
            {{ item.label }}
          </a>
          <NuxtLink
            v-else
            :to="item.path"
            class="relative inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm transition-colors duration-200"
            :class="
              route.path === item.path
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            "
          >
            <Icon v-if="item.icon" :name="item.icon" class="size-4" />
            {{ item.label }}
            <span
              v-if="route.path === item.path"
              class="bg-primary absolute inset-x-3 -bottom-px h-px"
            />
          </NuxtLink>
        </template>
      </nav>

      <div class="ml-auto flex shrink-0 items-center gap-1.5 md:ml-2">
        <!-- Below `sm` the CV lives in the drawer instead, so the header keeps
             only the brand and one control. -->
        <Button as-child size="sm" variant="outline" class="hidden shrink-0 active:translate-y-px sm:inline-flex">
          <NuxtLink to="/cv">CV</NuxtLink>
        </Button>

        <Sheet v-model:open="mobileOpen">
          <SheetTrigger as-child>
            <Button variant="ghost" size="icon-sm" class="md:hidden" aria-label="Open menu">
              <Icon name="ph:list" class="size-5" />
            </Button>
          </SheetTrigger>

          <SheetContent side="right" class="flex w-full flex-col gap-0 p-0 sm:max-w-xs">
            <SheetHeader class="border-border/70 border-b px-5 py-4 text-left">
              <SheetTitle class="text-subtitle truncate">{{ siteName }}</SheetTitle>
              <SheetDescription class="sr-only">Site navigation</SheetDescription>
            </SheetHeader>

            <nav class="flex-1 overflow-y-auto px-3 py-2" aria-label="Mobile">
              <template v-for="item in items" :key="item.id">
                <a
                  v-if="item.is_external"
                  :href="item.path"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-muted-foreground active:bg-accent/60 flex items-center gap-3 rounded-lg px-3 py-3 text-base transition-colors duration-200"
                >
                  <Icon v-if="item.icon" :name="item.icon" class="size-4 shrink-0" />
                  <span class="truncate">{{ item.label }}</span>
                  <Icon name="ph:arrow-up-right" class="ml-auto size-4 shrink-0" />
                </a>
                <NuxtLink
                  v-else
                  :to="item.path"
                  class="active:bg-accent/60 flex items-center gap-3 rounded-lg px-3 py-3 text-base transition-colors duration-200"
                  :class="route.path === item.path ? 'bg-accent/50 text-foreground' : 'text-muted-foreground'"
                >
                  <Icon v-if="item.icon" :name="item.icon" class="size-4 shrink-0" />
                  <span class="truncate">{{ item.label }}</span>
                  <Icon
                    v-if="route.path === item.path"
                    name="ph:caret-right"
                    class="ml-auto size-4 shrink-0"
                  />
                </NuxtLink>
              </template>
            </nav>

            <div class="border-border/70 flex items-center gap-2 border-t px-5 py-4">
              <Button as-child class="flex-1 active:translate-y-px">
                <NuxtLink to="/cv">View CV</NuxtLink>
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                :aria-label="theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'"
                @click="toggleTheme"
              >
                <Icon :name="theme === 'dark' ? 'ph:sun' : 'ph:moon'" />
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  </header>
</template>
