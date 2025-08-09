-- Script para corregir el status de alumnos que tienen todos los documentos pero aparecen como pendientes
-- Ejecutar en Supabase SQL Editor

-- 1. Función para verificar si un alumno tiene todos los documentos requeridos
CREATE OR REPLACE FUNCTION verificar_documentos_completos(p_alumno_id INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    documentos_requeridos TEXT[] := ARRAY['acta', 'certificado_prepa', 'formato_pago'];
    documentos_subidos TEXT[];
    doc TEXT;
BEGIN
    -- Obtener documentos subidos del alumno
    SELECT ARRAY_AGG(tipo_documento) INTO documentos_subidos
    FROM documentos_alumno
    WHERE alumno_id = p_alumno_id;
    
    -- Si no hay documentos subidos, retornar false
    IF documentos_subidos IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Verificar que todos los documentos requeridos estén presentes
    FOREACH doc IN ARRAY documentos_requeridos
    LOOP
        IF NOT (doc = ANY(documentos_subidos)) THEN
            RETURN FALSE;
        END IF;
    END LOOP;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 2. Función para actualizar status de alumnos con documentos completos
CREATE OR REPLACE FUNCTION actualizar_status_alumnos_completos()
RETURNS INTEGER AS $$
DECLARE
    alumno RECORD;
    alumnos_actualizados INTEGER := 0;
BEGIN
    -- Recorrer todos los alumnos con status 'pendiente'
    FOR alumno IN 
        SELECT id, nombre, apellidos 
        FROM alumnos 
        WHERE status = 'pendiente'
    LOOP
        -- Verificar si tiene todos los documentos
        IF verificar_documentos_completos(alumno.id) THEN
            -- Actualizar status a 'activo'
            UPDATE alumnos 
            SET status = 'activo' 
            WHERE id = alumno.id;
            
            alumnos_actualizados := alumnos_actualizados + 1;
            
            RAISE NOTICE 'Alumno % % actualizado a status "activo"', alumno.nombre, alumno.apellidos;
        END IF;
    END LOOP;
    
    RETURN alumnos_actualizados;
END;
$$ LANGUAGE plpgsql;

-- 3. Función para mostrar estadísticas de documentos
CREATE OR REPLACE FUNCTION mostrar_estadisticas_documentos()
RETURNS TABLE (
    alumno_id INTEGER,
    nombre_completo TEXT,
    status_actual TEXT,
    documentos_subidos TEXT[],
    documentos_faltantes TEXT[],
    tiene_todos BOOLEAN
) AS $$
DECLARE
    alumno RECORD;
    documentos_requeridos TEXT[] := ARRAY['acta', 'certificado_prepa', 'formato_pago'];
    documentos_subidos TEXT[];
    documentos_faltantes TEXT[];
    doc TEXT;
BEGIN
    FOR alumno IN 
        SELECT a.id, a.nombre, a.apellidos, a.status
        FROM alumnos a
        ORDER BY a.id
    LOOP
        -- Obtener documentos subidos
        SELECT ARRAY_AGG(tipo_documento) INTO documentos_subidos
        FROM documentos_alumno
        WHERE alumno_id = alumno.id;
        
        -- Si no hay documentos, array vacío
        IF documentos_subidos IS NULL THEN
            documentos_subidos := ARRAY[]::TEXT[];
        END IF;
        
        -- Calcular documentos faltantes
        documentos_faltantes := ARRAY[]::TEXT[];
        FOREACH doc IN ARRAY documentos_requeridos
        LOOP
            IF NOT (doc = ANY(documentos_subidos)) THEN
                documentos_faltantes := array_append(documentos_faltantes, doc);
            END IF;
        END LOOP;
        
        -- Retornar fila
        RETURN QUERY SELECT 
            alumno.id,
            (alumno.nombre || ' ' || alumno.apellidos)::TEXT,
            alumno.status::TEXT,
            documentos_subidos,
            documentos_faltantes,
            array_length(documentos_faltantes, 1) = 0
        FROM (SELECT 1) AS dummy;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 4. Ejecutar actualización automática
SELECT actualizar_status_alumnos_completos() as alumnos_actualizados;

-- 5. Mostrar estadísticas actuales
SELECT * FROM mostrar_estadisticas_documentos();

-- 6. Mostrar resumen
SELECT 
    status,
    COUNT(*) as cantidad_alumnos
FROM alumnos 
GROUP BY status 
ORDER BY status;

-- 7. Mostrar alumnos que aún están pendientes
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