# Sistema de Contenido por Roles en Explore

## 🎯 Funcionamiento del Sistema

El componente `explore` muestra **contenido específico** según el rol del usuario que ha iniciado sesión. Cada rol ve información relevante a sus responsabilidades.

## 🔄 Flujo de Decisión de Contenido

### **1. Detección de Rol:**
```typescript
// app/(tabs)/explore.tsx
const { content, metrics, isLoading: roleLoading } = useRoleBasedContent();
```

### **2. Renderizado Condicional:**
```typescript
const renderRoleBasedContent = () => {
  // Contenido para Asesor (nueva vista)
  if (content.showAsesorStudents) {
    return <AsesorStudentsSection userRole={content.role} />;
  }

  // Contenido para Asesor del área Ventas
  if (content.showCareerChangePetitions) {
    return <CareerChangePetitionsSection userRole={content.role} />;
  }

  // Contenido para Super SU y Administrador
  if (content.showLogs) {
    return <SystemLogsSection userRole={content.role} />;
  }

  // Contenido para Coordinador
  if (content.showStudentsByGroups) {
    return <StudentsByGroupsSection userRole={content.role} />;
  }

  // Contenido para Control Escolar
  if (content.showStudentsWithMissingDocuments) {
    return <StudentsWithMissingDocumentsSection userRole={content.role} />;
  }

  // Contenido para Caja
  if (content.showStudentsWithPendingPayments) {
    return <StudentsWithPendingPaymentsSection userRole={content.role} />;
  }

  // Contenido para Jefe de Ventas
  if (content.showMetrics) {
    return <SalesMetricsSection userRole={content.role} metrics={metrics} />;
  }
};
```

## 👥 Contenido por Rol

### **🎓 Asesor (rol: "asesor")**
- **Vista**: `AsesorStudentsSection`
- **Contenido**: Lista de estudiantes que ha registrado
- **Información**: Nombre, email, carrera, ciclo, estado, fecha de registro
- **Acciones**: Ver detalles de cada estudiante

### **📊 Jefe de Ventas (rol: "jefe de ventas")**
- **Vista**: `SalesMetricsSection` + contenido por defecto
- **Contenido**: Métricas de ventas y estadísticas
- **Información**: Total de registros, pendientes, por asesor
- **Acciones**: Ver métricas detalladas

### **👨‍💼 Coordinador (rol: "jefe de coordinacion")**
- **Vista**: `StudentsByGroupsSection`
- **Contenido**: Estudiantes agrupados por carrera
- **Información**: Grupos, peticiones pendientes de firmas
- **Acciones**: Gestionar peticiones de cambio de carrera

### **📋 Control Escolar (rol: "jefe de control")**
- **Vista**: `StudentsWithMissingDocumentsSection`
- **Contenido**: Estudiantes con documentos faltantes
- **Información**: Estado de documentos, documentos subidos
- **Acciones**: Verificar documentos

### **💰 Caja (rol: "jefe de caja")**
- **Vista**: `StudentsWithPendingPaymentsSection`
- **Contenido**: Estudiantes con pagos pendientes
- **Información**: Montos pendientes, último pago, status
- **Acciones**: Gestionar pagos

### **🔧 Super SU / Administrador (rol: "superSu", "administrador")**
- **Vista**: `SystemLogsSection`
- **Contenido**: Logs del sistema y monitoreo
- **Información**: Actividad del sistema, estadísticas
- **Acciones**: Monitorear sistema

### **📝 Asesor del área Ventas (rol: "asesor del área ventas")**
- **Vista**: `CareerChangePetitionsSection`
- **Contenido**: Peticiones de cambio de carrera
- **Información**: Estado de peticiones, firmas completadas
- **Acciones**: Seguimiento de peticiones

## 🏗️ Arquitectura del Sistema

### **1. Hook de Contenido por Rol:**
```typescript
// hooks/permisos/useRoleBasedContent.ts
const { content, metrics, isLoading } = useRoleBasedContent();
```

### **2. Store de Contenido:**
```typescript
// store/permisos/roleBasedContentStore.ts
interface RoleBasedContent {
  showAsesorStudents: boolean;
  showCareerChangePetitions: boolean;
  showLogs: boolean;
  showStudentsByGroups: boolean;
  showStudentsWithMissingDocuments: boolean;
  showStudentsWithPendingPayments: boolean;
  showMetrics: boolean;
  showDefaultContent: boolean;
  role: string;
  area: string;
}
```

### **3. Controlador de Decisión:**
```typescript
// controller/permisos/roleBasedContentController.ts
switch (userRole.toLowerCase()) {
  case 'asesor':
    contentConfig = {
      showAsesorStudents: true,
      showDefaultContent: false
    };
    break;
  // ... otros casos
}
```

## 📱 Componentes de Vista

### **Vista 1: AsesorStudentsSection**
- **Ubicación**: `app/exploreScreen/vista7/AsesorStudentsSection.tsx`
- **Función**: Mostrar estudiantes registrados por el asesor
- **Datos**: Filtrados por `asesor_id` en la base de datos

### **Vista 2: CareerChangePetitionsSection**
- **Ubicación**: `app/exploreScreen/vista1/CareerChangePetitionsSection.tsx`
- **Función**: Seguimiento de peticiones de cambio de carrera
- **Datos**: Peticiones con estado y firmas

### **Vista 3: SystemLogsSection**
- **Ubicación**: `app/exploreScreen/vista2/SystemLogsSection.tsx`
- **Función**: Monitoreo del sistema
- **Datos**: Logs y estadísticas del sistema

### **Vista 4: StudentsByGroupsSection**
- **Ubicación**: `app/exploreScreen/vista3/StudentsByGroupsSection.tsx`
- **Función**: Estudiantes agrupados por carrera
- **Datos**: Grupos y peticiones pendientes

### **Vista 5: StudentsWithMissingDocumentsSection**
- **Ubicación**: `app/exploreScreen/vista4/StudentsWithMissingDocumentsSection.tsx`
- **Función**: Estudiantes con documentos faltantes
- **Datos**: Estado de documentos por estudiante

### **Vista 6: StudentsWithPendingPaymentsSection**
- **Ubicación**: `app/exploreScreen/vista5/StudentsWithPendingPaymentsSection.tsx`
- **Función**: Estudiantes con pagos pendientes
- **Datos**: Montos y estados de pago

### **Vista 7: SalesMetricsSection**
- **Ubicación**: `app/exploreScreen/vista6/SalesMetricsSection.tsx`
- **Función**: Métricas de ventas
- **Datos**: Estadísticas y métricas de registro

## 🔧 Configuración de Permisos

### **Base de Datos:**
```sql
-- Tabla usuariosum
SELECT idusuario, nombreusuario, apellido, correoinstitucional, rolarea, nombrearea
FROM usuariosum
WHERE correoinstitucional = 'usuario@email.com';
```

### **Mapeo de Roles:**
```typescript
// controller/permisos/roleBasedContentController.ts
const userRole = userRoleInfo.rolarea || 'asesor';
const userArea = userRoleInfo.nombrearea || '';
```

## ✅ Beneficios del Sistema

### **Seguridad:**
- ✅ **Contenido específico** según permisos
- ✅ **Datos filtrados** por rol y área
- ✅ **Acceso controlado** a funcionalidades

### **UX/UI:**
- ✅ **Interfaz personalizada** por rol
- ✅ **Información relevante** para cada usuario
- ✅ **Navegación intuitiva** según responsabilidades

### **Mantenimiento:**
- ✅ **Fácil agregar** nuevas vistas
- ✅ **Configuración centralizada** de permisos
- ✅ **Escalabilidad** para nuevos roles

## 🔄 Flujo Completo

1. **Usuario inicia sesión** → Se obtiene `user.email`
2. **Se consulta base de datos** → Se obtiene `rolarea` y `nombrearea`
3. **Se determina contenido** → Según rol en el controlador
4. **Se renderiza vista** → Componente específico para el rol
5. **Se muestran datos** → Filtrados y relevantes para el usuario

## 📝 Notas Importantes

- **El explore NO muestra contenido genérico** - Cada rol ve información específica
- **Los datos se filtran** por permisos y responsabilidades
- **La interfaz se adapta** según el rol del usuario
- **El sistema es escalable** para agregar nuevos roles y vistas 