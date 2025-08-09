-- Script de diagnóstico para verificar documentos de alumnos
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar estructura de la tabla documentos_alumno
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'documentos_alumno'
ORDER BY ordinal_position;

-- 2. Verificar si hay datos en documentos_alumno
SELECT 
    COUNT(*) as total_documentos,
    COUNT(DISTINCT alumno_id) as alumnos_con_documentos
FROM documentos_alumno;

-- 3. Verificar tipos de documentos existentes
SELECT 
    tipo_documento,
    COUNT(*) as cantidad
FROM documentos_alumno
GROUP BY tipo_documento
ORDER BY tipo_documento;

-- 4. Verificar alumnos y sus documentos
SELECT 
    a.id,
    a.nombre || ' ' || a.apellidos as nombre_completo,
    a.status,
    a.email,
    COUNT(da.id) as documentos_subidos,
    array_agg(da.tipo_documento) as tipos_documentos
FROM alumnos a
LEFT JOIN documentos_alumno da ON a.id = da.alumno_id
GROUP BY a.id, a.nombre, a.apellidos, a.status, a.email
ORDER BY a.id;

-- 5. Verificar alumnos pendientes específicamente
SELECT 
    a.id,
    a.nombre || ' ' || a.apellidos as nombre_completo,
    a.status,
    a.email,
    COUNT(da.id) as documentos_subidos,
    array_agg(da.tipo_documento) as tipos_documentos
FROM alumnos a
LEFT JOIN documentos_alumno da ON a.id = da.alumno_id
WHERE a.status = 'pendiente'
GROUP BY a.id, a.nombre, a.apellidos, a.status, a.email
ORDER BY a.id;

-- 6. Verificar documentos específicos por alumno (ejemplo con el primer alumno)
SELECT 
    a.id,
    a.nombre || ' ' || a.apellidos as alumno,
    da.tipo_documento,
    da.url_archivo,
    da.fecha_subida
FROM alumnos a
LEFT JOIN documentos_alumno da ON a.id = da.alumno_id
WHERE a.id = (SELECT MIN(id) FROM alumnos)
ORDER BY da.tipo_documento;

-- 7. Verificar si hay documentos duplicados
SELECT 
    alumno_id,
    tipo_documento,
    COUNT(*) as cantidad
FROM documentos_alumno
GROUP BY alumno_id, tipo_documento
HAVING COUNT(*) > 1
ORDER BY alumno_id, tipo_documento;

-- 8. Verificar alumnos sin documentos
SELECT 
    a.id,
    a.nombre || ' ' || a.apellidos as nombre_completo,
    a.status,
    a.email
FROM alumnos a
LEFT JOIN documentos_alumno da ON a.id = da.alumno_id
WHERE da.id IS NULL
ORDER BY a.id;

-- 9. Verificar alumnos con documentos incompletos
WITH documentos_requeridos AS (
    SELECT unnest(ARRAY['acta', 'certificado_prepa', 'formato_pago']) as tipo
),
alumnos_documentos AS (
    SELECT 
        a.id,
        a.nombre || ' ' || a.apellidos as nombre_completo,
        a.status,
        array_agg(da.tipo_documento) as documentos_subidos
    FROM alumnos a
    LEFT JOIN documentos_alumno da ON a.id = da.alumno_id
    GROUP BY a.id, a.nombre, a.apellidos, a.status
)
SELECT 
    ad.id,
    ad.nombre_completo,
    ad.status,
    ad.documentos_subidos,
    dr.tipo as documento_faltante
FROM alumnos_documentos ad
CROSS JOIN documentos_requeridos dr
WHERE NOT (dr.tipo = ANY(ad.documentos_subidos))
ORDER BY ad.id, dr.tipo; 