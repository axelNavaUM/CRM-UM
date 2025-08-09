// Script para limpiar la sesión y reiniciar la aplicación
// Ejecutar en la consola del navegador

console.log('🔄 Reiniciando aplicación...');

// Limpiar localStorage
if (typeof window !== 'undefined' && window.localStorage) {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.includes('auth') || key.includes('user') || key.includes('role')) {
      console.log(`🗑️ Eliminando: ${key}`);
      localStorage.removeItem(key);
    }
  });
}

// Limpiar sessionStorage
if (typeof window !== 'undefined' && window.sessionStorage) {
  const keys = Object.keys(sessionStorage);
  keys.forEach(key => {
    if (key.includes('auth') || key.includes('user') || key.includes('role')) {
      console.log(`🗑️ Eliminando: ${key}`);
      sessionStorage.removeItem(key);
    }
  });
}

// Limpiar cualquier estado de Zustand en memoria
if (typeof window !== 'undefined') {
  // Forzar limpieza de stores
  window.location.reload();
}

console.log('✅ Aplicación reiniciada. Inicia sesión nuevamente.'); 