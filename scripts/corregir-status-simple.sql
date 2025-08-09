-- Script simple para corregir el status de alumnos
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar la situación actual
SELECT 
    'SITUACIÓN ACTUAL' as info,
    status,
    COUNT(*) as cantidad
FROM alumnos 
GROUP BY status 
ORDER BY status;

-- 2. Mostrar alumnos pendientes con sus documentos
SELECT 
    a.id,
    a.nombre || ' ' || a.apellidos as nombre_completo,
    a.status,
    array_agg(da.tipo_documento) as documentos_subidos
FROM alumnos a
LEFT JOIN documentos_alumno da ON a.id = da.alumno_id
WHERE a.status = 'pendiente'
GROUP BY a.id, a.nombre, a.apellidos, a.status
ORDER BY a.id;

-- 3. Identificar alumnos que tienen los 3 documentos requeridos
WITH alumnos_completos AS (
    SELECT 
        a.id,
        a.nombre || ' ' || a.apellidos as nombre_completo,
        array_agg(da.tipo_documento) as documentos_subidos
    FROM alumnos a
    LEFT JOIN documentos_alumno da ON a.id = da.alumno_id
    WHERE a.status = 'pendiente'
    GROUP BY a.id, a.nombre, a.apellidos
    HAVING 
        'acta' = ANY(array_agg(da.tipo_documento)) AND
        'certificado_prepa' = ANY(array_agg(da.tipo_documento)) AND
        'formato_pago' = ANY(array_agg(da.tipo_documento))
)
SELECT 
    id,
    nombre_completo,
    documentos_subidos,
    'DEBE ACTUALIZARSE A ACTIVO' as accion
FROM alumnos_completos;

-- 4. Actualizar alumnos que tienen los 3 documentos requeridos
UPDATE alumnos 
SET status = 'activo'
WHERE id IN (
    SELECT a.id
    FROM alumnos a
    LEFT JOIN documentos_alumno da ON a.id = da.alumno_id
    WHERE a.status = 'pendiente'
    GROUP BY a.id
    HAVING 
        'acta' = ANY(array_agg(da.tipo_documento)) AND
        'certificado_prepa' = ANY(array_agg(da.tipo_documento)) AND
        'formato_pago' = ANY(array_agg(da.tipo_documento))
);

-- 5. Verificar el resultado después de la actualización
SELECT 
    'DESPUÉS DE LA ACTUALIZACIÓN' as info,
    status,
    COUNT(*) as cantidad
FROM alumnos 
GROUP BY status 
ORDER BY status;

-- 6. Mostrar alumnos que aún están pendientes (deberían tener documentos faltantes)
SELECT 
    a.id,
    a.nombre || ' ' || a.apellidos as nombre_completo,
    a.status,
    array_agg(da.tipo_documento) as documentos_subidos,
    CASE 
        WHEN array_length(array_agg(da.tipo_documento), 1) IS NULL THEN 'SIN DOCUMENTOS'
        WHEN array_length(array_agg(da.tipo_documento), 1) < 3 THEN 'DOCUMENTOS INCOMPLETOS'
        ELSE 'ERROR - DEBERÍA ESTAR ACTIVO'
    END as estado_documentos
FROM alumnos a
LEFT JOIN documentos_alumno da ON a.id = da.alumno_id
WHERE a.status = 'pendiente'
GROUP BY a.id, a.nombre, a.apellidos, a.status
ORDER BY a.id; 