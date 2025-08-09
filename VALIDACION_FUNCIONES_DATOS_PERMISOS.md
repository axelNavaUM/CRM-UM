# Validación de Funciones y Datos en el Sistema de Permisos

## Resumen de Mejoras

Se han implementado mejoras significativas en el sistema de permisos para asegurar que solo se puedan seleccionar funciones y datos que realmente existen en el sistema, evitando la creación de permisos inválidos.

## Problema Resuelto

**Problema Original:**
- En el `PermisosManager`, cuando se seleccionaba "funcion" o "dato" como tipo de permiso, no había validación para asegurar que la función o dato seleccionado realmente existiera en el sistema.
- Esto permitía crear permisos para funciones o datos inexistentes, lo que podía causar errores en la aplicación.

## Solución Implementada

### 1. Nuevos Métodos en `PermisosService`

Se agregaron los siguientes métodos para validar y listar funciones y datos disponibles:

```typescript
// Métodos de validación
static validarFuncionDisponible(funcion: string): boolean
static validarDatoDisponible(dato: string): boolean

// Métodos para obtener listas
static getFuncionesDisponibles(): string[]
static getDatosDisponibles(): string[]

// Métodos con descripciones
static getFuncionesDisponiblesConDescripcion(): Record<string, string>
static getDatosDisponiblesConDescripcion(): Record<string, string>
```

### 2. Funciones Disponibles

El sistema ahora valida contra las siguientes funciones reales del sistema:

#### Funciones de Búsqueda
- `globalSearch` - Búsqueda global en el sistema
- `searchAlumnos` - Búsqueda específica de alumnos
- `searchUsuariosUM` - Búsqueda de usuarios UM
- `searchAlumnosByMatricula` - Búsqueda de alumnos por matrícula
- `searchConfiguraciones` - Búsqueda en configuraciones
- `getSearchSuggestions` - Obtener sugerencias de búsqueda

#### Funciones de Cambio de Carrera
- `actualizarStatusAlumno` - Actualizar estado del alumno
- `esControlEscolar` - Verificar si es Control Escolar
- `obtenerDocumentosFaltantes` - Obtener documentos faltantes
- `agregarDocumentoFaltante` - Agregar documento faltante
- `verificarTramitesPendientes` - Verificar trámites pendientes
- `obtenerHistorialPeticiones` - Obtener historial de peticiones
- `obtenerPeticionesPendientesAlumno` - Obtener peticiones pendientes del alumno
- `verificarPeticionDuplicada` - Verificar petición duplicada
- `crearPeticion` - Crear nueva petición
- `getPeticionesPorAsesor` - Obtener peticiones por asesor
- `getPeticionesPendientes` - Obtener peticiones pendientes
- `getPeticion` - Obtener petición específica
- `aprobarPeticion` - Aprobar petición
- `rechazarPeticion` - Rechazar petición
- `getNotificaciones` - Obtener notificaciones
- `marcarNotificacionLeida` - Marcas notificación como leída
- `getNotificacionesNoLeidas` - Obtener notificaciones no leídas
- `verificarJefeVentas` - Verificar jefe de ventas
- `verificarAlumno` - Verificar alumno
- `verificarCarrera` - Verificar carrera
- `verificarCiclo` - Verificar ciclo

#### Funciones de Áreas
- `getAllAreas` - Obtener todas las áreas
- `getAreaById` - Obtener área por ID
- `createArea` - Crear nueva área
- `updateArea` - Actualizar área
- `deleteArea` - Eliminar área
- `getPermisosDisponibles` - Obtener permisos disponibles
- `formatPermisoName` - Formatear nombre de permiso

#### Funciones de Autenticación
- `googleSignIn` - Inicio de sesión con Google
- `googleAuthService` - Servicio de autenticación Google

#### Funciones de Persistencia
- `guardarRegistro` - Guardar registro local
- `leerRegistro` - Leer registro local
- `limpiarRegistro` - Limpiar registro local

#### Funciones de Archivos
- `subirArchivosBucket` - Subir archivos al bucket
- `validarArchivo` - Validar archivo
- `crearCarpetaAlumno` - Crear carpeta del alumno

### 3. Datos Disponibles

El sistema también valida contra los siguientes datos reales del sistema:

#### Datos de Alumnos
- `alumnos` - Todos los alumnos del sistema
- `alumnos_activos` - Alumnos con estado activo
- `alumnos_pendientes` - Alumnos con estado pendiente
- `alumnos_con_documentos_faltantes` - Alumnos con documentos faltantes
- `alumnos_con_pagos_pendientes` - Alumnos con pagos pendientes

#### Datos de Usuarios
- `usuariosum` - Todos los usuarios UM
- `usuarios_por_area` - Usuarios organizados por área
- `usuarios_activos` - Usuarios activos

#### Datos de Áreas
- `areas` - Todas las áreas del sistema
- `areas_con_permisos` - Áreas con permisos asignados
- `areas_activas` - Áreas activas

#### Datos de Carreras
- `carreras` - Todas las carreras
- `carreras_activas` - Carreras activas
- `carreras_por_area` - Carreras por área

#### Datos de Ciclos
- `ciclos` - Todos los ciclos
- `ciclos_activos` - Ciclos activos
- `ciclos_por_carrera` - Ciclos por carrera

#### Datos de Peticiones
- `cambio_carrera` - Peticiones de cambio de carrera
- `peticiones_pendientes` - Peticiones pendientes
- `peticiones_aprobadas` - Peticiones aprobadas
- `peticiones_rechazadas` - Peticiones rechazadas
- `peticiones_por_asesor` - Peticiones por asesor

#### Datos de Documentos
- `documentos_alumno` - Documentos de alumnos
- `documentos_faltantes` - Documentos faltantes
- `documentos_subidos` - Documentos subidos

#### Datos de Pagos
- `pagos` - Todos los pagos
- `pagos_pendientes` - Pagos pendientes
- `pagos_completados` - Pagos completados

#### Datos de Notificaciones
- `notificaciones` - Todas las notificaciones
- `notificaciones_no_leidas` - Notificaciones no leídas
- `notificaciones_por_usuario` - Notificaciones por usuario

#### Datos de Firmas
- `firmas` - Todas las firmas
- `firmas_pendientes` - Firmas pendientes
- `firmas_completadas` - Firmas completadas

### 4. Mejoras en la UI del PermisosManager

#### Selección Inteligente
- Cuando se selecciona "funcion" como tipo, se muestran solo las funciones disponibles en botones seleccionables
- Cuando se selecciona "dato" como tipo, se muestran solo los datos disponibles en botones seleccionables
- Se incluyen descripciones para cada función y dato seleccionado

#### Validación en Tiempo Real
- Validación antes de guardar para asegurar que la función o dato seleccionado existe
- Mensajes de error claros que indican qué funciones o datos están disponibles
- Prevención de guardado de permisos inválidos

#### Experiencia de Usuario Mejorada
- Texto de ayuda que explica qué seleccionar
- Descripciones detalladas de cada función y dato
- Interfaz más intuitiva y guiada

### 5. Arquitectura de Validación

```
PermisosManager (UI)
    ↓
usePermisos (Hook)
    ↓
PermisosController (Controller)
    ↓
PermisosService (Service)
    ↓
Validación de Funciones/Datos
```

### 6. Beneficios de la Implementación

1. **Prevención de Errores**: Evita la creación de permisos para funciones o datos inexistentes
2. **Mejor UX**: Interfaz más intuitiva con selección guiada
3. **Documentación Integrada**: Descripciones claras de cada función y dato
4. **Mantenibilidad**: Fácil agregar nuevas funciones o datos al sistema
5. **Consistencia**: Asegura que todos los permisos se basen en funcionalidades reales

### 7. Cómo Agregar Nuevas Funciones o Datos

Para agregar nuevas funciones o datos al sistema:

1. **Agregar la función/dato al servicio correspondiente**
2. **Actualizar los métodos en `PermisosService`:**
   - `getFuncionesDisponibles()` para funciones
   - `getDatosDisponibles()` para datos
   - `getFuncionesDisponiblesConDescripcion()` para descripciones de funciones
   - `getDatosDisponiblesConDescripcion()` para descripciones de datos

3. **La validación automática se aplicará en el `PermisosManager`**

### 8. Archivos Modificados

- `services/permisos/permisosService.ts` - Agregados métodos de validación
- `controller/permisos/permisosController.ts` - Expuestos nuevos métodos
- `hooks/permisos/usePermisos.ts` - Integrados nuevos métodos
- `app/altaUsuariosUM/permisosManager/PermisosManager.tsx` - Mejorada la UI

Esta implementación asegura que el sistema de permisos sea robusto, intuitivo y mantenible, evitando errores y proporcionando una mejor experiencia de usuario. 