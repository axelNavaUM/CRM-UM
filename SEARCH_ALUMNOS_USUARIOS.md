# Búsqueda de Alumnos y Usuarios UM

## 🎯 Funcionalidades Implementadas

### ✅ **Búsqueda de Alumnos**
- **Por Matrícula**: Búsqueda exacta por número de matrícula
- **Por Nombre**: Búsqueda por nombre o apellido
- **Información Completa**: Muestra matrícula, carrera y datos del alumno

### ✅ **Búsqueda de Usuarios UM**
- **Por Nombre**: Búsqueda por nombre o apellido
- **Por Correo**: Búsqueda por correo institucional
- **Información Completa**: Muestra rol, correo y datos del usuario

## 🔍 Tipos de Búsqueda

### **Alumnos (👨‍🎓)**
```typescript
// Búsqueda por matrícula
"2024001" → Alumno con matrícula 2024001

// Búsqueda por nombre
"Juan Pérez" → Alumnos con nombre Juan o apellido Pérez

// Resultado típico
{
  id: "alumno_123",
  type: "alumno",
  title: "Juan Pérez García",
  subtitle: "Matrícula: 2024001 - Ingeniería en Sistemas",
  icon: "account-school",
  route: "/alumno/123"
}
```

### **Usuarios UM (👨‍💼)**
```typescript
// Búsqueda por nombre
"María García" → Usuarios con nombre María o apellido García

// Búsqueda por correo
"maria.garcia@um.edu.mx" → Usuario con ese correo

// Resultado típico
{
  id: "usuario_456",
  type: "usuario",
  title: "María García López",
  subtitle: "Usuario UM - Administrador - maria.garcia@um.edu.mx",
  icon: "account-cog",
  route: "/configuracion/usuario/456"
}
```

## 🎨 Diseño Visual

### **Colores por Tipo**
- **Alumnos**: Azul (#3B82F6) - Icono de estudiante
- **Usuarios UM**: Verde (#10B981) - Icono de usuario administrativo
- **Configuración**: Naranja (#F59E0B) - Icono de engranaje
- **Altas**: Púrpura (#8B5CF6) - Icono de plus

### **Estructura de Resultados**
```
┌─────────────────────────────────────┐
│ 🔵 Juan Pérez García               │
│    Matrícula: 2024001 - Ingeniería │
│    [Alumno]                        │
├─────────────────────────────────────┤
│ 🟢 María García López              │
│    Usuario UM - Administrador      │
│    [Usuario UM]                     │
└─────────────────────────────────────┘
```

## 🔧 Servicios de Búsqueda

### **SearchService.globalSearch(query)**
```typescript
// Búsqueda global que incluye todos los tipos
const results = await SearchService.globalSearch("Juan");
// Retorna: alumnos + usuarios UM + configuraciones
```

### **SearchService.searchAlumnos(query)**
```typescript
// Búsqueda específica de alumnos
const alumnos = await SearchService.searchAlumnos("2024001");
// Retorna: solo alumnos
```

### **SearchService.searchUsuariosUM(query)**
```typescript
// Búsqueda específica de usuarios UM
const usuarios = await SearchService.searchUsuariosUM("María");
// Retorna: solo usuarios UM
```

### **SearchService.searchAlumnosByMatricula(matricula)**
```typescript
// Búsqueda exacta por matrícula
const alumno = await SearchService.searchAlumnosByMatricula("2024001");
// Retorna: alumno específico
```

## 📊 Base de Datos

### **Tabla: alumnos**
```sql
SELECT id, nombre, apellidos, matricula, email, carreras(nombre)
FROM alumnos
WHERE matricula ILIKE '%query%' 
   OR nombre ILIKE '%query%' 
   OR apellidos ILIKE '%query%'
```

### **Tabla: usuariosum**
```sql
SELECT idusuario, nombreusuario, apellido, correoinstitucional, rolarea
FROM usuariosum
WHERE nombreusuario ILIKE '%query%' 
   OR apellido ILIKE '%query%' 
   OR correoinstitucional ILIKE '%query%'
```

## 🎯 Características Avanzadas

### **Filtros Visuales**
- Botones para filtrar por tipo de resultado
- Contador de resultados encontrados
- Badges identificativos por tipo

### **Sugerencias Inteligentes**
- Sugerencias de matrículas
- Sugerencias de nombres de usuarios
- Búsqueda en tiempo real

### **Navegación Directa**
- Click en resultado → Navega a la página específica
- Información completa en cada resultado
- Rutas dinámicas según el tipo

## 🧪 Componente de Prueba

```typescript
import SearchDemo from '@/components/ui/SearchDemo';

// Usar en cualquier pantalla para probar
<SearchDemo />
```

## 🔍 Ejemplos de Uso

### **Búsqueda de Alumnos**
1. **Por Matrícula**: Escribe "2024001"
2. **Por Nombre**: Escribe "Juan" o "Pérez"
3. **Resultado**: Verás información completa del alumno

### **Búsqueda de Usuarios UM**
1. **Por Nombre**: Escribe "María" o "García"
2. **Por Correo**: Escribe "maria.garcia@um.edu.mx"
3. **Resultado**: Verás información completa del usuario

## 🚀 Beneficios

1. **Búsqueda Unificada**: Un solo buscador para todo
2. **Resultados Organizados**: Separados por tipo con colores
3. **Información Completa**: Datos relevantes en cada resultado
4. **Navegación Directa**: Click para ir a la página específica
5. **Búsqueda Inteligente**: Funciona con nombres parciales
6. **Interfaz Moderna**: Diseño limpio y fácil de usar

## 📱 Compatibilidad

- **iOS**: Funciona perfectamente
- **Android**: Compatible con elevation
- **Web**: Responsive design
- **Base de Datos**: Supabase con PostgreSQL

## 🎯 Próximas Mejoras

- [ ] Búsqueda por carrera
- [ ] Filtros avanzados
- [ ] Historial de búsquedas
- [ ] Búsqueda por voz
- [ ] Exportar resultados
- [ ] Búsqueda en documentos adjuntos 