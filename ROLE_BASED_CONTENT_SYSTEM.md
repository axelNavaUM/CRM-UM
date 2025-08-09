# Sistema de Contenido Basado en Roles

## Descripción General

Este sistema implementa un control de acceso granular para la pantalla `explore`, donde cada rol/área ve contenido específico y relevante para sus responsabilidades.

## Roles y Contenido Asociado

### 1. Asesor del Área Ventas
- **Contenido**: Peticiones de cambio de carrera con timeline
- **Componente**: `CareerChangePetitionsSection`
- **Funcionalidad**: 
  - Ver peticiones de cambio de carrera
  - Timeline de firmas y aprobaciones
  - Estado de peticiones (pendiente, aprobada, rechazada)
  - Comentarios y detalles de cada petición

### 2. Super SU y Administrador
- **Contenido**: Logs del sistema
- **Componente**: `SystemLogsSection`
- **Funcionalidad**:
  - Logs de inicio de sesión
  - Logs de solicitudes
  - Logs de errores
  - Logs de advertencias
  - Logs de intentos fallidos de acceso
  - Filtros por tipo de log

### 3. Coordinador
- **Contenido**: Estudiantes por grupos + Peticiones de cambio de carrera
- **Componentes**: `StudentsByGroupsSection` + `CareerChangePetitionsSection`
- **Funcionalidad**:
  - Ver estudiantes organizados por carreras
  - Peticiones pendientes de firma
  - Gestión de grupos de estudiantes
  - Navegación entre grupos y estudiantes individuales

### 4. Control Escolar
- **Contenido**: Estudiantes con documentos faltantes
- **Componente**: `StudentsWithMissingDocumentsSection`
- **Funcionalidad**:
  - Lista de estudiantes que deben documentos
  - Documentos faltantes por estudiante
  - Documentos ya entregados
  - Estado de entrega de documentos

### 5. Caja
- **Contenido**: Estudiantes con pagos pendientes
- **Componente**: `StudentsWithPendingPaymentsSection`
- **Funcionalidad**:
  - Estudiantes con pagos pendientes
  - Montos pendientes por estudiante
  - Historial de pagos
  - Priorización de cobranza

### 6. Jefe de Ventas
- **Contenido**: Métricas de ventas + Contenido por defecto
- **Componente**: `SalesMetricsSection` + contenido por defecto
- **Funcionalidad**:
  - Métricas de registros por asesor
  - Métricas de peticiones por asesor
  - Tasa de conversión
  - Eficiencia de procesamiento
  - Insights y análisis

### 7. Asesor (por defecto)
- **Contenido**: Contenido estándar de la pantalla explore
- **Funcionalidad**:
  - Grid de estudiantes
  - Actividades recientes
  - Botones de acción (alta de estudiante, cambio de carrera)

## Arquitectura del Sistema

### Hook Principal: `useRoleBasedContent`
```typescript
interface RoleBasedContent {
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

### Componentes Específicos por Rol
- `CareerChangePetitionsSection`: Peticiones de cambio de carrera
- `SystemLogsSection`: Logs del sistema
- `StudentsByGroupsSection`: Estudiantes por grupos
- `StudentsWithMissingDocumentsSection`: Estudiantes con documentos faltantes
- `StudentsWithPendingPaymentsSection`: Estudiantes con pagos pendientes
- `SalesMetricsSection`: Métricas de ventas

### Integración en Explore
La pantalla `explore.tsx` utiliza el hook `useRoleBasedContent` para determinar qué contenido mostrar basado en el rol del usuario:

```typescript
const renderRoleBasedContent = () => {
  if (content.showCareerChangePetitions) {
    return <CareerChangePetitionsSection userRole={content.role} />;
  }
  if (content.showLogs) {
    return <SystemLogsSection userRole={content.role} />;
  }
  // ... más condiciones
};
```

## Características Técnicas

### 1. Carga Dinámica de Contenido
- El contenido se carga basado en el rol del usuario
- Estados de carga para cada componente
- Manejo de errores y estados vacíos

### 2. Interfaz Consistente
- Todos los componentes siguen el mismo patrón de diseño
- Headers con títulos y subtítulos
- Cards con información relevante
- Estados de carga y vacío

### 3. Navegación Intuitiva
- Botones de regreso cuando es necesario
- Navegación entre vistas (ej: grupos → estudiantes)
- Filtros y búsquedas específicas por rol

### 4. Datos Simulados
- Los componentes utilizan datos simulados para demostración
- En producción, se conectarían a las tablas reales de la base de datos
- Estructura preparada para integración con Supabase

## Implementación de Permisos

### Control de Acceso
- El sistema utiliza el hook `useScreenPermissions` para controlar acceso a pantallas
- Los permisos se basan en áreas, no en usuarios individuales
- Filtrado de navegación basado en permisos

### Mapeo de Roles
```typescript
switch (userRole.toLowerCase()) {
  case 'asesor del área ventas':
  case 'asesor ventas':
    // Configuración específica
    break;
  case 'super su':
  case 'administrador':
    // Configuración específica
    break;
  // ... más casos
}
```

## Consideraciones de Seguridad

### 1. Validación de Roles
- Verificación del rol del usuario en cada componente
- Fallback a contenido por defecto si el rol no está definido

### 2. Control de Datos
- Solo se muestran datos relevantes para cada rol
- Filtrado de información sensible
- Acceso limitado a funcionalidades específicas

### 3. Auditoría
- Los logs del sistema registran actividades importantes
- Trazabilidad de acciones por usuario
- Monitoreo de accesos y cambios

## Extensibilidad

### Agregar Nuevos Roles
1. Definir el nuevo rol en `useRoleBasedContent`
2. Crear el componente específico
3. Agregar la condición en `renderRoleBasedContent`
4. Actualizar la documentación

### Agregar Nuevas Funcionalidades
1. Extender la interfaz `RoleBasedContent`
2. Implementar la lógica en el hook
3. Crear o modificar componentes según sea necesario
4. Actualizar la pantalla explore

## Próximos Pasos

1. **Integración con Base de Datos Real**: Conectar los componentes con las tablas reales de Supabase
2. **Logs Reales**: Implementar un sistema de logging real para Super SU y Administradores
3. **Métricas en Tiempo Real**: Conectar las métricas con datos reales de la aplicación
4. **Notificaciones**: Agregar notificaciones específicas por rol
5. **Reportes**: Generar reportes específicos por rol
6. **Auditoría**: Implementar un sistema de auditoría completo

## Archivos Principales

- `hooks/permisos/useRoleBasedContent.ts`: Hook principal para determinar contenido por rol
- `app/(tabs)/explore.tsx`: Pantalla principal con lógica de renderizado
- `components/explore/`: Componentes específicos por rol
- `services/permisos/permisosService.ts`: Servicios de permisos
- `hooks/permisos/useScreenPermissions.ts`: Hook para control de acceso a pantallas 