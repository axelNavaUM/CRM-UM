# Solución: Carga de Información Detallada en Notificaciones y Búsqueda

## Problema Identificado

Cuando se seleccionaba una notificación o se buscaba un alumno, se abría el aside/bottom sheet pero no se cargaba la información correspondiente. El panel mostraba solo el título "Información Detallada" pero sin contenido.

## Causa Raíz

1. **Falta de carga de datos adicionales**: El componente `DynamicHeader` no cargaba datos adicionales cuando se seleccionaba un elemento
2. **Datos de prueba incompletos**: Los datos de prueba en el hook de notificaciones no tenían IDs válidos en la base de datos
3. **Falta de manejo de estados de carga**: No había indicadores de carga mientras se obtenían los datos

## Solución Implementada

### 1. **Mejoras en DynamicHeader.tsx**

#### **Nuevos Estados Agregados:**
```typescript
const [loadingDetail, setLoadingDetail] = useState(false);
const [alumnoData, setAlumnoData] = useState<any>(null);
const [cambioCarreraData, setCambioCarreraData] = useState<any>(null);
```

#### **Funciones de Carga de Datos:**
```typescript
const fetchAlumnoData = async (alumnoId: number) => {
  // Carga datos completos del alumno desde Supabase
  const { data: alumno, error: alumnoError } = await supabase
    .from('alumnos')
    .select(`*, carreras(nombre)`)
    .eq('id', alumnoId)
    .single();
  return alumno;
};

const fetchCambioCarreraData = async (peticionId: number) => {
  // Carga datos de petición de cambio de carrera
  const { data: peticion, error: peticionError } = await supabase
    .from('cambio_carrera')
    .select(`*, alumnos(nombre, apellidos, matricula, email), carreras_actuales(nombre), carreras_solicitadas(nombre)`)
    .eq('id', peticionId)
    .single();
  return peticion;
};
```

#### **Función handleItemPress Mejorada:**
```typescript
const handleItemPress = async (item: SearchResult | Notificacion) => {
  setLoadingDetail(true);
  setSelectedItem(item);
  setShowSheet(true);
  
  // Limpiar datos anteriores
  setAlumnoData(null);
  setCambioCarreraData(null);

  try {
    if ('type' in item) {
      // Es un resultado de búsqueda
      const result = item as SearchResult;
      if (result.type === 'alumno' && result.data?.id) {
        const alumnoData = await fetchAlumnoData(result.data.id);
        setAlumnoData(alumnoData);
      }
    } else {
      // Es una notificación
      const notification = item as Notificacion;
      const isCambioCarrera = notification.tipo === 'cambio_carrera' || 
                              notification.titulo.toLowerCase().includes('cambio de carrera');

      if (isCambioCarrera) {
        const alumnoId = notification.datos_adicionales?.alumno_id;
        const peticionId = notification.datos_adicionales?.peticion_id;

        if (alumnoId) {
          const alumnoData = await fetchAlumnoData(alumnoId);
          setAlumnoData(alumnoData);
        }

        if (peticionId) {
          const cambioCarreraData = await fetchCambioCarreraData(peticionId);
          setCambioCarreraData(cambioCarreraData);
        }
      } else {
        // Para otras notificaciones
        const alumnoId = notification.datos_adicionales?.alumno_id;
        if (alumnoId) {
          const alumnoData = await fetchAlumnoData(alumnoId);
          setAlumnoData(alumnoData);
        }
      }
    }
  } catch (error) {
    console.error('Error fetching item details:', error);
    Alert.alert('Error', 'No se pudo cargar la información detallada');
  } finally {
    setLoadingDetail(false);
  }
};
```

### 2. **Función renderItemDetails Mejorada**

#### **Indicador de Carga:**
```typescript
if (loadingDetail) {
  return (
    <View style={styles.loadingContainer}>
      <RadixIcons.Loading size={24} color="#6B7280" />
      <Text style={styles.loadingText}>Cargando información...</Text>
    </View>
  );
}
```

#### **Información Detallada para Alumnos:**
```typescript
{alumnoData && result.type === 'alumno' && (
  <View style={styles.detailSection}>
    <Text style={styles.detailSectionTitle}>Información del Alumno</Text>
    <View style={styles.detailData}>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Nombre:</Text>
        <Text style={styles.detailValue}>{alumnoData.nombre} {alumnoData.apellidos}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Matrícula:</Text>
        <Text style={styles.detailValue}>{alumnoData.matricula}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Email:</Text>
        <Text style={styles.detailValue}>{alumnoData.email}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Carrera:</Text>
        <Text style={styles.detailValue}>
          {alumnoData.carreras?.nombre || 'No especificada'}
        </Text>
      </View>
    </View>
  </View>
)}
```

#### **Información de Cambio de Carrera:**
```typescript
{cambioCarreraData && (
  <View style={styles.detailSection}>
    <Text style={styles.detailSectionTitle}>Detalles de la Solicitud</Text>
    <View style={styles.detailData}>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Carrera Actual:</Text>
        <Text style={styles.detailValue}>
          {cambioCarreraData.carreras_actuales?.nombre || 'No especificada'}
        </Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Carrera Solicitada:</Text>
        <Text style={styles.detailValue}>
          {cambioCarreraData.carreras_solicitadas?.nombre || 'No especificada'}
        </Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Estado:</Text>
        <Text style={[styles.detailValue, { 
          color: cambioCarreraData.status === 'pendiente' ? '#F59E0B' : 
                 cambioCarreraData.status === 'aprobado' ? '#10B981' : '#EF4444'
        }]}>
          {cambioCarreraData.status || 'Pendiente'}
        </Text>
      </View>
    </View>
  </View>
)}
```

### 3. **Script de Datos de Prueba**

Se creó `scripts/insert-test-data.sql` para insertar datos de prueba válidos:

```sql
-- Insertar alumnos de prueba
INSERT INTO alumnos (id, nombre, apellidos, matricula, email, carrera_id, created_at) VALUES
(1, 'Juan', 'Pérez García', '2024001', 'juan.perez@alumno.um.edu.mx', 1, NOW()),
(2, 'María', 'González López', '2024002', 'maria.gonzalez@alumno.um.edu.mx', 2, NOW()),
-- ... más datos

-- Insertar peticiones de cambio de carrera
INSERT INTO cambio_carrera (id, alumno_id, carrera_actual_id, carrera_solicitada_id, status, created_at) VALUES
(1, 1, 1, 3, 'pendiente', NOW()),
(2, 2, 2, 4, 'pendiente', NOW()),
-- ... más datos

-- Insertar notificaciones con datos_adicionales válidos
INSERT INTO notificaciones (id, usuario_id, tipo, titulo, mensaje, datos_adicionales, leida, created_at) VALUES
(1, 1, 'cambio_carrera', 'Nueva solicitud de cambio de carrera', 'El alumno Juan Pérez García ha solicitado un cambio de carrera de Ingeniería en Sistemas a Medicina.', '{"alumno_id": 1, "peticion_id": 1, "carrera_actual": "Ingeniería en Sistemas", "carrera_solicitada": "Medicina", "fecha_solicitud": "2024-01-15"}', false, NOW()),
-- ... más notificaciones
```

## Resultados

### ✅ **Antes:**
- Al seleccionar notificación/alumno → Aside/Bottom sheet vacío
- Solo mostraba "Información Detallada" sin contenido
- No había indicadores de carga

### ✅ **Después:**
- Al seleccionar notificación → Carga datos del alumno y petición
- Al buscar alumno → Muestra información completa del alumno
- Indicador de carga mientras se obtienen los datos
- Información detallada y organizada por secciones
- Manejo de errores con alertas informativas

## Funcionalidades Implementadas

1. **Carga Asíncrona de Datos**: Los datos se cargan dinámicamente cuando se selecciona un elemento
2. **Indicadores de Carga**: Muestra "Cargando información..." mientras se obtienen los datos
3. **Información Detallada**: Muestra datos completos del alumno, peticiones de cambio de carrera, etc.
4. **Manejo de Errores**: Alertas informativas si no se pueden cargar los datos
5. **Datos de Prueba Válidos**: Script SQL para insertar datos de prueba con IDs válidos

## Uso

1. **Ejecutar el script SQL** en Supabase para tener datos de prueba
2. **Buscar un alumno** → Se mostrará información completa
3. **Seleccionar una notificación** → Se cargarán datos del alumno y petición
4. **Ver indicadores de carga** mientras se obtienen los datos

## Archivos Modificados

- `components/ui/DynamicHeader.tsx` - Lógica principal de carga de datos
- `scripts/insert-test-data.sql` - Datos de prueba
- `hooks/notifications/useNotifications.ts` - Datos de prueba en el hook

La solución asegura que tanto las notificaciones como la búsqueda de alumnos muestren información detallada y completa en el aside panel y bottom sheet. 