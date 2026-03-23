    export function checkRouter() {
  console.log('=== DIAGNÓSTICO DE RUTAS ===')
  console.log('URL actual:', window.location.href)
  console.log('Pathname:', window.location.pathname)
  console.log('Base URL:', import.meta.env.BASE_URL)
  
  // Verificar links del menú
  const links = document.querySelectorAll('a')
  console.log('Links encontrados:', links.length)
  links.forEach((link, i) => {
    console.log(`Link ${i}:`, link.href, 'Texto:', link.textContent)
  })
}