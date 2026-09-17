<template>
  <div class="bg-background text-foreground relative flex min-h-[100dvh] flex-col">
    <PageBackdrop />
    <AppNav />
    <main class="relative z-10 flex-1">
      <slot />
    </main>
    <AppFooter class="relative z-10" />
  </div>
</template>
