<template>
  <div class="space-y-6">
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div v-for="stat in stats" :key="stat.title" class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">{{ stat.title }}</p>
            <p class="text-2xl font-bold">{{ stat.value }}</p>
          </div>
          <span class="text-3xl">{{ stat.icon }}</span>
        </div>
        <div v-if="stat.trend" class="mt-2 text-sm" :class="stat.trend > 0 ? 'text-green-600' : 'text-red-600'">
          {{ stat.trend > 0 ? '↑' : '↓' }} {{ Math.abs(stat.trend) }}%
        </div>
      </div>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card">
        <h3 class="text-lg font-semibold mb-4">Estado de Proyectos</h3>
        <ProjectStatusChart :data="projectStatusData" />
      </div>
      <div class="card">
        <h3 class="text-lg font-semibold mb-4">Presupuesto por Categoría</h3>
        <BudgetChart :data="budgetData" />
      </div>
    </div>

    <!-- Recent Projects -->
    <div class="card">
      <h3 class="text-lg font-semibold mb-4">Proyectos Recientes</h3>
      <div v-if="proyectosRecientes.length > 0" class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="border-b">
              <th class="text-left py-3">Proyecto</th>
              <th class="text-left py-3">Estado</th>
              <th class="text-left py-3">Progreso</th>
              <th class="text-left py-3">Presupuesto</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="proyecto in proyectosRecientes" :key="proyecto.id" class="border-b hover:bg-gray-50">
              <td class="py-3">{{ proyecto.nombre }}</td>
              <td>
                <span class="px-2 py-1 text-xs rounded-full" 
                  :class="{
                    'bg-green-100 text-green-800': proyecto.estado === 'Completado',
                    'bg-yellow-100 text-yellow-800': proyecto.estado === 'En progreso',
                    'bg-gray-100 text-gray-800': proyecto.estado === 'Planificado'
                  }">
                  {{ proyecto.estado }}
                </span>
              </td>
              <td class="py-3">
                <div class="flex items-center">
                  <div class="w-32 bg-gray-200 rounded-full h-2 mr-2">
                    <div class="bg-primary-600 rounded-full h-2" :style="{ width: proyecto.progreso + '%' }"></div>
                  </div>
                  <span>{{ proyecto.progreso }}%</span>
                </div>
              </td>
              <td class="py-3">${{ formatNumber(proyecto.presupuesto) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-center py-8 text-gray-500">
        No hay proyectos disponibles
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'
import ProjectStatusChart from '../components/ProjectStatusChart.vue'
import BudgetChart from '../components/BudgetChart.vue'

const stats = ref([])
const proyectosRecientes = ref([])
const projectStatusData = ref({ labels: [], datasets: [] })
const budgetData = ref({ labels: [], datasets: [] })

onMounted(async () => {
  try {
    // Intentar cargar datos de la API
    const [usuariosRes, proyectosRes, presupuestosRes] = await Promise.allSettled([
      api.getUsuarios(),
      api.getProyectos(),
      api.getPresupuestos()
    ])

    const usuarios = usuariosRes.status === 'fulfilled' ? usuariosRes.value.data : []
    const proyectos = proyectosRes.status === 'fulfilled' ? proyectosRes.value.data : []
    const presupuestos = presupuestosRes.status === 'fulfilled' ? presupuestosRes.value.data : []

    // Stats con datos reales o de ejemplo
    const totalPresupuesto = presupuestos.length > 0 ? presupuestos.reduce((acc, p) => acc + (p.asignado || 0), 0) : 1600000
    const proyectosActivos = proyectos.filter(p => p.estado === 'En progreso').length
    
    stats.value = [
      { title: 'Total Usuarios', value: usuarios.length || 45, icon: '👥', trend: 12 },
      { title: 'Proyectos Activos', value: proyectosActivos || 8, icon: '📋', trend: 8 },
      { title: 'Presupuesto Total', value: '$' + formatNumber(totalPresupuesto), icon: '💰', trend: 5 },
      { title: 'Proyectos Completados', value: proyectos.filter(p => p.estado === 'Completado').length || 12, icon: '✅', trend: -3 }
    ]

    // Proyectos recientes
    proyectosRecientes.value = proyectos.length > 0 ? proyectos.slice(0, 4) : [
      { id: 1, nombre: 'Parque Central', estado: 'En progreso', progreso: 45, presupuesto: 150000 },
      { id: 2, nombre: 'Alumbrado Público', estado: 'Completado', progreso: 100, presupuesto: 80000 },
      { id: 3, nombre: 'Ciclovías', estado: 'Planificado', progreso: 0, presupuesto: 200000 },
      { id: 4, nombre: 'Centro Cultural', estado: 'En progreso', progreso: 25, presupuesto: 300000 }
    ]

    // Datos para gráficos
    const estados = ['Planificado', 'En progreso', 'Completado']
    const counts = estados.map(e => proyectos.filter(p => p.estado === e).length)
    
    projectStatusData.value = {
      labels: estados,
      datasets: [{
        data: counts.some(c => c > 0) ? counts : [2, 5, 3],
        backgroundColor: ['#93c5fd', '#3b82f6', '#1e3a8a']
      }]
    }

    budgetData.value = {
      labels: presupuestos.length > 0 ? presupuestos.map(p => p.categoria) : ['Infraestructura', 'Educación', 'Salud', 'Seguridad', 'Cultura'],
      datasets: [{
        label: 'Presupuesto Asignado',
        data: presupuestos.length > 0 ? presupuestos.map(p => p.asignado) : [500000, 300000, 400000, 250000, 150000],
        backgroundColor: '#3b82f6'
      }]
    }
  } catch (error) {
    console.error('Error cargando datos:', error)
    // Datos de respaldo
    stats.value = [
      { title: 'Total Usuarios', value: 45, icon: '👥', trend: 12 },
      { title: 'Proyectos Activos', value: 8, icon: '📋', trend: 8 },
      { title: 'Presupuesto Total', value: '$1.600.000', icon: '💰', trend: 5 },
      { title: 'Proyectos Completados', value: 12, icon: '✅', trend: -3 }
    ]
    
    proyectosRecientes.value = [
      { id: 1, nombre: 'Parque Central', estado: 'En progreso', progreso: 45, presupuesto: 150000 },
      { id: 2, nombre: 'Alumbrado Público', estado: 'Completado', progreso: 100, presupuesto: 80000 },
      { id: 3, nombre: 'Ciclovías', estado: 'Planificado', progreso: 0, presupuesto: 200000 },
      { id: 4, nombre: 'Centro Cultural', estado: 'En progreso', progreso: 25, presupuesto: 300000 }
    ]
    
    projectStatusData.value = {
      labels: ['Planificado', 'En progreso', 'Completado'],
      datasets: [{
        data: [2, 5, 3],
        backgroundColor: ['#93c5fd', '#3b82f6', '#1e3a8a']
      }]
    }
    
    budgetData.value = {
      labels: ['Infraestructura', 'Educación', 'Salud', 'Seguridad', 'Cultura'],
      datasets: [{
        data: [500000, 300000, 400000, 250000, 150000],
        backgroundColor: '#3b82f6'
      }]
    }
  }
})

const formatNumber = (num) => {
  if (!num) return '0'
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}
</script>