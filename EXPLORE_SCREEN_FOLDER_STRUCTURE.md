# Explore Screen - Nueva Estructura de Carpetas y Sistema de Contenido por Roles

## 📁 Estructura de Carpetas

La pantalla `explore` ahora utiliza una estructura de carpetas organizada por vistas específicas para cada rol:

```
app/
├── exploreScreen/
│   ├── vista1/          # Asesor del área Ventas
│   │   └── CareerChangePetitionsSection.tsx
│   ├── vista2/          # Super SU y Administrador
│   │   └── SystemLogsSection.tsx
│   ├── vista3/          # Coordinador
│   │   └── StudentsByGroupsSection.tsx
│   ├── vista4/          # Control Escolar
│   │   └── StudentsWithMissingDocumentsSection.tsx
│   ├── vista5/          # Caja
│   │   └── StudentsWithPendingPaymentsSection.tsx
│   └── vista6/          # Jefe de Ventas
│       └── SalesMetricsSection.tsx
└── (tabs)/
    └── explore.tsx      # Componente principal que renderiza según el rol
```

## 🎯 Sistema de Contenido por Roles

### Vista 1: Asesor del área Ventas
- **Componente**: `CareerChangePetitionsSection`
- **Contenido**: Seguimiento de peticiones de cambio de carrera
- **Características**:
  - Panel de estadísticas (total, pendientes, aprobadas)
  - Lista de peticiones con estado (pendiente, aprobada, rechazada)
  - Información del estudiante y cambio de carrera
  - Número de firmas completadas
  - Comentarios de rechazo/aprobación
  - **Diferencia**: No ve tabla de alumnos, solo peticiones específicas

### Vista 2: Super SU y Administrador
- **Componente**: `SystemLogsSection`
- **Contenido**: Monitoreo del sistema con logs y estadísticas
- **Características**:
  - Panel de estadísticas (total logs, errores, login fallidos)
  - Logs de login, solicitudes, errores, advertencias
  - Filtros por tipo de log
  - Información de usuario, IP y detalles
  - Simulación de datos (reemplazar con datos reales)
  - **Diferencia**: Vista administrativa, no académica

### Vista 3: Coordinador
- **Componente**: `StudentsByGroupsSection`
- **Contenido**: Panel dual con grupos y peticiones pendientes
- **Características**:
  - **Tab 1**: Grupos por carrera con estadísticas
  - **Tab 2**: Peticiones pendientes de firmas
  - Navegación entre tabs con contadores
  - Vista detallada de grupos
  - Lista de peticiones que requieren firma del coordinador
  - **Diferencia**: No ve tabla general de alumnos, solo grupos y peticiones específicas

### Vista 4: Control Escolar
- **Componente**: `StudentsWithMissingDocumentsSection`
- **Contenido**: Control de documentación estudiantil
- **Características**:
  - Panel de estadísticas (estudiantes con documentos faltantes, total documentos faltantes)
  - Lista de estudiantes que deben documentos
  - Barra de progreso de documentación
  - Documentos faltantes vs. entregados
  - Integración con `CambioCarreraService`
  - **Diferencia**: Vista específica para control de documentos, no tabla general

### Vista 5: Caja
- **Componente**: `StudentsWithPendingPaymentsSection`
- **Contenido**: Control de pagos estudiantiles
- **Características**:
  - Panel de estadísticas (estudiantes con pagos pendientes, total pendiente)
  - Lista de estudiantes con pagos pendientes
  - Detalles de pagos y montos
  - Documentos de pago faltantes
  - Simulación de datos de pagos
  - **Diferencia**: Vista específica para control de pagos, no tabla general

### Vista 6: Jefe de Ventas
- **Componente**: `SalesMetricsSection`
- **Contenido**: Dashboard de métricas de ventas y rendimiento
- **Características**:
  - Dashboard con métricas clave
  - Métricas por asesor
  - Tasas de conversión
  - Resumen ejecutivo
  - **Diferencia**: Vista ejecutiva con métricas, no tabla de alumnos

## 🔧 Implementación Técnica

### Hook: `useRoleBasedContent`
```typescript
// hooks/permisos/useRoleBasedContent.ts
export const useRoleBasedContent = () => {
  // Determina el contenido basado en el rol del usuario
  // Retorna: content, metrics, isLoading
};
```

### Componente Principal: `explore.tsx`
```typescript
// app/(tabs)/explore.tsx
const ExploreContent = () => {
  const { content, metrics, isLoading: roleLoading } = useRoleBasedContent();
  
  const renderRoleBasedContent = () => {
    // Renderiza el componente apropiado según el rol
  };
};
```

### Control de Acceso: `ScreenAccessControl`
```typescript
// Protege la pantalla explore con permisos
const Explore = () => {
  return (
    <ScreenAccessControl requiredScreen="explore" fallbackScreen="/">
      <ExploreContent />
    </ScreenAccessControl>
  );
};
```

## 🎨 Características de Diseño

### Consistencia Visual
- Todos los componentes siguen el mismo patrón de diseño
- Headers con título y subtítulo específicos del rol
- Cards con sombras y bordes consistentes
- Estados de carga y vacío unificados

### Responsive Design
- Adaptación automática para móvil y web
- Scroll horizontal para métricas por asesor
- Layouts flexibles para diferentes tamaños de pantalla

### Estados de UI
- **Loading**: ActivityIndicator con mensaje específico
- **Empty**: Icono informativo con mensaje explicativo
- **Error**: Manejo de errores con mensajes claros

## 🔍 Debug y Monitoreo

### Información de Debug
- Panel temporal con información de debug
- Console logs detallados del proceso de detección de rol
- Tracking de qué componente se está renderizando

### Logs de Desarrollo
```typescript
console.log('🔍 Debug useRoleBasedContent:', {
  userRole,
  userArea,
  userEmail: user?.email
});
```

## 🚀 Próximos Pasos

### Datos Reales
1. **SystemLogsSection**: Conectar con sistema de logs real
2. **StudentsWithPendingPaymentsSection**: Integrar con sistema de pagos
3. **SalesMetricsSection**: Conectar con métricas reales de ventas

### Mejoras de UX
1. **Filtros avanzados**: Para cada vista específica
2. **Búsqueda**: Dentro de cada componente
3. **Exportación**: De datos y métricas
4. **Notificaciones**: Para cambios de estado

### Optimizaciones
1. **Caching**: De datos frecuentemente consultados
2. **Lazy loading**: Para componentes pesados
3. **Pagination**: Para listas grandes
4. **Real-time updates**: Con WebSockets

## 📋 Checklist de Implementación

- [x] Crear estructura de carpetas
- [x] Mover componentes a nuevas ubicaciones
- [x] Actualizar imports en explore.tsx
- [x] Implementar hook useRoleBasedContent
- [x] Crear componentes específicos por rol
- [x] Agregar debugging temporal
- [x] Documentar estructura y sistema

### Pendiente
- [ ] Remover debug panel temporal
- [ ] Conectar con datos reales
- [ ] Optimizar rendimiento
- [ ] Agregar tests unitarios
- [ ] Implementar filtros avanzados 