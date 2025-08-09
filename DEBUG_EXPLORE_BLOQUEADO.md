# Debug: Explore Bloqueado - "This screen does not exist"

## 🐛 Problema Identificado

El usuario reporta que el explore se está bloqueando y redirigiendo a "This screen does not exist", lo que indica que no se está detectando correctamente el tipo de usuario.

## 🔍 Análisis del Problema

### **Posibles Causas:**

1. **Usuario no autenticado**: El `user.email` es `null` o `undefined`
2. **Usuario no encontrado en BD**: El email no existe en la tabla `usuariosum`
3. **Área no encontrada**: El `idarea` del usuario no existe en la tabla `areas`
4. **Rol no reconocido**: El `rolarea` no coincide con los casos del switch
5. **Error en consulta BD**: Problema de conexión o permisos

### **Flujo de Debug Implementado:**

```typescript
// 1. Hook - Verificar si hay usuario
console.log('[DEBUG] useRoleBasedContent useEffect - user email:', user?.email);

// 2. Store - Verificar llamada al controlador
console.log('[DEBUG] loadContentByRole llamado con email:', email);

// 3. Controlador - Verificar email y userRoleInfo
console.log('[DEBUG] determineContentByRole llamado con email:', email);
console.log('[DEBUG] userRoleInfo obtenido:', userRoleInfo);

// 4. Servicio - Verificar consultas a BD
console.log('[DEBUG] Buscando usuario con email:', email);
console.log('[DEBUG] Resultado de búsqueda de usuario:', { usuario, usuarioError });
console.log('[DEBUG] Resultado de búsqueda de área:', { area, areaError });

// 5. Componente - Verificar contenido y renderizado
console.log('[DEBUG] ExploreContent - content:', content);
console.log('[DEBUG] renderRoleBasedContent - content:', content);
```

## 🔧 Solución Implementada

### **1. Logs Detallados Agregados:**

#### **Servicio (`roleBasedContentService.ts`):**
```typescript
static async getUserRoleInfo(email: string): Promise<UserRoleInfo | null> {
  console.log('[DEBUG] Buscando usuario con email:', email);
  
  const { data: usuario, error: usuarioError } = await supabase
    .from('usuariosum')
    .select('idusuario, idarea')
    .eq('correoinstitucional', email)
    .single();

  console.log('[DEBUG] Resultado de búsqueda de usuario:', { usuario, usuarioError });
  
  // ... resto del código con logs
}
```

#### **Controlador (`roleBasedContentController.ts`):**
```typescript
static async determineContentByRole(email: string): Promise<RoleBasedContent> {
  console.log('[DEBUG] determineContentByRole llamado con email:', email);
  
  const userRoleInfo = await RoleBasedContentService.getUserRoleInfo(email);
  console.log('[DEBUG] userRoleInfo obtenido:', userRoleInfo);
  
  const userRole = userRoleInfo.rolarea || 'asesor';
  const userArea = userRoleInfo.nombrearea || '';
  console.log('[DEBUG] Rol y área del usuario:', { userRole, userArea });
  
  // ... switch con casos
  console.log('[DEBUG] Configuración de contenido final:', contentConfig);
}
```

#### **Store (`roleBasedContentStore.ts`):**
```typescript
loadContentByRole: async (email: string) => {
  console.log('[DEBUG] loadContentByRole llamado con email:', email);
  
  const content = await RoleBasedContentController.determineContentByRole(email);
  console.log('[DEBUG] Contenido obtenido del controlador:', content);
  
  set({ content, isLoading: false });
}
```

#### **Hook (`useRoleBasedContent.ts`):**
```typescript
useEffect(() => {
  console.log('[DEBUG] useRoleBasedContent useEffect - user email:', user?.email);
  if (user?.email) {
    loadContentByRole(user.email);
  } else {
    console.log('[DEBUG] No hay usuario, reseteando estado');
    resetState();
  }
}, [user?.email]);
```

#### **Componente (`explore.tsx`):**
```typescript
const ExploreContent = () => {
  console.log('[DEBUG] ExploreContent - user:', user);
  console.log('[DEBUG] ExploreContent - content:', content);
  console.log('[DEBUG] ExploreContent - roleLoading:', roleLoading);
  
  const renderRoleBasedContent = () => {
    console.log('[DEBUG] renderRoleBasedContent - roleLoading:', roleLoading);
    console.log('[DEBUG] renderRoleBasedContent - content:', content);
    
    if (content.showAsesorStudents) {
      console.log('[DEBUG] Renderizando AsesorStudentsSection');
      return <AsesorStudentsSection userRole={content.role} />;
    }
    // ... más condiciones con logs
  };
};
```

## 📊 Pasos para Debuggear

### **1. Verificar Autenticación:**
```javascript
// En la consola del navegador
console.log('Usuario autenticado:', user);
console.log('Email del usuario:', user?.email);
```

### **2. Verificar Consulta de Usuario:**
```javascript
// Verificar si el usuario existe en la BD
SELECT * FROM usuariosum WHERE correoinstitucional = 'usuario@email.com';
```

### **3. Verificar Consulta de Área:**
```javascript
// Verificar si el área existe
SELECT * FROM areas WHERE idarea = [idarea_del_usuario];
```

### **4. Verificar Rol:**
```javascript
// Verificar qué rol tiene el usuario
SELECT u.correoinstitucional, a.rolarea, a.nombrearea 
FROM usuariosum u 
JOIN areas a ON u.idarea = a.idarea 
WHERE u.correoinstitucional = 'usuario@email.com';
```

## 🎯 Casos de Prueba

### **Caso 1: Usuario Asesor**
- **Email**: asesor@universidad.com
- **Rol esperado**: "asesor"
- **Vista esperada**: `AsesorStudentsSection`

### **Caso 2: Usuario Jefe de Ventas**
- **Email**: jefe.ventas@universidad.com
- **Rol esperado**: "jefe de ventas"
- **Vista esperada**: `SalesMetricsSection`

### **Caso 3: Usuario no encontrado**
- **Email**: usuario.inexistente@email.com
- **Resultado esperado**: Contenido por defecto

## 🔧 Comandos de Verificación

### **Verificar Tabla usuariosum:**
```sql
SELECT idusuario, nombreusuario, apellido, correoinstitucional, idarea 
FROM usuariosum 
WHERE correoinstitucional = 'usuario@email.com';
```

### **Verificar Tabla areas:**
```sql
SELECT idarea, nombrearea, rolarea 
FROM areas 
WHERE idarea = [idarea_del_usuario];
```

### **Verificar Join completo:**
```sql
SELECT u.correoinstitucional, u.nombreusuario, a.nombrearea, a.rolarea
FROM usuariosum u
LEFT JOIN areas a ON u.idarea = a.idarea
WHERE u.correoinstitucional = 'usuario@email.com';
```

## ✅ Resultado Esperado

Con los logs implementados, deberías ver en la consola:

1. **Email del usuario** siendo procesado
2. **Resultado de búsqueda** en tabla usuariosum
3. **Resultado de búsqueda** en tabla areas
4. **Rol y área** detectados
5. **Configuración de contenido** final
6. **Componente renderizado** según el rol

## 🚨 Posibles Errores

### **Error 1: Usuario no autenticado**
```
[DEBUG] useRoleBasedContent useEffect - user email: undefined
[DEBUG] No hay usuario, reseteando estado
```

### **Error 2: Usuario no encontrado en BD**
```
[DEBUG] Resultado de búsqueda de usuario: { usuario: null, usuarioError: {...} }
```

### **Error 3: Área no encontrada**
```
[DEBUG] Resultado de búsqueda de área: { area: null, areaError: {...} }
```

### **Error 4: Rol no reconocido**
```
[DEBUG] Rol y área del usuario: { userRole: "rol_desconocido", userArea: "..." }
[DEBUG] Configuración de contenido final: { showDefaultContent: true, ... }
```

## 📝 Próximos Pasos

1. **Ejecutar la aplicación** y revisar los logs en la consola
2. **Identificar el punto exacto** donde falla el proceso
3. **Verificar datos en BD** según los logs
4. **Corregir el problema** específico identificado
5. **Remover logs** una vez solucionado 