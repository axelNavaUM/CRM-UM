// Script para limpiar la sesión actual
// Ejecutar en la consola del navegador

console.log('🧹 Limpiando sesión actual...');

// Limpiar localStorage
if (typeof window !== 'undefined' && window.localStorage) {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.includes('auth') || key.includes('user')) {
      console.log(`🗑️ Eliminando: ${key}`);
      localStorage.removeItem(key);
    }
  });
}

// Limpiar sessionStorage
if (typeof window !== 'undefined' && window.sessionStorage) {
  const keys = Object.keys(sessionStorage);
  keys.forEach(key => {
    if (key.includes('auth') || key.includes('user')) {
      console.log(`🗑️ Eliminando: ${key}`);
      sessionStorage.removeItem(key);
    }
  });
}

console.log('✅ Sesión limpiada. Recarga la página para iniciar sesión nuevamente.'); 