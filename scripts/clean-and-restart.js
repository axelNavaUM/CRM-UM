// Script para limpiar completamente la sesión y reiniciar
// Ejecutar en la consola del navegador

console.log('🧹 Limpieza completa de sesión...');

// Limpiar localStorage completamente
if (typeof window !== 'undefined' && window.localStorage) {
  console.log('🗑️ Limpiando localStorage...');
  window.localStorage.clear();
}

// Limpiar sessionStorage completamente
if (typeof window !== 'undefined' && window.sessionStorage) {
  console.log('🗑️ Limpiando sessionStorage...');
  window.sessionStorage.clear();
}

// Limpiar cookies relacionadas
if (typeof window !== 'undefined' && window.document) {
  console.log('🗑️ Limpiando cookies...');
  const cookies = document.cookie.split(';');
  cookies.forEach(cookie => {
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
  });
}

// Forzar recarga completa
console.log('🔄 Recargando aplicación...');
window.location.href = window.location.href;

console.log('✅ Limpieza completada. La página se recargará automáticamente.'); 