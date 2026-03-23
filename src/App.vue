<template>
  <div class="min-h-screen flex">
    <!-- Sidebar -->
    <aside class="w-64 bg-primary-800 text-white">
      <div class="p-6">
        <h1 class="text-2xl font-bold">Gestión Municipal</h1>
      </div>
      <nav class="mt-6">
        <router-link 
          v-for="item in menuItems" 
          :key="item.path"
          :to="item.path"
          class="flex items-center px-6 py-3 hover:bg-primary-700 transition-colors"
          :class="{ 'bg-primary-900': $route.path === item.path }"
          @click="handleNavigation"
        >
          <span class="mr-3">{{ item.icon }}</span>
          {{ item.name }}
        </router-link>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-auto">
      <header class="bg-white shadow-sm px-8 py-4">
        <h2 class="text-xl font-semibold text-gray-800">{{ currentPage }}</h2>
      </header>
      <div class="p-8">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { onMounted } from 'vue'
import { checkRouter } from './debug'

onMounted(() => {
  checkRouter()
})

const route = useRoute()

const menuItems = [
  { path: '/dashboard', name: 'Dashboard', icon: '📊' },
  { path: '/usuarios', name: 'Usuarios', icon: '👥' },
  { path: '/proyectos', name: 'Proyectos', icon: '📋' },
  { path: '/presupuesto', name: 'Presupuesto', icon: '💰' },
  { path: '/reportes', name: 'Reportes', icon: '📈' }
]

const currentPage = computed(() => {
  const item = menuItems.find(i => i.path === route.path)
  return item ? item.name : 'Dashboard'
})

const handleNavigation = () => {
  // Forzar la navegación si es necesario
  console.log('Navegando a:', route.path)
}
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>