<script setup lang="ts">
import { useWindowScroll } from '@vueuse/core'

const { data: items } = await useNavigation()
const { data: settings } = await useSiteSettings()

const route = useRoute()
const { y } = useWindowScroll()
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
    :class="scrolled ? 'bg-background/80 border-border backdrop-blur' : 'border-transparent'"
  >
    <div class="mx-auto flex h-16 w-full max-w-[1400px] items-center gap-4 px-6">
      <NuxtLink to="/" class="flex items-center gap-2.5 shrink-0">
        <img v-if="logoUrl" :src="logoUrl" alt="" width="24" height="24" class="size-6 rounded">
        <span class="text-subtitle">{{ siteName }}</span>
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

      <div class="ml-auto flex items-center gap-2 md:ml-2">
        <Button as-child size="sm" variant="outline" class="active:translate-y-px">
          <NuxtLink to="/cv">CV</NuxtLink>
        </Button>

        <Sheet v-model:open="mobileOpen">
          <SheetTrigger as-child>
            <Button variant="ghost" size="icon-sm" class="md:hidden" aria-label="Open menu">
              <Icon name="ph:list" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" class="w-full sm:max-w-xs">
            <SheetHeader>
              <SheetTitle class="sr-only">Menu</SheetTitle>
            </SheetHeader>
            <nav class="flex flex-col px-2" aria-label="Mobile">
              <template v-for="item in items" :key="item.id">
                <a
                  v-if="item.is_external"
                  :href="item.path"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-muted-foreground hover:text-foreground inline-flex items-center gap-3 py-3 text-base transition-colors duration-200"
                >
                  <Icon v-if="item.icon" :name="item.icon" class="size-4" />
                  {{ item.label }}
                </a>
                <NuxtLink
                  v-else
                  :to="item.path"
                  class="inline-flex items-center gap-3 py-3 text-base transition-colors duration-200"
                  :class="route.path === item.path ? 'text-foreground' : 'text-muted-foreground'"
                >
                  <Icon v-if="item.icon" :name="item.icon" class="size-4" />
                  {{ item.label }}
                </NuxtLink>
              </template>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  </header>
</template>
