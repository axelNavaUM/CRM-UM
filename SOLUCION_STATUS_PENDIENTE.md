# Solución para Alumnos con Status "Pendiente" Incorrecto

## Problema Identificado

Alumnos que subieron todos los documentos requeridos pero aparecen con status "pendiente" en lugar de "activo".

## Causa del Problema

El sistema registra a todos los alumnos con status "pendiente" por defecto, pero no actualiza automáticamente el status a "activo" cuando todos los documentos están completos.

## Estructura Real de las Tablas

Basado en el esquema SQL proporcionado:
- **Tabla alumnos**: `public.alumnos` con campo `status` (varchar, default 'pendiente')
- **Tabla documentos**: `public.documentos_alumno` (no `documentos_alumnos`)
- **Documentos requeridos**: `acta`, `certificado_prepa`, `formato_pago`

## Solución Implementada

### 🔧 **Script SQL Corregido**

Se crearon scripts específicos para la estructura real:

1. **`scripts/diagnostico-documentos.sql`** - Diagnóstico completo
2. **`scripts/corregir-status-simple.sql`** - Corrección directa y simple

### 📋 **Documentos Requeridos**

Los documentos que se verifican son:
- ✅ **Acta de nacimiento** (`acta`)
- ✅ **Certificado de preparatoria** (`certificado_prepa`)
- ✅ **Comprobante de pago** (`formato_pago`)

## Instrucciones para Solucionar

### 1. **Ejecutar Diagnóstico Primero**

```sql
-- En Supabase SQL Editor, ejecutar:
-- scripts/diagnostico-documentos.sql
```

Esto te mostrará:
- Estructura de la tabla documentos_alumno
- Cuántos documentos hay en total
- Qué tipos de documentos existen
- Alumnos y sus documentos actuales
- Alumnos pendientes específicamente

### 2. **Ejecutar Corrección Simple**

```sql
-- En Supabase SQL Editor, ejecutar:
-- scripts/corregir-status-simple.sql
```

Este script:
1. **Muestra la situación actual** - Cuántos alumnos hay por status
2. **Identifica alumnos pendientes** - Con sus documentos
3. **Encuentra alumnos completos** - Que tienen los 3 documentos requeridos
4. **Actualiza automáticamente** - Cambia status de "pendiente" a "activo"
5. **Verifica el resultado** - Muestra la situación después de la actualización
6. **Muestra alumnos pendientes restantes** - Con explicación de por qué siguen pendientes

### 3. **Verificar Manualmente (Opcional)**

```sql
-- Consulta para verificar el status actual
SELECT 
    id,
    nombre || ' ' || apellidos as nombre_completo,
    status,
    email
FROM alumnos 
ORDER BY id;
```

### 4. **Verificar Documentos de un Alumno Específico**

```sql
-- Reemplaza [ID_DEL_ALUMNO] con el ID real
SELECT 
    a.nombre || ' ' || a.apellidos as alumno,
    da.tipo_documento,
    da.url_archivo,
    da.fecha_subida
FROM alumnos a
LEFT JOIN documentos_alumno da ON a.id = da.alumno_id
WHERE a.id = [ID_DEL_ALUMNO]
ORDER BY da.tipo_documento;
```

## Verificación Paso a Paso

### 🔍 **Paso 1: Diagnóstico**
```sql
-- Ejecutar scripts/diagnostico-documentos.sql
-- Revisar los resultados para entender la situación actual
```

### 🔄 **Paso 2: Corrección**
```sql
-- Ejecutar scripts/corregir-status-simple.sql
-- El script mostrará antes y después de la actualización
```

### ✅ **Paso 3: Verificación**
```sql
-- Verificar que los alumnos con documentos completos ahora están "activo"
SELECT status, COUNT(*) FROM alumnos GROUP BY status;
```

## Troubleshooting

### Si el Script No Funciona:

1. **Verificar que la tabla existe**:
```sql
SELECT * FROM documentos_alumno LIMIT 1;
```

2. **Verificar que hay datos**:
```sql
SELECT COUNT(*) FROM documentos_alumno;
```

3. **Verificar tipos de documentos**:
```sql
SELECT DISTINCT tipo_documento FROM documentos_alumno;
```

### Si Hay Errores:

1. **Verificar permisos**: Asegurar que el usuario tiene permisos de UPDATE en la tabla alumnos
2. **Verificar datos**: Confirmar que los documentos están en la tabla correcta
3. **Revisar logs**: Verificar si hay errores en la consola de Supabase

### Si Algunos Alumnos Siguen Pendientes:

Esto es **normal** si:
- No tienen todos los documentos requeridos
- Los documentos tienen nombres diferentes a los esperados
- Hay errores en la subida de documentos

## Resultado Esperado

Después de ejecutar `scripts/corregir-status-simple.sql`:

- ✅ **Alumnos con los 3 documentos** → Status "activo"
- ⚠️ **Alumnos con documentos faltantes** → Status "pendiente" (correcto)
- 📊 **Reporte detallado** de la situación actual

## Verificación Rápida

```sql
-- Consulta rápida para ver el resultado
SELECT 
    status,
    COUNT(*) as cantidad,
    CASE 
        WHEN status = 'activo' THEN '✅ Completos'
        WHEN status = 'pendiente' THEN '⚠️ Pendientes'
        ELSE '❓ Otros'
    END as estado
FROM alumnos 
GROUP BY status 
ORDER BY status;
```

## Contacto

Si el problema persiste después de ejecutar los scripts:
1. Revisar los logs de Supabase
2. Verificar que los documentos están en la tabla `documentos_alumno`
3. Confirmar que los tipos de documentos son exactamente: `acta`, `certificado_prepa`, `formato_pago` 