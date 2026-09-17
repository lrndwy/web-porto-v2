<template>
  <div class="bg-background text-foreground flex min-h-[100dvh] flex-col">
    <AppNav />
    <main class="flex-1">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
