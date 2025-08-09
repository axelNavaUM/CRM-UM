# Integración con Supabase - Consulta de Datos Reales

## Problema Resuelto

Cuando se hacía clic en una notificación, el panel de "Información Detallada" permanecía vacío porque no se estaba consultando información real de Supabase.

## Solución Implementada

### 1. **Funciones de Consulta a Supabase**

Se implementaron dos funciones principales para consultar datos reales:

#### **fetchAlumnoData()** - Consulta información del alumno:
```typescript
const fetchAlumnoData = async (alumnoId: number) => {
  try {
    console.log('🔍 NotificacionesScreen: Fetching alumno data for ID:', alumnoId);
    
    const { data: alumno, error: alumnoError } = await supabase
      .from('alumnos')
      .select(`
        *,
        carreras(nombre)
      `)
      .eq('id', alumnoId)
      .single();

    if (alumnoError) {
      console.error('Error fetching alumno:', alumnoError);
      return null;
    }

    console.log('🔍 NotificacionesScreen: Alumno data fetched:', alumno);
    return alumno;
  } catch (error) {
    console.error('Error fetching alumno data:', error);
    return null;
  }
};
```

#### **fetchCambioCarreraData()** - Consulta información de cambio de carrera:
```typescript
const fetchCambioCarreraData = async (peticionId: number) => {
  try {
    console.log('🔍 NotificacionesScreen: Fetching cambio carrera data for ID:', peticionId);
    
    const { data: peticion, error: peticionError } = await supabase
      .from('cambio_carrera')
      .select(`
        *,
        alumnos(nombre, apellidos, matricula, email),
        carreras_actuales(nombre),
        carreras_solicitadas(nombre)
      `)
      .eq('id', peticionId)
      .single();

    if (peticionError) {
      console.error('Error fetching cambio carrera:', peticionError);
      return null;
    }

    console.log('🔍 NotificacionesScreen: Cambio carrera data fetched:', peticion);
    return peticion;
  } catch (error) {
    console.error('Error fetching cambio carrera data:', error);
    return null;
  }
};
```

### 2. **Lógica de Consulta Automática**

Cuando se hace clic en una notificación, se ejecuta automáticamente:

```typescript
const handleNotificationPress = async (notification: any) => {
  console.log('🔍 NotificacionesScreen: Notification pressed:', notification);
  setLoadingDetail(true);
  setSelectedNotification(notification);
  setShowDetail(true);

  try {
    const isCambioCarrera = notification.tipo === 'cambio_carrera' || 
                            notification.titulo.toLowerCase().includes('cambio de carrera') ||
                            notification.mensaje.toLowerCase().includes('cambio de carrera');

    if (isCambioCarrera) {
      // Para notificaciones de cambio de carrera
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
      // Para otras notificaciones, buscar datos del alumno si existe alumno_id
      const alumnoId = notification.datos_adicionales?.alumno_id;
      if (alumnoId) {
        const alumnoData = await fetchAlumnoData(alumnoId);
        setAlumnoData(alumnoData);
      }
    }
  } catch (error) {
    console.error('Error fetching notification details:', error);
    Alert.alert('Error', 'No se pudo cargar la información detallada');
  } finally {
    setLoadingDetail(false);
  }
};
```

### 3. **Datos de Prueba Actualizados**

Se actualizaron los datos de prueba para incluir los IDs necesarios:

```typescript
const mockNotifications: Notificacion[] = [
  {
    id: 1,
    usuario_id: parseInt(user.id) || 1,
    tipo: 'cambio_carrera',
    titulo: 'Nueva solicitud de cambio de carrera',
    mensaje: 'El alumno Juan Pérez García ha solicitado un cambio de carrera...',
    datos_adicionales: {
      alumno_id: 1, // ID del alumno en Supabase
      peticion_id: 1, // ID de la petición en tabla cambio_carrera
      carrera_actual: 'Ingeniería en Sistemas',
      carrera_solicitada: 'Medicina',
      fecha_solicitud: '2024-01-15'
    },
    leida: false,
    created_at: '2024-01-15T10:30:00Z'
  },
  // ... más notificaciones
];
```

### 4. **Renderizado Condicional con Datos Reales**

El componente ahora muestra información real de Supabase:

#### **Para Notificaciones de Cambio de Carrera:**
- **Información del Alumno**: Nombre, matrícula, email, carrera actual
- **Detalles de la Solicitud**: Carrera actual, carrera solicitada, fecha, estado
- **Acciones**: Botones para gestionar la solicitud

#### **Para Otras Notificaciones:**
- **Información del Alumno**: Si está disponible en datos_adicionales
- **Información básica**: Estado, fecha de la notificación

### 5. **Estados de Carga**

Se agregó un estado de carga para mejorar la experiencia del usuario:

```typescript
const [loadingDetail, setLoadingDetail] = useState(false);

// En el renderizado:
if (loadingDetail) {
  return (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>Cargando información...</Text>
    </View>
  );
}
```

## Estructura de Tablas en Supabase

### **Tabla `alumnos`:**
```sql
CREATE TABLE alumnos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255),
  apellidos VARCHAR(255),
  matricula VARCHAR(50),
  email VARCHAR(255),
  carrera_id INTEGER REFERENCES carreras(id)
);
```

### **Tabla `cambio_carrera`:**
```sql
CREATE TABLE cambio_carrera (
  id SERIAL PRIMARY KEY,
  alumno_id INTEGER REFERENCES alumnos(id),
  carrera_actual_id INTEGER REFERENCES carreras(id),
  carrera_solicitada_id INTEGER REFERENCES carreras(id),
  status VARCHAR(50) DEFAULT 'pendiente',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **Tabla `carreras`:**
```sql
CREATE TABLE carreras (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255)
);
```

## Cómo Probar

1. **Navegar a Notificaciones**: Ve a la pestaña de notificaciones
2. **Hacer Clic en Notificación**: Selecciona cualquier notificación
3. **Ver Carga**: Deberías ver "Cargando información..."
4. **Ver Datos Reales**: Si existen los IDs en Supabase, verás información real
5. **Ver Logs**: Revisa la consola para ver las consultas a Supabase

## Logs de Depuración

Los logs te ayudarán a identificar problemas:
- `🔍 NotificacionesScreen: Notification pressed:` - Cuando se selecciona una notificación
- `🔍 NotificacionesScreen: Fetching alumno data for ID:` - Consulta de alumno
- `🔍 NotificacionesScreen: Alumno data fetched:` - Datos del alumno obtenidos
- `🔍 NotificacionesScreen: Fetching cambio carrera data for ID:` - Consulta de cambio de carrera
- `🔍 NotificacionesScreen: Cambio carrera data fetched:` - Datos de cambio de carrera obtenidos

## Solución de Problemas

Si no se cargan los datos:

1. **Verificar IDs**: Asegúrate de que los IDs en `datos_adicionales` existan en Supabase
2. **Verificar tablas**: Confirma que las tablas `alumnos`, `cambio_carrera`, `carreras` existan
3. **Verificar permisos**: Asegúrate de que el usuario tenga permisos de lectura
4. **Verificar logs**: Los logs mostrarán errores específicos de Supabase
5. **Verificar conexión**: Confirma que la conexión a Supabase esté funcionando

## Próximos Pasos

1. **Crear datos reales**: Insertar datos de prueba en las tablas de Supabase
2. **Implementar funciones de botones**: Conectar los botones de acción con la lógica real
3. **Agregar validaciones**: Validar que los datos existan antes de consultar
4. **Optimizar consultas**: Implementar caché para consultas frecuentes
5. **Agregar manejo de errores**: Mejorar el manejo de errores de Supabase 