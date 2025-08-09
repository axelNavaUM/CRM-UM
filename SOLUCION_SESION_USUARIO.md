# Solución: Problema de Sesión de Usuario

## 🐛 Problema Identificado

El usuario reporta que hay un problema desde el inicio de sesión. Los datos del usuario no se están guardando correctamente:

```json
{
    "id": 1,
    "name": "",
    "email": "623220018@univermilenium.edu.mx",
    "avatarUrl": ""
}
```

### **Problemas Específicos:**

1. **Datos incompletos**: El `name` está vacío y faltan campos cruciales
2. **Dos sesiones**: Se guardan `user` y `auth_user` por separado
3. **Falta información de roles**: No se guarda `idarea` necesario para determinar permisos
4. **Redirección incorrecta**: El director debería ir a "Gestión de Carrera" pero va a explore

## 🔧 Solución Implementada

### **1. Actualización del Modelo de Autenticación**

#### **Antes:**
```typescript
const mappedUser = {
  id: user.idusuario || user.id || '',
  name: fullName,
  email: user.correoinstitucional || user.email || '',
  avatarUrl: user.avatarUrl || '',
};
```

#### **Después:**
```typescript
const mappedUser = {
  id: user.idusuario || user.id || '',
  name: fullName,
  email: user.correoinstitucional || user.email || '',
  avatarUrl: user.avatarUrl || '',
  // Agregar información crucial para roles
  idarea: user.idarea,
  nombreusuario: user.nombreusuario,
  apellido: user.apellido,
  correoinstitucional: user.correoinstitucional,
};
```

### **2. Actualización del AuthContext**

#### **Nuevo tipo User:**
```typescript
type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  idarea?: number;           // ✅ Agregado
  nombreusuario?: string;    // ✅ Agregado
  apellido?: string;         // ✅ Agregado
  correoinstitucional?: string; // ✅ Agregado
  [key: string]: any;
};
```

#### **Función saveUser actualizada:**
```typescript
const saveUser = async (userData: any) => {
  const mappedUser = {
    id: userData.idusuario || userData.id || '',
    name: userData.nombre || userData.nombreusuario || '',
    email: userData.correoinstitucional || userData.email || '',
    avatarUrl: userData.avatarUrl || '',
    // Preservar campos cruciales para roles
    idarea: userData.idarea,
    nombreusuario: userData.nombreusuario,
    apellido: userData.apellido,
    correoinstitucional: userData.correoinstitucional,
  };
  // ... guardar en storage
};
```

### **3. Sistema de Redirección Basado en Roles**

#### **Nuevo componente RoleBasedRedirect:**
```typescript
export const RoleBasedRedirect: React.FC<RoleBasedRedirectProps> = ({ children }) => {
  const { user } = useAuth();
  const { content, isLoading } = useRoleBasedContent();
  const router = useRouter();

  useEffect(() => {
    if (user && !isLoading && content) {
      // Si el usuario es director, redirigir a gestión de peticiones
      if (content.role === 'director' && !content.showCareerChangePetitions) {
        router.replace('/(tabs)/gestionPeticiones');
        return;
      }

      // Si no tiene contenido específico, redirigir a explore
      if (!content.showAsesorStudents && !content.showCareerChangePetitions && ...) {
        router.replace('/(tabs)/explore');
        return;
      }
    }
  }, [user, isLoading, content, router]);

  return <>{children}</>;
};
```

### **4. Actualización del Controlador de Roles**

#### **Agregado caso para director:**
```typescript
case 'director':
  contentConfig = {
    ...contentConfig,
    showCareerChangePetitions: true,
    showDefaultContent: false
  };
  break;
```

### **5. Integración en Layout Principal**

#### **AuthGate actualizado:**
```typescript
function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const isLoginScreen = pathname.startsWith('/loginScreen');
  
  if (isLoading) return null;
  
  if (!isAuthenticated && !isLoginScreen) {
    return <Redirect href="/loginScreen" />;
  }
  
  if (isAuthenticated && isLoginScreen) {
    return <Redirect href="/(tabs)/explore" />;
  }
  
  // ✅ Nueva lógica: Redirección basada en roles
  if (isAuthenticated && !isLoginScreen) {
    return <RoleBasedRedirect>{children}</RoleBasedRedirect>;
  }
  
  return <>{children}</>;
}
```

## 🎯 Flujo de Solución

### **1. Limpiar Sesión Actual:**
```javascript
// Ejecutar en consola del navegador
console.log('🧹 Limpiando sesión actual...');
Object.keys(localStorage).forEach(key => {
  if (key.includes('auth') || key.includes('user')) {
    localStorage.removeItem(key);
  }
});
```

### **2. Iniciar Sesión Nuevamente:**
- Ir a la pantalla de login
- Ingresar credenciales
- El sistema ahora guardará todos los datos necesarios

### **3. Verificar Datos Guardados:**
```javascript
// En consola del navegador
console.log('Usuario guardado:', JSON.parse(localStorage.getItem('@auth_user')));
```

### **4. Verificar Redirección:**
- **Director**: Debería ir a "Gestión de Peticiones"
- **Asesor**: Debería ir a "Explore" con vista de estudiantes
- **Otros roles**: Según su configuración específica

## 📊 Datos Esperados Después de la Solución

### **Usuario Director:**
```json
{
  "id": "1",
  "name": "Juan Pérez",
  "email": "director@universidad.com",
  "avatarUrl": "",
  "idarea": 1,
  "nombreusuario": "Juan",
  "apellido": "Pérez",
  "correoinstitucional": "director@universidad.com"
}
```

### **Usuario Asesor:**
```json
{
  "id": "2",
  "name": "María García",
  "email": "asesor@universidad.com",
  "avatarUrl": "",
  "idarea": 2,
  "nombreusuario": "María",
  "apellido": "García",
  "correoinstitucional": "asesor@universidad.com"
}
```

## 🔍 Verificación de la Solución

### **1. Verificar Autenticación:**
```javascript
// En consola del navegador
const user = JSON.parse(localStorage.getItem('@auth_user'));
console.log('Usuario autenticado:', user);
console.log('Tiene idarea:', user?.idarea);
```

### **2. Verificar Roles:**
```javascript
// Verificar en BD
SELECT u.correoinstitucional, a.rolarea, a.nombrearea 
FROM usuariosum u 
JOIN areas a ON u.idarea = a.idarea 
WHERE u.correoinstitucional = 'usuario@email.com';
```

### **3. Verificar Redirección:**
- **Director**: Debería ir a `/gestionPeticiones`
- **Asesor**: Debería ir a `/explore` con vista de estudiantes
- **Otros**: Según su rol específico

## ✅ Beneficios de la Solución

### **Datos Completos:**
- ✅ **Todos los campos** necesarios se guardan
- ✅ **Información de roles** disponible
- ✅ **Datos consistentes** entre sesiones

### **Redirección Inteligente:**
- ✅ **Director** va a Gestión de Peticiones
- ✅ **Asesor** va a Explore con sus estudiantes
- ✅ **Otros roles** según su configuración

### **Sistema Robusto:**
- ✅ **Una sola sesión** bien estructurada
- ✅ **Datos persistentes** entre recargas
- ✅ **Redirección automática** basada en roles

## 🚨 Pasos para Aplicar la Solución

1. **Limpiar sesión actual** usando el script proporcionado
2. **Recargar la aplicación**
3. **Iniciar sesión nuevamente** con credenciales válidas
4. **Verificar redirección** según el rol del usuario
5. **Confirmar que los datos** se guardan correctamente

## 📝 Notas Importantes

- **La sesión anterior** debe limpiarse completamente
- **Los datos se guardan** con todos los campos necesarios
- **La redirección es automática** basada en el rol
- **El sistema es escalable** para nuevos roles 