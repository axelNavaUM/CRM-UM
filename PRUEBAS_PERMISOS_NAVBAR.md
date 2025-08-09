# Pruebas del Sistema de Permisos en Navbar

## 🔍 Verificación de Permisos

El sistema ahora filtra los botones del navbar según los permisos del usuario. Para probar:

### 📱 Logs de Depuración

Abre la consola del navegador o las herramientas de desarrollo y busca estos logs:

```
🔍 Verificando acceso a explore - Rol: director, Área: Dirección
🔍 explore: Rol=false, Área=false, Acceso=false
🔍 Navbar: explore - Acceso: false

🔍 Verificando acceso a altaUsuario - Rol: director, Área: Dirección  
🔍 altaUsuario: Rol=true, Área=true, Acceso=true
🔍 Navbar: altaUsuario - Acceso: true
```

### 🎯 Comportamiento Esperado por Rol

#### Para Director (axelhernandez20720@gmail.com):
**✅ Botones que DEBEN aparecer:**
- Gestión de Usuarios (`altaUsuario`)
- Notificaciones (`notificaciones`)

**❌ Botones que NO deben aparecer:**
- Actividades (`explore`)
- Alta Alumnos (`altaAlumno`)
- Gestión Peticiones (`gestionPeticiones`)

#### Para Asesor (2345364567@univermilenium.edu.mx):
**✅ Botones que DEBEN aparecer:**
- Actividades (`explore`)
- Alta Alumnos (`altaAlumno`)
- Gestión Peticiones (`gestionPeticiones`)
- Notificaciones (`notificaciones`)

**❌ Botones que NO deben aparecer:**
- Gestión de Usuarios (`altaUsuario`)

### 🔧 Cómo Verificar

1. **Inicia sesión con el director:**
   ```
   Email: axelhernandez20720@gmail.com
   ```

2. **Verifica en la consola los logs:**
   - Busca los logs que empiecen con `🔍`
   - Confirma que solo aparecen los botones permitidos

3. **Inicia sesión con el asesor:**
   ```
   Email: 2345364567@univermilenium.edu.mx
   ```

4. **Verifica nuevamente los logs y botones**

### 🐛 Solución de Problemas

#### Si todos los botones aparecen:
- Verifica que `userRoleInfo` se esté cargando correctamente
- Revisa los logs para ver si hay errores en la carga de datos

#### Si ningún botón aparece:
- Verifica que el usuario esté autenticado
- Revisa si `userRoleInfo` es `null`

#### Si los permisos no coinciden:
- Verifica que los nombres de roles y áreas coincidan exactamente con la base de datos
- Revisa la configuración en `useScreenPermissions.ts`

### 📊 Configuración de Permisos

Los permisos están configurados en `hooks/permisos/useScreenPermissions.ts`:

```typescript
const screenPermissions: { [key: string]: { roles: string[], areas: string[] } } = {
  'explore': {
    roles: ['Asesor', 'Jefe de Ventas', 'jefe de coordinacion', 'jefe de control', 'jefe de caja', 'superSu', 'administrador'],
    areas: ['Ventas', 'Coordinación', 'Control Escolar', 'Caja', 'Administrador']
  },
  'altaUsuario': {
    roles: ['superSu', 'administrador', 'director'],
    areas: ['superSu', 'Administrador', 'Dirección']
  },
  // ... más configuraciones
};
```

### 🔄 Actualización de Permisos

Para cambiar los permisos:

1. **Edita la configuración en `useScreenPermissions.ts`**
2. **Reinicia la aplicación**
3. **Verifica los logs en la consola**
4. **Prueba con diferentes usuarios**

### 📝 Notas Importantes

- Los permisos se verifican en tiempo real
- Los resultados se cachean para mejor rendimiento
- Los logs ayudan a depurar problemas
- El sistema es responsivo (funciona en móvil y desktop) 