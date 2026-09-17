<template>
  <SidebarProvider>
    <AdminSidebar />
    <SidebarInset>
      <AdminTopbar />
      <div class="w-full max-w-[1440px] px-4 py-6 md:px-6 md:py-8">
        <slot />
      </div>
    </SidebarInset>
    <CommandMenu />
  </SidebarProvider>
</template>
