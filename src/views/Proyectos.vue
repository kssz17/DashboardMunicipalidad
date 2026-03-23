<!-- src/views/Proyectos.vue - COMPLETO -->
<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold">Gestión de Proyectos</h2>
      <button @click="showModal = true" class="btn-primary flex items-center">
        <span class="mr-2">➕</span> Nuevo Proyecto
      </button>
    </div>

    <!-- Filters -->
    <div class="card flex gap-4">
      <input 
        v-model="filters.search" 
        type="text" 
        placeholder="Buscar proyecto..." 
        class="input-field flex-1"
      >
      <select v-model="filters.estado" class="input-field w-48">
        <option value="">Todos los estados</option>
        <option value="Planificado">Planificado</option>
        <option value="En progreso">En progreso</option>
        <option value="Completado">Completado</option>
      </select>
    </div>

    <!-- Projects Table -->
    <div class="card">
      <div v-if="filteredProyectos.length > 0" class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="border-b">
              <th class="text-left py-3">ID</th>
              <th class="text-left py-3">Nombre</th>
              <th class="text-left py-3">Descripción</th>
              <th class="text-left py-3">Presupuesto</th>
              <th class="text-left py-3">Estado</th>
              <th class="text-left py-3">Progreso</th>
              <th class="text-left py-3">Fechas</th>
              <th class="text-left py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="proyecto in filteredProyectos" :key="proyecto.id" class="border-b hover:bg-gray-50">
              <td class="py-3">{{ proyecto.id }}</td>
              <td class="py-3 font-medium">{{ proyecto.nombre }}</td>
              <td class="py-3 max-w-xs truncate">{{ proyecto.descripcion }}</td>
              <td class="py-3">${{ formatNumber(proyecto.presupuesto) }}</td>
              <td class="py-3">
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
                  <div class="w-24 bg-gray-200 rounded-full h-2 mr-2">
                    <div class="bg-primary-600 rounded-full h-2" :style="{ width: proyecto.progreso + '%' }"></div>
                  </div>
                  <span>{{ proyecto.progreso }}%</span>
                </div>
              </td>
              <td class="py-3 text-sm">
                <div>Inicio: {{ formatDate(proyecto.fechaInicio) }}</div>
                <div>Fin: {{ formatDate(proyecto.fechaFin) }}</div>
              </td>
              <td class="py-3">
                <button @click="editProject(proyecto)" class="text-blue-600 hover:text-blue-800 mr-3">✏️</button>
                <button @click="deleteProject(proyecto.id)" class="text-red-600 hover:text-red-800">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-center py-8 text-gray-500">
        No hay proyectos disponibles. ¡Crea uno nuevo!
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
        <h3 class="text-lg font-semibold mb-4">{{ editingProject ? 'Editar' : 'Nuevo' }} Proyecto</h3>
        <form @submit.prevent="saveProject">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1">Nombre del Proyecto *</label>
              <input v-model="form.nombre" type="text" required class="input-field">
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Descripción</label>
              <textarea v-model="form.descripcion" rows="3" class="input-field"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Presupuesto ($) *</label>
              <input v-model.number="form.presupuesto" type="number" min="0" step="1000" required class="input-field">
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Estado</label>
              <select v-model="form.estado" required class="input-field">
                <option value="Planificado">Planificado</option>
                <option value="En progreso">En progreso</option>
                <option value="Completado">Completado</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Fecha de Inicio</label>
              <input v-model="form.fechaInicio" type="date" required class="input-field">
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Fecha de Fin</label>
              <input v-model="form.fechaFin" type="date" required class="input-field">
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Progreso (%)</label>
              <input v-model.number="form.progreso" type="number" min="0" max="100" class="input-field">
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button type="button" @click="closeModal" class="btn-secondary">Cancelar</button>
            <button type="submit" class="btn-primary">Guardar</button>
          </div>
        </form>
      </div>
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