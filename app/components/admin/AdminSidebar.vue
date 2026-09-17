<script setup lang="ts">
interface NavItem {
  label: string
  to: string
  icon: string
  /** Section anchor on a multi-section page. */
  hash?: string
  /** The entry to highlight when the page is opened without a hash. */
  defaultHash?: boolean
  /** Match child routes too (e.g. /admin/blog/new under Blog). */
  matchChildren?: boolean
}

interface NavGroup {
  label?: string
  items: NavItem[]
}

const groups: NavGroup[] = [
  {
    items: [{ label: 'Overview', to: '/admin/dashboard', icon: 'ph:squares-four' }],
  },
  {
    label: 'Analytics',
    items: [{ label: 'Analytics', to: '/admin/analytics', icon: 'ph:chart-line' }],
  },
  {
    label: 'Portfolio',
    items: [
      { label: 'Profile', to: '/admin/profile', icon: 'ph:user' },
      { label: 'Experience', to: '/admin/experience', icon: 'ph:briefcase' },
      { label: 'Achievement', to: '/admin/achievement', icon: 'ph:medal' },
      { label: 'Education', to: '/admin/education', icon: 'ph:graduation-cap' },
      { label: 'Social Media', to: '/admin/social', icon: 'ph:share-network' },
      { label: 'Documents', to: '/admin/documents', icon: 'ph:file-text' },
    ],
  },
  {
    label: 'Content',
    items: [
      { label: 'Projects', to: '/admin/projects', icon: 'ph:folders' },
      { label: 'Blog', to: '/admin/blog', icon: 'ph:article', matchChildren: true },
    ],
  },
  {
    label: 'AI Router',
    items: [
      { label: 'Overview', to: '/admin/router', icon: 'ph:sparkle' },
      { label: 'Providers', to: '/admin/router/providers', icon: 'ph:plug' },
      { label: 'Models', to: '/admin/router/models', icon: 'ph:cube' },
      { label: 'API Key', to: '/admin/router/api-key', icon: 'ph:key' },
      { label: 'Usage', to: '/admin/router/usage', icon: 'ph:chart-bar' },
      { label: 'Logs', to: '/admin/router/logs', icon: 'ph:scroll' },
    ],
  },
  {
    label: 'Website',
    items: [
      { label: 'General', to: '/admin/website', hash: '#general', icon: 'ph:globe', defaultHash: true },
      { label: 'Navigation', to: '/admin/website', hash: '#navigation', icon: 'ph:list' },
      { label: 'SEO', to: '/admin/website', hash: '#seo', icon: 'ph:magnifying-glass' },
      { label: 'Maintenance', to: '/admin/website', hash: '#maintenance', icon: 'ph:warning' },
    ],
  },
  {
    label: 'Settings',
    items: [
      { label: 'Account', to: '/admin/settings', hash: '#account', icon: 'ph:identification-card', defaultHash: true },
      { label: 'Security', to: '/admin/settings', hash: '#security', icon: 'ph:lock' },
    ],
  },
]

const route = useRoute()

function isActive(item: NavItem): boolean {
  if (item.hash) {
    const current = route.hash || (item.defaultHash ? item.hash : '')
    return route.path === item.to && current === item.hash
  }
  if (item.matchChildren) {
    return route.path === item.to || route.path.startsWith(`${item.to}/`)
  }
  return route.path === item.to
}

const siteName = 'Portfolio Admin'
</script>

<template>
  <Sidebar collapsible="icon">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton as-child size="lg" tooltip="Overview">
            <NuxtLink to="/admin/dashboard">
              <span class="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-md">
                <Icon name="ph:terminal-window" class="size-4" />
              </span>
              <span class="text-subtitle truncate">{{ siteName }}</span>
            </NuxtLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>

    <SidebarContent>
      <SidebarGroup v-for="(group, index) in groups" :key="group.label ?? index">
        <SidebarGroupLabel v-if="group.label">{{ group.label }}</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in group.items" :key="`${item.to}${item.hash ?? ''}`">
              <SidebarMenuButton
                as-child
                :is-active="isActive(item)"
                :tooltip="item.label"
              >
                <NuxtLink :to="`${item.to}${item.hash ?? ''}`">
                  <Icon :name="item.icon" />
                  <span>{{ item.label }}</span>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>

    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton as-child tooltip="View public site">
            <NuxtLink to="/" target="_blank">
              <Icon name="ph:arrow-up-right" />
              <span>View public site</span>
            </NuxtLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  </Sidebar>
</template>
