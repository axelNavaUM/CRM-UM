# Diferenciación de Contenido: Alumno vs Petición

## Tipos de Consulta

### **1. Consulta de Alumno** (`consultType === 'alumno'`)

**Contenido Mostrado:**
- 📋 **Información del Alumno**: Datos personales y académicos
- 📊 **Trámites Pendientes**: Estado de trámites del alumno
- ❌ **Sin acciones de aprobación**: No se muestran botones de aprobar/rechazar

**Estructura:**
```
┌─────────────────────────────────────────────────────────┐
│ 👤 Información del Alumno                             │
├─────────────────────────────────────────────────────────┤
│ • Nombre: Axel Nava Hernandez                         │
│ • Matrícula: 2023001                                  │
│ • Email: axel@email.com                               │
│ • Carrera: Ingeniería en Sistemas                     │
│ • Ciclo: 2025/2025-ECA-1                             │
│ • Estado: Activo                                      │
├─────────────────────────────────────────────────────────┤
│ 📋 Trámites Pendientes                                │
├─────────────────────────────────────────────────────────┤
│ • Cambios de Carrera: 0 pendientes                    │
│ • Firmas Pendientes: 0 pendientes                     │
└─────────────────────────────────────────────────────────┘
```

### **2. Consulta de Petición** (`consultType === 'peticion'`)

**Contenido Mostrado:**
- 📋 **Información de la Petición**: Detalles del cambio de carrera
- ⏰ **Línea de Tiempo**: Progreso de la petición
- 💬 **Comentarios**: Sistema de comentarios
- ✍️ **Firma**: Sistema de firma digital
- ✅ **Acciones**: Botones de aprobar/rechazar

**Estructura:**
```
┌─────────────────────────────────────────────────────────┐
│ 🔔 Nueva solicitud de cambio de carrera               │
├─────────────────────────────────────────────────────────┤
│ 📋 Información de la Petición                         │
│ • Alumno: Axel Nava Hernandez                         │
│ • Carrera Actual: Derecho                             │
│ • Carrera Nueva: Ingeniería en Sistemas               │
│ • Estado: Pendiente de aprobación                     │
├─────────────────────────────────────────────────────────┤
│ ⏰ Línea de Tiempo                                     │
│ • Axel creó la petición                               │
│ • Control escolar firmado                             │
│ • Pendiente de aprobación                             │
├─────────────────────────────────────────────────────────┤
│ 💬 Comentarios                                         │
│ [Agregar comentario]                                  │
├─────────────────────────────────────────────────────────┤
│ ✍️ Firma                                               │
│ [Agregar firma]                                       │
├─────────────────────────────────────────────────────────┤
│ [✅ Aprobar] [❌ Rechazar]                            │
└─────────────────────────────────────────────────────────┘
```

## Lógica de Diferenciación

### **1. Estado del Componente**
```typescript
const [consultType, setConsultType] = useState<'alumno' | 'peticion' | null>(null);
```

### **2. Determinación del Tipo**
```typescript
// Para búsquedas de alumno
if (result.type === 'alumno') {
  setConsultType('alumno');
}

// Para notificaciones de cambio de carrera
if (isCambioCarrera) {
  setConsultType('peticion');
}
```

### **3. Renderizado Condicional**
```typescript
// Información del alumno - Solo para consultas de alumno
{consultType === 'alumno' && alumnoData && (
  <View style={styles.detailSection}>
    <Text style={styles.detailSectionTitle}>Información del Alumno</Text>
    {/* Contenido del alumno */}
  </View>
)}

// Trámites pendientes - Solo para consultas de alumno
{consultType === 'alumno' && alumnoData && (
  <View style={styles.detailSection}>
    <Text style={styles.detailSectionTitle}>Trámites Pendientes</Text>
    {/* Contenido de trámites */}
  </View>
)}
```

### **4. AsidePanel Condicional**
```typescript
<AsidePanel 
  open={showSheet} 
  onClose={handleSheetClose}
  onApprove={handleApprove}
  onReject={handleReject}
  onComment={handleComment}
  onSign={handleSign}
  showApprovalActions={consultType === 'peticion'} // Solo para peticiones
>
  {renderItemDetails()}
</AsidePanel>
```

## Funcionalidades por Tipo

### **Consulta de Alumno**
- ✅ **Información personal**: Nombre, matrícula, email
- ✅ **Información académica**: Carrera, ciclo, estado
- ✅ **Trámites pendientes**: Estado de trámites
- ❌ **Sin acciones de aprobación**
- ❌ **Sin línea de tiempo**
- ❌ **Sin comentarios**
- ❌ **Sin firma**

### **Consulta de Petición**
- ✅ **Información de la petición**: Detalles del cambio
- ✅ **Línea de tiempo**: Progreso de la petición
- ✅ **Comentarios**: Sistema de comentarios
- ✅ **Firma**: Sistema de firma digital
- ✅ **Acciones**: Aprobar/rechazar
- ✅ **Firmas pendientes**: Quien falta por firmar

## Datos Verdaderos

### **Para Alumnos:**
- Usa datos de la tabla `alumnos`
- Incluye relaciones con `carreras` y `ciclos`
- Muestra trámites pendientes reales

### **Para Peticiones:**
- Usa datos de `peticiones_cambio_carrera`
- Incluye información de firmas pendientes
- Muestra línea de tiempo real
- Indica áreas que faltan por firmar

## Ventajas de la Diferenciación

### **1. UX Mejorada**
- 🎯 **Contenido relevante**: Solo muestra lo necesario
- 📱 **Interfaz limpia**: Sin elementos innecesarios
- ⚡ **Navegación clara**: Fácil de entender

### **2. Funcionalidad Específica**
- 📋 **Alumnos**: Enfoque en información y trámites
- 🔔 **Peticiones**: Enfoque en aprobación y seguimiento

### **3. Datos Precisos**
- 📊 **Información real**: Usa datos de la base de datos
- 🔄 **Actualización**: Se actualiza automáticamente
- 📈 **Seguimiento**: Permite seguimiento de trámites

Ahora el sistema diferencia claramente entre consultas de alumno y peticiones, mostrando contenido específico y relevante para cada tipo de consulta. 