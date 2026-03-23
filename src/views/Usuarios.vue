<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold">Gestión de Usuarios</h2>
      <button @click="showModal = true" class="btn-primary flex items-center">
        <span class="mr-2">➕</span> Nuevo Usuario
      </button>
    </div>

    <!-- Filters -->
    <div class="card flex gap-4">
      <input 
        v-model="filters.search" 
        type="text" 
        placeholder="Buscar usuario..." 
        class="input-field flex-1"
      >
      <select v-model="filters.rol" class="input-field w-48">
        <option value="">Todos los roles</option>
        <option value="Ciudadano">Ciudadano</option>
        <option value="Funcionario">Funcionario</option>
        <option value="Administrador">Administrador</option>
      </select>
      <select v-model="filters.estado" class="input-field w-48">
        <option value="">Todos los estados</option>
        <option value="Activo">Activo</option>
        <option value="Inactivo">Inactivo</option>
      </select>
    </div>

    <!-- Users Table -->
    <div class="card">
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="border-b">
              <th class="text-left py-3">ID</th>
              <th class="text-left py-3">Nombre</th>
              <th class="text-left py-3">Email</th>
              <th class="text-left py-3">Rol</th>
              <th class="text-left py-3">Fecha Registro</th>
              <th class="text-left py-3">Estado</th>
              <th class="text-left py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="usuario in filteredUsuarios" :key="usuario.id" class="border-b hover:bg-gray-50">
              <td class="py-3">{{ usuario.id }}</td>
              <td class="py-3 font-medium">{{ usuario.nombre }}</td>
              <td class="py-3">{{ usuario.email }}</td>
              <td class="py-3">{{ usuario.rol }}</td>
              <td class="py-3">{{ formatDate(usuario.fechaRegistro) }}</td>
              <td class="py-3">
                <span class="px-2 py-1 text-xs rounded-full" 
                  :class="usuario.estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                  {{ usuario.estado }}
                </span>
              </td>
              <td class="py-3">
                <button @click="editUser(usuario)" class="text-blue-600 hover:text-blue-800 mr-3">✏️</button>
                <button @click="deleteUser(usuario.id)" class="text-red-600 hover:text-red-800">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 w-96">
        <h3 class="text-lg font-semibold mb-4">{{ editingUser ? 'Editar' : 'Nuevo' }} Usuario</h3>
        <form @submit.prevent="saveUser">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1">Nombre</label>
              <input v-model="form.nombre" type="text" required class="input-field">
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Email</label>
              <input v-model="form.email" type="email" required class="input-field">
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Rol</label>
              <select v-model="form.rol" required class="input-field">
                <option value="Ciudadano">Ciudadano</option>
                <option value="Funcionario">Funcionario</option>
                <option value="Administrador">Administrador</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Estado</label>
              <select v-model="form.estado" required class="input-field">
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
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