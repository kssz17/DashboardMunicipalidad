<template>
  <div class="space-y-6 text-gray-200">

    <!-- Header -->
    <div class="flex justify-between">
      <h2 class="text-xl md:text-2xl font-semibold">Usuarios</h2>
      <button class="bg-indigo-600 px-4 py-2 rounded-lg">➕ Nuevo</button>
    </div>

    <!-- Filters -->
    <div class="bg-gray-900 border border-gray-800 p-4 rounded-xl flex flex-col md:flex-row gap-3">
      <input placeholder="Buscar..." class="flex-1 bg-gray-800 px-3 py-2 rounded-lg text-sm">
    </div>

    <!-- Table -->
    <div class="bg-gray-900 border border-gray-800 rounded-xl p-4 overflow-x-auto">
      <table class="min-w-[600px] w-full text-sm">
        <thead class="text-gray-400 border-b border-gray-800">
          <tr>
            <th class="text-left py-2">Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Estado</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="u in filteredUsuarios" :key="u.id" class="border-b border-gray-800">
            <td class="py-3">{{ u.nombre }}</td>
            <td>{{ u.email }}</td>
            <td>{{ u.rol }}</td>
            <td>
              <span class="text-xs px-2 py-1 rounded bg-gray-700">
                {{ u.estado }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../services/api'

const usuarios = ref([])
const showModal = ref(false)
const editingUser = ref(null)
const filters = ref({
  search: '',
  rol: '',
  estado: ''
})
const form = ref({
  nombre: '',
  email: '',
  rol: 'Ciudadano',
  estado: 'Activo'
})

onMounted(async () => {
  await loadUsers()
})

const loadUsers = async () => {
  try {
    const response = await api.getUsuarios()
    usuarios.value = response.data
  } catch (error) {
    console.error('Error cargando usuarios:', error)
  }
}

const filteredUsuarios = computed(() => {
  return usuarios.value.filter(user => {
    const matchesSearch = user.nombre.toLowerCase().includes(filters.value.search.toLowerCase()) ||
                         user.email.toLowerCase().includes(filters.value.search.toLowerCase())
    const matchesRol = !filters.value.rol || user.rol === filters.value.rol
    const matchesEstado = !filters.value.estado || user.estado === filters.value.estado
    return matchesSearch && matchesRol && matchesEstado
  })
})

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-ES')
}

const editUser = (user) => {
  editingUser.value = user
  form.value = { ...user }
  showModal.value = true
}

const deleteUser = async (id) => {
  if (confirm('¿Estás seguro de eliminar este usuario?')) {
    try {
      await api.deleteUsuario(id)
      await loadUsers()
    } catch (error) {
      console.error('Error eliminando usuario:', error)
    }
  }
}

const saveUser = async () => {
  try {
    const today = new Date().toISOString().split('T')[0]
    if (editingUser.value) {
      await api.updateUsuario(editingUser.value.id, form.value)
    } else {
      await api.createUsuario({ ...form.value, fechaRegistro: today })
    }
    await loadUsers()
    closeModal()
  } catch (error) {
    console.error('Error guardando usuario:', error)
  }
}

const closeModal = () => {
  showModal.value = false
  editingUser.value = null
  form.value = {
    nombre: '',
    email: '',
    rol: 'Ciudadano',
    estado: 'Activo'
  }
}
</script>