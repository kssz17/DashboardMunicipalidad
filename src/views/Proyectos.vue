<template>
  <div class="space-y-6 text-gray-200">

    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between gap-4">
      <h2 class="text-xl md:text-2xl font-semibold">Gestión de Proyectos</h2>

      <button @click="showModal = true" class="bg-indigo-600 px-4 py-2 rounded-lg">
        ➕ Nuevo
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-gray-900/70 border border-gray-800 rounded-xl p-4 flex flex-col md:flex-row gap-3">
      <input v-model="filters.search" placeholder="Buscar..." 
        class="flex-1 bg-gray-800 px-3 py-2 rounded-lg text-sm">

      <select v-model="filters.estado" class="bg-gray-800 px-3 py-2 rounded-lg text-sm">
        <option value="">Todos</option>
        <option value="Planificado">Planificado</option>
      </select>
    </div>

    <!-- Table -->
    <div class="bg-gray-900/70 border border-gray-800 rounded-xl p-4 overflow-x-auto">
      <table class="min-w-[700px] w-full text-sm">
        <thead class="text-gray-400 border-b border-gray-800">
          <tr>
            <th class="py-2 text-left">Nombre</th>
            <th>Estado</th>
            <th>Progreso</th>
            <th>Presupuesto</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="p in filteredProyectos" :key="p.id" class="border-b border-gray-800">
            <td class="py-3">{{ p.nombre }}</td>

            <td>
              <span class="text-xs px-2 py-1 rounded bg-gray-700">
                {{ p.estado }}
              </span>
            </td>

            <td>
              <div class="w-full max-w-[120px] bg-gray-800 h-2 rounded">
                <div class="bg-indigo-500 h-2 rounded" :style="{ width: p.progreso + '%' }"></div>
              </div>
            </td>

            <td>${{ formatNumber(p.presupuesto) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../services/api'

const proyectos = ref([])
const showModal = ref(false)
const editingProject = ref(null)
const filters = ref({
  search: '',
  estado: ''
})

const form = ref({
  nombre: '',
  descripcion: '',
  presupuesto: 0,
  estado: 'Planificado',
  fechaInicio: new Date().toISOString().split('T')[0],
  fechaFin: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  progreso: 0
})

onMounted(async () => {
  await loadProjects()
})

const loadProjects = async () => {
  try {
    const response = await api.getProyectos()
    proyectos.value = response.data
    console.log('Proyectos cargados:', proyectos.value)
  } catch (error) {
    console.error('Error cargando proyectos:', error)
    // Datos de ejemplo por si falla la API
    proyectos.value = [
      { id: 1, nombre: "Parque Central", descripcion: "Remodelación del parque principal", presupuesto: 150000, estado: "En progreso", fechaInicio: "2024-02-01", fechaFin: "2024-06-30", progreso: 45 },
      { id: 2, nombre: "Alumbrado Público", descripcion: "Instalación de nuevas luminarias LED", presupuesto: 80000, estado: "Completado", fechaInicio: "2024-01-10", fechaFin: "2024-03-15", progreso: 100 },
      { id: 3, nombre: "Ciclovías", descripcion: "Construcción de red de ciclovías", presupuesto: 200000, estado: "Planificado", fechaInicio: "2024-05-01", fechaFin: "2024-10-30", progreso: 0 },
      { id: 4, nombre: "Centro Cultural", descripcion: "Rehabilitación del centro cultural", presupuesto: 300000, estado: "En progreso", fechaInicio: "2024-03-01", fechaFin: "2024-09-30", progreso: 25 }
    ]
  }
}

const filteredProyectos = computed(() => {
  return proyectos.value.filter(proyecto => {
    const matchesSearch = proyecto.nombre.toLowerCase().includes(filters.value.search.toLowerCase()) ||
                         proyecto.descripcion.toLowerCase().includes(filters.value.search.toLowerCase())
    const matchesEstado = !filters.value.estado || proyecto.estado === filters.value.estado
    return matchesSearch && matchesEstado
  })
})

const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })
}

const editProject = (project) => {
  editingProject.value = project
  form.value = { ...project }
  showModal.value = true
}

const deleteProject = async (id) => {
  if (confirm('¿Estás seguro de eliminar este proyecto?')) {
    try {
      await api.deleteProyecto(id)
      await loadProjects()
    } catch (error) {
      console.error('Error eliminando proyecto:', error)
      // Fallback: eliminar localmente
      proyectos.value = proyectos.value.filter(p => p.id !== id)
    }
  }
}

const saveProject = async () => {
  try {
    if (editingProject.value) {
      await api.updateProyecto(editingProject.value.id, form.value)
    } else {
      await api.createProyecto(form.value)
    }
    await loadProjects()
    closeModal()
  } catch (error) {
    console.error('Error guardando proyecto:', error)
    // Fallback: guardar localmente
    if (editingProject.value) {
      const index = proyectos.value.findIndex(p => p.id === editingProject.value.id)
      if (index !== -1) {
        proyectos.value[index] = { ...form.value, id: editingProject.value.id }
      }
    } else {
      const newProject = {
        ...form.value,
        id: Math.max(...proyectos.value.map(p => p.id), 0) + 1
      }
      proyectos.value.push(newProject)
    }
    closeModal()
  }
}

const closeModal = () => {
  showModal.value = false
  editingProject.value = null
  form.value = {
    nombre: '',
    descripcion: '',
    presupuesto: 0,
    estado: 'Planificado',
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    progreso: 0
  }
}
</script>