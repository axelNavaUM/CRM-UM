# Sistema de Permisos por Rol

## Configuración Basada en Datos Reales

El sistema de permisos está configurado según los roles y áreas reales de la base de datos.

## Roles y Áreas Disponibles

### 📊 Datos de la Base de Datos

| Área | Rol | Usuario Ejemplo |
|------|-----|-----------------|
| superSu | superSu | 623220018@univermilenium.edu.mx |
| Ventas | Jefe de Ventas | 6232200180@univermilenium.edu.mx |
| Ventas | Asesor | 2345364567@univermilenium.edu.mx |
| Administrador | administrador | 62322008@univermilenium.edu.mx |
| Coordinación | jefe de coordinacion | - |
| Control Escolar | jefe de control | 6232200174@univermilenium.edu.mx |
| Caja | jefe de caja | - |
| **Dirección** | **director** | **axelhernandez20720@gmail.com** |

## Permisos por Pantalla

### 🏠 Explore (Pantalla Principal)
**Acceso permitido para:**
- ✅ Asesor
- ✅ Jefe de Ventas  
- ✅ jefe de coordinacion
- ✅ jefe de control
- ✅ jefe de caja
- ✅ superSu
- ✅ administrador

**Áreas permitidas:**
- Ventas
- Coordinación
- Control Escolar
- Caja
- Administrador

### 👨‍🎓 Alta de Alumno
**Acceso permitido para:**
- ✅ Asesor
- ✅ Jefe de Ventas
- ✅ jefe de coordinacion

**Áreas permitidas:**
- Ventas
- Coordinación

### 👥 Gestión de Usuarios
**Acceso permitido para:**
- ✅ superSu
- ✅ administrador
- ✅ **director** ⭐

**Áreas permitidas:**
- superSu
- Administrador
- **Dirección** ⭐

### 📋 Gestión de Peticiones
**Acceso permitido para:**
- ✅ Asesor
- ✅ Jefe de Ventas
- ✅ jefe de coordinacion

**Áreas permitidas:**
- Ventas
- Coordinación

### 🔔 Notificaciones
**Acceso permitido para:**
- ✅ Asesor
- ✅ Jefe de Ventas
- ✅ jefe de coordinacion
- ✅ jefe de control
- ✅ jefe de caja
- ✅ superSu
- ✅ administrador
- ✅ **director** ⭐

**Áreas permitidas:**
- Ventas
- Coordinación
- Control Escolar
- Caja
- Administrador
- **Dirección** ⭐

## Configuración Especial para Director

### 🎯 Restricciones del Director
El director (rol: "director", área: "Dirección") tiene acceso limitado:

**✅ Pantallas a las que SÍ tiene acceso:**
1. **Gestión de Usuarios** (`altaUsuario`)
2. **Notificaciones** (`notificaciones`)

**❌ Pantallas a las que NO tiene acceso:**
1. **Explore** (pantalla principal)
2. **Alta de Alumno**
3. **Gestión de Peticiones**

### 🔒 Comportamiento del Sistema
- Si el director intenta acceder a una pantalla no autorizada, será redirigido automáticamente
- Los logs mostrarán: `🔒 Acceso denegado a [pantalla]: Rol o área no autorizada para esta pantalla`
- El director solo podrá navegar entre las pantallas permitidas

## Implementación Técnica

### Verificación de Permisos
```typescript
// En services/permisos/screenPermissionsService.ts
static checkScreenAccess(
  screenName: string, 
  userRole: string, 
  userArea: string
): UserScreenAccess {
  // Comparación exacta de roles y áreas
  const hasRoleAccess = permission.allowedRoles.some(role => 
    userRole.toLowerCase() === role.toLowerCase()
  );
  
  const hasAreaAccess = permission.allowedAreas.some(area => 
    userArea.toLowerCase() === area.toLowerCase()
  );
  
  return { hasAccess: hasRoleAccess && hasAreaAccess };
}
```

### Componente de Control
```typescript
// En components/ui/ScreenAccessControl.tsx
useEffect(() => {
  const verifyAccess = async () => {
    const accessResult = await checkAccess(requiredScreen);
    if (!accessResult.hasAccess) {
      console.log(`🔒 Acceso denegado a ${requiredScreen}: ${accessResult.reason}`);
      router.push(fallbackScreen as any);
    }
  };
  verifyAccess();
}, [user?.email, requiredScreen]);
```

## Logs de Depuración

El sistema genera logs para monitorear el acceso:

```
🔒 Acceso denegado a explore: Rol o área no autorizada para esta pantalla
🔒 Acceso denegado a altaAlumno: Rol o área no autorizada para esta pantalla
🔒 Acceso denegado a gestionPeticiones: Rol o área no autorizada para esta pantalla
```

## Pruebas por Rol

### Para Director (axelhernandez20720@gmail.com):
1. ✅ Debe poder acceder a "Gestión de Usuarios"
2. ✅ Debe poder acceder a "Notificaciones"
3. ❌ Debe ser redirigido al intentar acceder a "Explore"
4. ❌ Debe ser redirigido al intentar acceder a "Alta de Alumno"
5. ❌ Debe ser redirigido al intentar acceder a "Gestión de Peticiones"

### Para Asesor (2345364567@univermilenium.edu.mx):
1. ✅ Debe poder acceder a "Explore"
2. ✅ Debe poder acceder a "Alta de Alumno"
3. ✅ Debe poder acceder a "Gestión de Peticiones"
4. ✅ Debe poder acceder a "Notificaciones"
5. ❌ Debe ser redirigido al intentar acceder a "Gestión de Usuarios"

## Modificación de Permisos

Para cambiar los permisos, editar en `services/permisos/screenPermissionsService.ts`:

```typescript
const screenPermissions: { [key: string]: ScreenPermission } = {
  'nombrePantalla': {
    screenName: 'nombrePantalla',
    allowedRoles: ['rol1', 'rol2'],
    allowedAreas: ['area1', 'area2']
  }
};
``` 