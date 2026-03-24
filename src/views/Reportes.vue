<template>
  <div class="space-y-6 text-gray-200">

    <div class="flex justify-between items-center">
      <h2 class="text-xl md:text-2xl font-semibold">Reportes</h2>
      <button class="bg-indigo-600 px-4 py-2 rounded-lg">📄 Generar</button>
    </div>

    <!-- Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <div class="bg-gray-900 border border-gray-800 p-4 rounded-xl">
        <p class="text-gray-400 text-sm">Reportes</p>
        <p class="text-xl font-semibold">{{ totalReportes }}</p>
      </div>
    </div>

    <!-- Lista -->
    <div class="space-y-3">
      <div v-for="r in filteredReportes" :key="r.id"
        class="bg-gray-900 border border-gray-800 p-4 rounded-xl flex justify-between items-center">

        <div>
          <p class="font-medium">{{ r.descripcion }}</p>
          <p class="text-xs text-gray-400">{{ r.tipo }}</p>
        </div>

        <button class="bg-indigo-600 px-3 py-1 rounded text-sm">
          Descargar
        </button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../services/api'

const reportes = ref([])
const filtros = ref({
  busqueda: '',
  tipo: '',
  fecha: ''
})

onMounted(async () => {
  try {
    const response = await api.getReportes()
    reportes.value = response.data.map(r => ({
      ...r,
      descargas: Math.floor(Math.random() * 100)
    }))
  } catch (error) {
    console.error('Error cargando reportes:', error)
    reportes.value = [
      { id: 1, tipo: 'Mensual', fecha: '2024-03-31', descripcion: 'Reporte de actividades marzo 2024', archivo: 'reporte_marzo.pdf', descargas: 45 },
      { id: 2, tipo: 'Trimestral', fecha: '2024-03-31', descripcion: 'Reporte Q1 2024', archivo: 'reporte_q1.pdf', descargas: 78 },
      { id: 3, tipo: 'Presupuestario', fecha: '2024-02-28', descripcion: 'Ejecución presupuestaria febrero', archivo: 'presupuesto_feb.pdf', descargas: 23 }
    ]
  }
})

const filteredReportes = computed(() => {
  return reportes.value.filter(r => {
    const matchBusqueda = r.descripcion.toLowerCase().includes(filtros.value.busqueda.toLowerCase())
    const matchTipo = !filtros.value.tipo || r.tipo === filtros.value.tipo
    const matchFecha = !filtros.value.fecha || r.fecha.startsWith(filtros.value.fecha)
    return matchBusqueda && matchTipo && matchFecha
  })
})

const totalReportes = computed(() => reportes.value.length)
const totalDescargas = computed(() => reportes.value.reduce((acc, r) => acc + (r.descargas || 0), 0))
const tiposUnicos = computed(() => new Set(reportes.value.map(r => r.tipo)).size)
const ultimaActualizacion = computed(() => {
  if (reportes.value.length === 0) return 'N/A'
  const fechas = reportes.value.map(r => new Date(r.fecha))
  const ultima = new Date(Math.max(...fechas))
  return ultima.toLocaleDateString('es-ES')
})

const formatDate = (date) => new Date(date).toLocaleDateString('es-ES')
const getIcono = (tipo) => {
  const iconos = { Mensual: '📅', Trimestral: '📊', Presupuestario: '💰' }
  return iconos[tipo] || '📄'
}
const descargarReporte = (reporte) => alert(`Descargando ${reporte.archivo}...`)
</script>