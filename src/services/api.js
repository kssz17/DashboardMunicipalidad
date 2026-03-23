import axios from 'axios'

// Datos mock para cuando no hay servidor
const mockData = {
  usuarios: [
    { id: 1, nombre: "Juan Pérez", email: "juan@email.com", rol: "Ciudadano", fechaRegistro: "2024-01-15", estado: "Activo" },
    { id: 2, nombre: "María García", email: "maria@email.com", rol: "Funcionario", fechaRegistro: "2024-02-20", estado: "Activo" },
    { id: 3, nombre: "Carlos López", email: "carlos@email.com", rol: "Ciudadano", fechaRegistro: "2024-03-10", estado: "Inactivo" },
    { id: 4, nombre: "Ana Martínez", email: "ana@email.com", rol: "Administrador", fechaRegistro: "2024-01-05", estado: "Activo" },
    { id: 5, nombre: "Roberto Sánchez", email: "roberto@email.com", rol: "Ciudadano", fechaRegistro: "2024-03-22", estado: "Activo" }
  ],
  proyectos: [
    { id: 1, nombre: "Parque Central", descripcion: "Remodelación del parque principal", presupuesto: 150000, estado: "En progreso", fechaInicio: "2024-02-01", fechaFin: "2024-06-30", progreso: 45 },
    { id: 2, nombre: "Alumbrado Público", descripcion: "Instalación de nuevas luminarias LED", presupuesto: 80000, estado: "Completado", fechaInicio: "2024-01-10", fechaFin: "2024-03-15", progreso: 100 },
    { id: 3, nombre: "Ciclovías", descripcion: "Construcción de red de ciclovías", presupuesto: 200000, estado: "Planificado", fechaInicio: "2024-05-01", fechaFin: "2024-10-30", progreso: 0 },
    { id: 4, nombre: "Centro Cultural", descripcion: "Rehabilitación del centro cultural", presupuesto: 300000, estado: "En progreso", fechaInicio: "2024-03-01", fechaFin: "2024-09-30", progreso: 25 }
  ],
  presupuestos: [
    { id: 1, categoria: "Infraestructura", asignado: 500000, ejecutado: 350000, disponible: 150000, año: 2024 },
    { id: 2, categoria: "Educación", asignado: 300000, ejecutado: 120000, disponible: 180000, año: 2024 },
    { id: 3, categoria: "Salud", asignado: 400000, ejecutado: 280000, disponible: 120000, año: 2024 },
    { id: 4, categoria: "Seguridad", asignado: 250000, ejecutado: 180000, disponible: 70000, año: 2024 },
    { id: 5, categoria: "Cultura", asignado: 150000, ejecutado: 45000, disponible: 105000, año: 2024 }
  ],
  reportes: [
    { id: 1, tipo: "Mensual", fecha: "2024-03-31", descripcion: "Reporte de actividades marzo 2024", archivo: "reporte_marzo.pdf" },
    { id: 2, tipo: "Trimestral", fecha: "2024-03-31", descripcion: "Reporte Q1 2024", archivo: "reporte_q1.pdf" },
    { id: 3, tipo: "Presupuestario", fecha: "2024-02-28", descripcion: "Ejecución presupuestaria febrero", archivo: "presupuesto_feb.pdf" }
  ]
}

// Incrementar IDs para nuevos registros
let nextIds = {
  usuarios: 6,
  proyectos: 5,
  presupuestos: 6,
  reportes: 4
}

const api = axios.create({
  baseURL: 'http://localhost:3001', // Cambiado a 3001
  timeout: 5000
})

// Interceptor para manejar errores de red y usar datos mock
api.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.log('⚠️ Usando datos mock (JSON Server no disponible)')
      
      // Devolver una respuesta simulada basada en la petición original
      const config = error.config
      const method = config.method.toLowerCase()
      const url = config.url
      
      // Extraer el recurso de la URL (ej: /usuarios -> usuarios)
      const resource = url.split('/')[1]?.split('?')[0]
      
      if (method === 'get') {
        if (resource === 'usuarios') {
          return Promise.resolve({ data: mockData.usuarios })
        } else if (resource === 'proyectos') {
          return Promise.resolve({ data: mockData.proyectos })
        } else if (resource === 'presupuestos') {
          return Promise.resolve({ data: mockData.presupuestos })
        } else if (resource === 'reportes') {
          return Promise.resolve({ data: mockData.reportes })
        }
      } else if (method === 'post') {
        const newData = JSON.parse(config.data)
        newData.id = nextIds[resource]++
        mockData[resource].push(newData)
        return Promise.resolve({ data: newData })
      } else if (method === 'put') {
        const id = parseInt(url.split('/')[2])
        const updatedData = JSON.parse(config.data)
        const index = mockData[resource].findIndex(item => item.id === id)
        if (index !== -1) {
          mockData[resource][index] = { ...mockData[resource][index], ...updatedData }
          return Promise.resolve({ data: mockData[resource][index] })
        }
      } else if (method === 'delete') {
        const id = parseInt(url.split('/')[2])
        const index = mockData[resource].findIndex(item => item.id === id)
        if (index !== -1) {
          mockData[resource].splice(index, 1)
          return Promise.resolve({ data: { success: true } })
        }
      }
    }
    return Promise.reject(error)
  }
)

export default {
  // Usuarios
  getUsuarios() {
    return api.get('/usuarios')
  },
  createUsuario(data) {
    return api.post('/usuarios', data)
  },
  updateUsuario(id, data) {
    return api.put(`/usuarios/${id}`, data)
  },
  deleteUsuario(id) {
    return api.delete(`/usuarios/${id}`)
  },
  
  // Proyectos
  getProyectos() {
    return api.get('/proyectos')
  },
  createProyecto(data) {
    return api.post('/proyectos', data)
  },
  updateProyecto(id, data) {
    return api.put(`/proyectos/${id}`, data)
  },
  deleteProyecto(id) {
    return api.delete(`/proyectos/${id}`)
  },
  
  // Presupuestos
  getPresupuestos() {
    return api.get('/presupuestos')
  },
  
  // Reportes
  getReportes() {
    return api.get('/reportes')
  }
}