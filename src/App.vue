<template>
  <div class="min-h-screen flex">
    <!-- Overlay para móvil -->
    <div 
      v-if="isSidebarOpen && isMobile" 
      class="fixed inset-0 bg-black bg-opacity-50 z-20"
      @click="closeSidebar"
    ></div>

    <!-- Sidebar -->
    <aside 
      class="fixed md:relative w-64 bg-primary-800 text-white z-30 transition-transform duration-300 ease-in-out"
      :class="{
        'translate-x-0': isSidebarOpen,
        '-translate-x-full': !isSidebarOpen && isMobile,
        'translate-x-0': !isMobile
      }"
    >
      <div class="p-6 flex justify-between items-center">
        <h1 class="text-2xl font-bold">Gestión Municipal</h1>
        <button 
          v-if="isMobile" 
          @click="closeSidebar"
          class="text-white hover:text-gray-300 focus:outline-none"
        >
          ✕
        </button>
      </div>
      <nav class="mt-6">
        <router-link 
          v-for="item in menuItems" 
          :key="item.path"
          :to="item.path"
          class="flex items-center px-6 py-3 hover:bg-primary-700 transition-colors"
          :class="{ 'bg-primary-900': $route.path === item.path }"
          @click="handleMobileNavigation"
        >
          <span class="mr-3">{{ item.icon }}</span>
          {{ item.name }}
        </router-link>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-auto w-full">
      <header class="bg-white shadow-sm px-4 sm:px-8 py-4 flex items-center gap-4">
        <!-- Botón para abrir sidebar en móvil -->
        <button 
          v-if="isMobile && !isSidebarOpen" 
          @click="openSidebar"
          class="text-gray-600 hover:text-gray-900 focus:outline-none"
          :class="{ 'hidden': isSidebarOpen }"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
        <h2 class="text-xl font-semibold text-gray-800">{{ currentPage }}</h2>
      </header>
      <div class="p-4 sm:p-8">
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
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { checkRouter } from './debug'

onMounted(() => {
  checkRouter()
  checkScreenSize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const route = useRoute()
const isSidebarOpen = ref(false)
const isMobile = ref(false)

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

const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768
  if (!isMobile.value) {
    isSidebarOpen.value = false
  }
}

const handleResize = () => {
  checkScreenSize()
}

const openSidebar = () => {
  isSidebarOpen.value = true
  document.body.style.overflow = 'hidden'
}

const closeSidebar = () => {
  isSidebarOpen.value = false
  document.body.style.overflow = ''
}

const handleMobileNavigation = () => {
  if (isMobile.value) {
    closeSidebar()
  }
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

/* Estilos adicionales para mejorar la experiencia móvil */
@media (max-width: 768px) {
  .sidebar-transition {
    transition: transform 0.3s ease-in-out;
  }
}
</style>