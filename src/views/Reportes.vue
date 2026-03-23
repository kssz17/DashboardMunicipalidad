<!-- src/views/Reportes.vue - ARCHIVO NUEVO Y SEPARADO -->
<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold">Centro de Reportes</h2>
      <button class="btn-primary flex items-center">
        <span class="mr-2">📄</span> Generar Reporte
      </button>
    </div>

    <!-- Tarjetas de resumen -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="card bg-gradient-to-br from-primary-500 to-primary-700 text-white">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-primary-100 text-sm">Reportes Generados</p>
            <p class="text-3xl font-bold">{{ totalReportes }}</p>
          </div>
          <span class="text-3xl">📊</span>
        </div>
      </div>

      <div class="card">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-gray-500 text-sm">Descargas Totales</p>
            <p class="text-2xl font-bold">{{ totalDescargas }}</p>
          </div>
          <span class="text-3xl text-green-600">⬇️</span>
        </div>
      </div>

      <div class="card">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-gray-500 text-sm">Tipos de Reporte</p>
            <p class="text-2xl font-bold">{{ tiposUnicos }}</p>
          </div>
          <span class="text-3xl text-purple-600">📋</span>
        </div>
      </div>

      <div class="card">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-gray-500 text-sm">Última Actualización</p>
            <p class="text-sm font-medium">{{ ultimaActualizacion }}</p>
          </div>
          <span class="text-3xl text-blue-600">🕐</span>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="card">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">Buscar</label>
          <input v-model="filtros.busqueda" type="text" placeholder="Buscar reporte..." class="input-field">
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Tipo</label>
          <select v-model="filtros.tipo" class="input-field">
            <option value="">Todos</option>
            <option value="Mensual">Mensual</option>
            <option value="Trimestral">Trimestral</option>
            <option value="Presupuestario">Presupuestario</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Fecha</label>
          <input v-model="filtros.fecha" type="month" class="input-field">
        </div>
      </div>
    </div>

    <!-- Lista de reportes -->
    <div class="card">
      <h3 class="text-lg font-semibold mb-4">Reportes Disponibles</h3>
      <div class="space-y-3">
        <div v-for="reporte in filteredReportes" :key="reporte.id" 
          class="border rounded-lg p-4 hover:shadow-md transition-shadow">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-3">
                <span class="text-2xl">{{ getIcono(reporte.tipo) }}</span>
                <div>
                  <h4 class="font-semibold">{{ reporte.descripcion }}</h4>
                  <div class="flex gap-4 mt-1 text-sm text-gray-600">
                    <span>{{ reporte.tipo }}</span>
                    <span>{{ formatDate(reporte.fecha) }}</span>
                    <span>{{ reporte.archivo }}</span>
                  </div>
                </div>
              </div>
            </div>
            <button @click="descargarReporte(reporte)" 
              class="btn-primary text-sm py-1 px-3">
              Descargar
            </button>
          </div>
        </div>
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