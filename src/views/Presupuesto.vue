<template>
  <div class="space-y-6 text-gray-200">

    <!-- Header -->
    <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
      <h2 class="text-xl md:text-2xl font-semibold">
        Ejecución Presupuestaria {{ añoActual }}
      </h2>

      <div class="flex flex-wrap gap-2">
        <select v-model="añoSeleccionado" class="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm">
          <option value="2024">2024</option>
          <option value="2023">2023</option>
        </select>

        <button class="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-sm flex items-center">
          📊 Exportar
        </button>
      </div>
    </div>

    <!-- KPI -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <div class="bg-gray-900/70 border border-gray-800 rounded-xl p-4">
        <p class="text-gray-400 text-sm">Presupuesto Total</p>
        <p class="text-xl font-semibold">${{ formatNumber(totalPresupuesto) }}</p>
      </div>

      <div class="bg-gray-900/70 border border-gray-800 rounded-xl p-4">
        <p class="text-gray-400 text-sm">Ejecutado</p>
        <p class="text-xl font-semibold">${{ formatNumber(totalEjecutado) }}</p>
      </div>

      <div class="bg-gray-900/70 border border-gray-800 rounded-xl p-4">
        <p class="text-gray-400 text-sm">Disponible</p>
        <p class="text-xl font-semibold">${{ formatNumber(totalDisponible) }}</p>
      </div>

      <div class="bg-gray-900/70 border border-gray-800 rounded-xl p-4">
        <p class="text-gray-400 text-sm">Proyectos</p>
        <p class="text-xl font-semibold">{{ proyectosActivos }}</p>
      </div>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="bg-gray-900/70 border border-gray-800 rounded-xl p-4">
        <h3 class="mb-3 text-gray-300">Distribución</h3>
        <div class="h-64 md:h-80">
          <BudgetPieChart :data="budgetDistributionData" />
        </div>
      </div>

      <div class="bg-gray-900/70 border border-gray-800 rounded-xl p-4">
        <h3 class="mb-3 text-gray-300">Ejecución Mensual</h3>
        <div class="h-64 md:h-80">
          <MonthlyExecutionChart :data="monthlyData" />
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