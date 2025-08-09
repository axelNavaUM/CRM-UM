# Arquitectura del Sistema de Contenido Basado en Roles

## Resumen de la Refactorización

Se ha refactorizado el sistema de contenido basado en roles para respetar la arquitectura MVC y separación de responsabilidades. El hook `useRoleBasedContent` ya no contiene consultas directas a la base de datos ni interfaces.

## Estructura de Archivos

### 1. Modelos (`models/permisos/roleBasedContentModel.ts`)
```typescript
export interface RoleBasedContent {
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

export interface DashboardMetrics {
  totalRegistrations: number;
  pendingRegistrations: number;
  totalPetitions: number;
  pendingPetitions: number;
  registrationsByAdvisor: { [key: string]: number };
  petitionsByAdvisor: { [key: string]: number };
}

export interface UserRoleInfo {
  idusuario: number;
  idarea: number;
  nombrearea: string;
  rolarea: string;
}
```

### 2. Servicios (`services/permisos/roleBasedContentService.ts`)
- **Responsabilidad**: Consultas directas a la base de datos
- **Métodos**:
  - `getUserRoleInfo(email: string)`: Obtiene información del usuario y su área
  - `getDashboardMetrics()`: Obtiene métricas del dashboard

### 3. Controladores (`controller/permisos/roleBasedContentController.ts`)
- **Responsabilidad**: Lógica de negocio
- **Métodos**:
  - `determineContentByRole(email: string)`: Determina qué contenido mostrar según el rol
  - `loadDashboardMetrics()`: Carga métricas del dashboard
  - `getDefaultContent()`: Retorna contenido por defecto

### 4. Store (`store/permisos/roleBasedContentStore.ts`)
- **Responsabilidad**: Estado global y gestión de acciones
- **Estado**:
  - `content`: Configuración del contenido basado en rol
  - `metrics`: Métricas del dashboard
  - `isLoading`: Estado de carga
  - `error`: Manejo de errores
- **Acciones**:
  - `loadContentByRole(email: string)`: Carga contenido por rol
  - `loadMetrics()`: Carga métricas
  - `resetState()`: Resetea el estado

### 5. Hook (`hooks/permisos/useRoleBasedContent.ts`)
- **Responsabilidad**: Solo manejo de estado y efectos
- **Funcionalidad**:
  - Usa el store para obtener estado
  - Maneja efectos de React
  - No contiene consultas a BD ni interfaces

## Flujo de Datos

```
Hook → Store → Controller → Service → Database
  ↑                                    ↓
  └────────── Estado ←───────────────┘
```

1. **Hook**: Se ejecuta cuando cambia el usuario
2. **Store**: Llama al controlador y actualiza el estado
3. **Controller**: Aplica lógica de negocio
4. **Service**: Realiza consultas a la base de datos
5. **Estado**: Se actualiza y se propaga a los componentes

## Ventajas de la Nueva Arquitectura

### ✅ Separación de Responsabilidades
- **Hooks**: Solo lógica de React y efectos
- **Controllers**: Lógica de negocio
- **Services**: Acceso a datos
- **Models**: Interfaces y tipos
- **Store**: Estado global

### ✅ Reutilización
- Los servicios pueden ser usados por otros controladores
- Los modelos pueden ser importados en cualquier parte
- El store puede ser usado por múltiples componentes

### ✅ Testabilidad
- Cada capa puede ser testeada independientemente
- Los servicios pueden ser mockeados fácilmente
- La lógica de negocio está aislada

### ✅ Mantenibilidad
- Cambios en la BD solo afectan a los servicios
- Cambios en la lógica solo afectan a los controladores
- Cambios en la UI solo afectan a los hooks y componentes

## Uso en Componentes

```typescript
// En un componente
import { useRoleBasedContent } from '@/hooks/permisos/useRoleBasedContent';

const MyComponent = () => {
  const { content, metrics, isLoading, error } = useRoleBasedContent();
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <View>
      {content.showCareerChangePetitions && <CareerChangeSection />}
      {content.showMetrics && <MetricsSection metrics={metrics} />}
    </View>
  );
};
```

## Estructura de Carpetas

```
app/
├── (tabs)/                    # Pantallas principales (mains)
│   ├── explore.tsx           # Usa el hook
│   └── ...
└── exploreScreen/            # Vistas específicas por rol
    ├── vista1/              # Peticiones de cambio de carrera
    ├── vista2/              # Logs del sistema
    ├── vista3/              # Estudiantes por grupos
    ├── vista4/              # Estudiantes con documentos faltantes
    ├── vista5/              # Estudiantes con pagos pendientes
    └── vista6/              # Métricas de ventas
```

## Reglas de la Arquitectura

1. **Hooks**: NO deben contener consultas a BD ni interfaces
2. **Controllers**: Contienen toda la lógica de negocio
3. **Services**: Contienen todas las consultas a BD
4. **Models**: Contienen todas las interfaces y tipos
5. **Store**: Maneja el estado global y las acciones
6. **Componentes**: Solo se preocupan por la UI y usan hooks

## Migración Completada

- ✅ Hook refactorizado sin consultas a BD
- ✅ Interfaces movidas a models
- ✅ Lógica de negocio movida a controller
- ✅ Consultas a BD movidas a service
- ✅ Estado global manejado por store
- ✅ Imports actualizados en todos los archivos 