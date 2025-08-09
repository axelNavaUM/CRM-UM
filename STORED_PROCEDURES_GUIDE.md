# Guía para Obtener Stored Procedures

## 🎯 Opciones Disponibles

### 1. **Script SQL Directo (Recomendado)**
```sql
-- Ejecutar en Supabase SQL Editor
SELECT 
    routine_name,
    routine_type,
    data_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_type = 'PROCEDURE'
ORDER BY routine_name;
```

### 2. **Script TypeScript desde tu App**
```typescript
import { ProcedureDocumentation } from '@/scripts/get-procedures';

// Obtener stored procedures
const procedures = await ProcedureDocumentation.getStoredProcedures();

// Generar documentación
const docs = await ProcedureDocumentation.generateDocumentation();

// Mostrar resumen
await ProcedureDocumentation.showSummary();
```

### 3. **Componente React Native**
```typescript
import ProcedureDocumentationComponent from '@/components/ui/ProcedureDocumentation';

// Usar en cualquier pantalla
<ProcedureDocumentationComponent />
```

## 🔧 Cómo Usar

### **Opción 1: Supabase SQL Editor**
1. Ve a tu proyecto en Supabase
2. Abre el **SQL Editor**
3. Copia y pega el script de `scripts/simple-procedures-query.sql`
4. Ejecuta la consulta
5. Los resultados se mostrarán en la tabla

### **Opción 2: Desde tu Aplicación**
1. Importa el script TypeScript
2. Llama a las funciones desde cualquier componente
3. Los resultados se mostrarán en la consola

### **Opción 3: Componente Visual**
1. Importa el componente `ProcedureDocumentationComponent`
2. Úsalo en cualquier pantalla de tu app
3. Interactúa con los botones para obtener la información

## 📋 Consultas Disponibles

### **Stored Procedures**
```sql
-- Lista todos los stored procedures
SELECT routine_name, routine_type, data_type, routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_type = 'PROCEDURE'
ORDER BY routine_name;
```

### **Funciones**
```sql
-- Lista todas las funciones
SELECT routine_name, routine_type, data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_type = 'FUNCTION'
ORDER BY routine_name;
```

### **Triggers**
```sql
-- Lista todos los triggers
SELECT trigger_name, event_manipulation, action_statement, action_timing
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY trigger_name;
```

## 🎨 Funciones del Script TypeScript

### **ProcedureDocumentation.getStoredProcedures()**
```typescript
// Obtiene todos los stored procedures
const procedures = await ProcedureDocumentation.getStoredProcedures();
console.log(`Encontrados ${procedures.length} stored procedures`);
```

### **ProcedureDocumentation.getAllRoutines()**
```typescript
// Obtiene funciones y procedures
const routines = await ProcedureDocumentation.getAllRoutines();
console.log(`Encontradas ${routines.length} rutinas`);
```

### **ProcedureDocumentation.getTriggers()**
```typescript
// Obtiene todos los triggers
const triggers = await ProcedureDocumentation.getTriggers();
console.log(`Encontrados ${triggers.length} triggers`);
```

### **ProcedureDocumentation.generateDocumentation()**
```typescript
// Genera documentación completa en markdown
const docs = await ProcedureDocumentation.generateDocumentation();
console.log(docs);
```

### **ProcedureDocumentation.showSummary()**
```typescript
// Muestra resumen en consola
await ProcedureDocumentation.showSummary();
```

## 📊 Estructura de Datos

### **StoredProcedure Interface**
```typescript
interface StoredProcedure {
  routine_name: string;      // Nombre del procedure
  routine_type: string;      // PROCEDURE o FUNCTION
  data_type: string;         // Tipo de retorno
  routine_definition?: string; // Código del procedure
}
```

### **Trigger Interface**
```typescript
interface Trigger {
  trigger_name: string;        // Nombre del trigger
  event_manipulation: string;  // INSERT, UPDATE, DELETE
  action_statement: string;    // Código del trigger
  action_timing: string;       // BEFORE, AFTER
}
```

## 🚀 Ejemplo de Uso Completo

```typescript
import { ProcedureDocumentation } from '@/scripts/get-procedures';

async function generateDatabaseDocs() {
  try {
    console.log('🚀 Iniciando documentación de base de datos...');
    
    // Obtener stored procedures
    const procedures = await ProcedureDocumentation.getStoredProcedures();
    console.log(`📋 Encontrados ${procedures.length} stored procedures`);
    
    // Obtener triggers
    const triggers = await ProcedureDocumentation.getTriggers();
    console.log(`⚡ Encontrados ${triggers.length} triggers`);
    
    // Generar documentación
    const docs = await ProcedureDocumentation.generateDocumentation();
    console.log('📄 Documentación generada:', docs);
    
    // Mostrar resumen
    await ProcedureDocumentation.showSummary();
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Ejecutar
generateDatabaseDocs();
```

## 📄 Documentación Generada

El script genera documentación en formato Markdown con:

- **Lista de Stored Procedures** con definiciones
- **Lista de Funciones** con tipos de retorno
- **Lista de Triggers** con eventos y acciones
- **Resumen estadístico** de la base de datos

## 🔍 Troubleshooting

### **Error: "No se encontraron stored procedures"**
- Verifica que tu base de datos tenga stored procedures
- Asegúrate de que estés conectado a la base de datos correcta
- Revisa los permisos de tu usuario de Supabase

### **Error: "No se puede acceder a information_schema"**
- Verifica que tu API key tenga permisos de lectura
- Usa la Service Role Key en lugar de la anon key

### **Error: "Timeout en la consulta"**
- La consulta puede tardar si hay muchos procedures
- Considera usar consultas más específicas
- Verifica la conexión a internet

## 🎯 Próximos Pasos

1. **Ejecuta el script SQL** en Supabase para ver qué tienes
2. **Usa el componente visual** para explorar interactivamente
3. **Genera documentación** para tu proyecto
4. **Guarda los resultados** para referencia futura

## 📞 Soporte

Si tienes problemas:
1. Revisa la consola para errores específicos
2. Verifica la conexión a Supabase
3. Asegúrate de que las tablas `information_schema` estén accesibles
4. Usa el script SQL directo como fallback 