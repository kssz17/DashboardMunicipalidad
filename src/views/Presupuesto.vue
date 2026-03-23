<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold">Ejecución Presupuestaria {{ añoActual }}</h2>
      <div class="flex gap-2">
        <select v-model="añoSeleccionado" class="input-field w-32">
          <option value="2024">2024</option>
          <option value="2023">2023</option>
          <option value="2022">2022</option>
        </select>
        <button class="btn-primary flex items-center">
          <span class="mr-2">📊</span> Exportar
        </button>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">Presupuesto Total</p>
            <p class="text-2xl font-bold">${{ formatNumber(totalPresupuesto) }}</p>
          </div>
          <span class="text-3xl text-primary-600">💰</span>
        </div>
        <div class="mt-2 text-sm text-green-600">↑ 8% vs año anterior</div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">Ejecutado</p>
            <p class="text-2xl font-bold">${{ formatNumber(totalEjecutado) }}</p>
          </div>
          <span class="text-3xl text-yellow-600">📊</span>
        </div>
        <div class="mt-2 text-sm text-gray-600">{{ porcentajeEjecucion }}% del total</div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">Disponible</p>
            <p class="text-2xl font-bold">${{ formatNumber(totalDisponible) }}</p>
          </div>
          <span class="text-3xl text-green-600">💵</span>
        </div>
        <div class="mt-2 text-sm text-blue-600">Saldo restante</div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">Proyectos en curso</p>
            <p class="text-2xl font-bold">{{ proyectosActivos }}</p>
          </div>
          <span class="text-3xl text-purple-600">🚧</span>
        </div>
        <div class="mt-2 text-sm text-gray-600">Con presupuesto asignado</div>
      </div>
    </div>

    <!-- Gráficos de Presupuesto -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card">
        <h3 class="text-lg font-semibold mb-4">Distribución por Categoría</h3>
        <div style="height: 300px;">
          <BudgetPieChart :data="budgetDistributionData" />
        </div>
      </div>
      
      <div class="card">
        <h3 class="text-lg font-semibold mb-4">Ejecución Mensual</h3>
        <div style="height: 300px;">
          <MonthlyExecutionChart :data="monthlyData" />
        </div>
      </div>
    </div>

    <!-- Tabla detallada de presupuestos -->
    <div class="card">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">Detalle por Categoría</h3>
        <div class="flex gap-2">
          <input 
            v-model="filtroCategoria" 
            type="text" 
            placeholder="Buscar categoría..." 
            class="input-field text-sm py-1"
          >
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="border-b bg-gray-50">
              <th class="text-left py-3 px-4">Categoría</th>
              <th class="text-left py-3 px-4">Presupuesto Asignado</th>
              <th class="text-left py-3 px-4">Ejecutado</th>
              <th class="text-left py-3 px-4">Disponible</th>
              <th class="text-left py-3 px-4">% Ejecución</th>
              <th class="text-left py-3 px-4">Proyectos</th>
              <th class="text-left py-3 px-4">Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredPresupuestos" :key="item.id" class="border-b hover:bg-gray-50">
              <td class="py-3 px-4 font-medium">{{ item.categoria }}</td>
              <td class="py-3 px-4">${{ formatNumber(item.asignado) }}</td>
              <td class="py-3 px-4">${{ formatNumber(item.ejecutado) }}</td>
              <td class="py-3 px-4">${{ formatNumber(item.disponible) }}</td>
              <td class="py-3 px-4">
                <div class="flex items-center gap-2">
                  <div class="w-24 bg-gray-200 rounded-full h-2">
                    <div class="bg-primary-600 rounded-full h-2" 
                      :style="{ width: porcentaje(item.ejecutado, item.asignado) + '%' }">
                    </div>
                  </div>
                  <span class="text-sm">{{ porcentaje(item.ejecutado, item.asignado) }}%</span>
                </div>
              </td>
              <td class="py-3 px-4">
                <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  {{ item.proyectos || 3 }} proyectos
                </span>
              </td>
              <td class="py-3 px-4">
                <span class="px-2 py-1 text-xs rounded-full" 
                  :class="{
                    'bg-green-100 text-green-800': (item.ejecutado / item.asignado) < 0.7,
                    'bg-yellow-100 text-yellow-800': (item.ejecutado / item.asignado) >= 0.7 && (item.ejecutado / item.asignado) < 0.9,
                    'bg-red-100 text-red-800': (item.ejecutado / item.asignado) >= 0.9
                  }">
                  {{ getEstadoPresupuesto(item) }}
                </span>
              </td>
            </tr>
          </tbody>
          <tfoot class="bg-gray-50 font-semibold">
            <tr>
              <td class="py-3 px-4">TOTAL</td>
              <td class="py-3 px-4">${{ formatNumber(totalAsignado) }}</td>
              <td class="py-3 px-4">${{ formatNumber(totalEjecutado) }}</td>
              <td class="py-3 px-4">${{ formatNumber(totalDisponible) }}</td>
              <td class="py-3 px-4">{{ porcentajeEjecucion }}%</td>
              <td class="py-3 px-4"></td>
              <td class="py-3 px-4"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- Proyectos por categoría -->
    <div class="card">
      <h3 class="text-lg font-semibold mb-4">Proyectos por Categoría</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="categoria in categoriasConProyectos" :key="categoria.nombre" 
          class="border rounded-lg p-4 hover:shadow-md transition-shadow">
          <div class="flex justify-between items-start mb-2">
            <h4 class="font-semibold">{{ categoria.nombre }}</h4>
            <span class="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
              {{ categoria.proyectos.length }} proyectos
            </span>
          </div>
          <p class="text-sm text-gray-600 mb-2">Presupuesto: ${{ formatNumber(categoria.presupuesto) }}</p>
          <div class="space-y-2">
            <div v-for="proyecto in categoria.proyectos.slice(0, 2)" :key="proyecto.id" 
              class="text-xs flex justify-between">
              <span>{{ proyecto.nombre }}</span>
              <span class="text-gray-500">${{ formatNumber(proyecto.presupuesto) }}</span>
            </div>
            <div v-if="categoria.proyectos.length > 2" class="text-xs text-primary-600">
              +{{ categoria.proyectos.length - 2 }} más
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../services/api'
import BudgetPieChart from '../components/BudgetPieChart.vue'
import MonthlyExecutionChart from '../components/MonthlyExecutionChart.vue'

const presupuestos = ref([])
const proyectos = ref([])
const añoSeleccionado = ref('2024')
const filtroCategoria = ref('')

// Datos mensuales para el gráfico
const monthlyData = ref({
  labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  datasets: [
    {
      label: 'Ejecutado',
      data: [45000, 52000, 48000, 61000, 55000, 58000, 62000, 59000, 63000, 0, 0, 0],
      backgroundColor: '#3b82f6',
    },
    {
      label: 'Planificado',
      data: [50000, 50000, 50000, 60000, 60000, 60000, 60000, 60000, 60000, 60000, 60000, 60000],
      backgroundColor: '#93c5fd',
    }
  ]
})

onMounted(async () => {
  try {
    const [presupuestosRes, proyectosRes] = await Promise.all([
      api.getPresupuestos(),
      api.getProyectos()
    ])
    presupuestos.value = presupuestosRes.data.map(p => ({
      ...p,
      proyectos: proyectosRes.data.filter(proy => 
        proy.categoria === p.categoria || 
        (p.categoria === 'Infraestructura' && proy.nombre.includes('Parque')) ||
        (p.categoria === 'Cultura' && proy.nombre.includes('Centro'))
      )
    }))
    proyectos.value = proyectosRes.data
  } catch (error) {
    console.error('Error cargando presupuestos:', error)
    // Datos de ejemplo si falla la API
    presupuestos.value = [
      { id: 1, categoria: 'Infraestructura', asignado: 500000, ejecutado: 350000, disponible: 150000, año: 2024, proyectos: proyectos.value.filter(p => p.nombre.includes('Parque') || p.nombre.includes('Alumbrado')) },
      { id: 2, categoria: 'Educación', asignado: 300000, ejecutado: 120000, disponible: 180000, año: 2024, proyectos: [] },
      { id: 3, categoria: 'Salud', asignado: 400000, ejecutado: 280000, disponible: 120000, año: 2024, proyectos: [] },
      { id: 4, categoria: 'Seguridad', asignado: 250000, ejecutado: 180000, disponible: 70000, año: 2024, proyectos: [] },
      { id: 5, categoria: 'Cultura', asignado: 150000, ejecutado: 45000, disponible: 105000, año: 2024, proyectos: proyectos.value.filter(p => p.nombre.includes('Centro')) }
    ]
  }
})

const filteredPresupuestos = computed(() => {
  if (!filtroCategoria.value) return presupuestos.value
  return presupuestos.value.filter(p => 
    p.categoria.toLowerCase().includes(filtroCategoria.value.toLowerCase())
  )
})

const totalAsignado = computed(() => {
  return presupuestos.value.reduce((acc, item) => acc + item.asignado, 0)
})

const totalEjecutado = computed(() => {
  return presupuestos.value.reduce((acc, item) => acc + item.ejecutado, 0)
})

const totalDisponible = computed(() => {
  return presupuestos.value.reduce((acc, item) => acc + item.disponible, 0)
})

const totalPresupuesto = computed(() => totalAsignado.value)

const porcentajeEjecucion = computed(() => {
  if (totalAsignado.value === 0) return 0
  return Math.round((totalEjecutado.value / totalAsignado.value) * 100)
})

const proyectosActivos = computed(() => {
  return proyectos.value.filter(p => p.estado === 'En progreso').length
})

const budgetDistributionData = computed(() => {
  return {
    labels: presupuestos.value.map(p => p.categoria),
    datasets: [{
      data: presupuestos.value.map(p => p.asignado),
      backgroundColor: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
      borderWidth: 1
    }]
  }
})

const categoriasConProyectos = computed(() => {
  return presupuestos.value.map(p => ({
    nombre: p.categoria,
    presupuesto: p.asignado,
    proyectos: p.proyectos || []
  })).filter(c => c.proyectos.length > 0)
})

const añoActual = computed(() => {
  return new Date().getFullYear()
})

const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

const porcentaje = (ejecutado, asignado) => {
  if (asignado === 0) return 0
  return Math.round((ejecutado / asignado) * 100)
}

const getEstadoPresupuesto = (item) => {
  const porcentaje = item.ejecutado / item.asignado
  if (porcentaje < 0.7) return 'Normal'
  if (porcentaje < 0.9) return 'Advertencia'
  return 'Crítico'
}
</script>