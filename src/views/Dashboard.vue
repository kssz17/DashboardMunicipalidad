<template>
  <div class="space-y-6 text-gray-200">

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
      <div 
        v-for="stat in stats" 
        :key="stat.title" 
        class="bg-gray-900/70 backdrop-blur border border-gray-800 rounded-xl p-4 md:p-5 shadow-md hover:shadow-lg transition"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-400 text-xs md:text-sm">{{ stat.title }}</p>
            <p class="text-xl md:text-2xl font-semibold">{{ stat.value }}</p>
          </div>
          <span class="text-2xl md:text-3xl opacity-80">{{ stat.icon }}</span>
        </div>

        <div 
          v-if="stat.trend" 
          class="mt-2 text-xs md:text-sm flex items-center gap-1"
          :class="stat.trend > 0 ? 'text-green-400' : 'text-red-400'"
        >
          <span>{{ stat.trend > 0 ? '↑' : '↓' }}</span>
          <span>{{ Math.abs(stat.trend) }}%</span>
        </div>
      </div>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
      
      <div class="bg-gray-900/70 border border-gray-800 rounded-xl p-4 md:p-5 shadow-md">
        <h3 class="text-base md:text-lg font-semibold mb-4 text-gray-300">
          Estado de Proyectos
        </h3>

        <div class="h-64 md:h-80">
          <ProjectStatusChart :data="projectStatusData" />
        </div>
      </div>

      <div class="bg-gray-900/70 border border-gray-800 rounded-xl p-4 md:p-5 shadow-md">
        <h3 class="text-base md:text-lg font-semibold mb-4 text-gray-300">
          Presupuesto por Categoría
        </h3>

        <div class="h-64 md:h-80">
          <BudgetChart :data="budgetData" />
        </div>
      </div>

    </div>

    <!-- Recent Projects -->
    <div class="bg-gray-900/70 border border-gray-800 rounded-xl p-4 md:p-5 shadow-md">
      
      <h3 class="text-base md:text-lg font-semibold mb-4 text-gray-300">
        Proyectos Recientes
      </h3>

      <div v-if="proyectosRecientes.length > 0" class="overflow-x-auto">
        
        <table class="min-w-[600px] w-full text-xs md:text-sm">
          
          <thead>
            <tr class="border-b border-gray-800 text-gray-400">
              <th class="text-left py-3">Proyecto</th>
              <th class="text-left py-3">Estado</th>
              <th class="text-left py-3">Progreso</th>
              <th class="text-left py-3">Presupuesto</th>
            </tr>
          </thead>

          <tbody>
            <tr 
              v-for="proyecto in proyectosRecientes" 
              :key="proyecto.id" 
              class="border-b border-gray-800 hover:bg-gray-800/40 transition"
            >
              <td class="py-3 text-gray-200">{{ proyecto.nombre }}</td>

              <td>
                <span 
                  class="px-2 py-1 text-xs rounded-full font-medium"
                  :class="{
                    'bg-green-900/40 text-green-400': proyecto.estado === 'Completado',
                    'bg-yellow-900/40 text-yellow-400': proyecto.estado === 'En progreso',
                    'bg-gray-700 text-gray-300': proyecto.estado === 'Planificado'
                  }"
                >
                  {{ proyecto.estado }}
                </span>
              </td>

              <td class="py-3">
                <div class="flex items-center gap-2">
                  
                  <div class="w-full max-w-[120px] bg-gray-800 rounded-full h-2">
                    <div 
                      class="bg-indigo-500 rounded-full h-2 transition-all"
                      :style="{ width: proyecto.progreso + '%' }"
                    ></div>
                  </div>

                  <span class="text-xs md:text-sm text-gray-300">
                    {{ proyecto.progreso }}%
                  </span>

                </div>
              </td>

              <td class="py-3 text-gray-300">
                ${{ formatNumber(proyecto.presupuesto) }}
              </td>
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