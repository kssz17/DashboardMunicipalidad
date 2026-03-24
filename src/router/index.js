
import { createRouter, createWebHashHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Usuarios from '../views/Usuarios.vue'
import Proyectos from '../views/Proyectos.vue'
import Presupuesto from '../views/Presupuesto.vue'
import Reportes from '../views/Reportes.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/dashboard', name: 'dashboard', component: Dashboard },
    { path: '/usuarios', name: 'usuarios', component: Usuarios },
    { path: '/proyectos', name: 'proyectos', component: Proyectos },
    { path: '/presupuesto', name: 'presupuesto', component: Presupuesto },
    { path: '/reportes', name: 'reportes', component: Reportes },
  ]
})

export default router