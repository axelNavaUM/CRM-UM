-- Script para prevenir peticiones duplicadas
-- Ejecutar en Supabase SQL Editor

-- 1. Agregar restricción única para prevenir peticiones duplicadas
-- Esta restricción asegura que no se puedan crear peticiones idénticas para el mismo alumno
ALTER TABLE peticiones_cambio_carrera 
ADD CONSTRAINT unique_peticion_alumno 
UNIQUE (alumno_id, carrera_actual_id, carrera_nueva_id, ciclo_actual_id, ciclo_nuevo_id);

-- 2. Crear función para verificar si ya existe una petición similar
CREATE OR REPLACE FUNCTION verificar_peticion_duplicada(
    p_alumno_id INTEGER,
    p_carrera_actual_id INTEGER,
    p_carrera_nueva_id INTEGER,
    p_ciclo_actual_id INTEGER,
    p_ciclo_nuevo_id INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
    peticion_existente INTEGER;
BEGIN
    -- Verificar si ya existe una petición similar
    SELECT COUNT(*) INTO peticion_existente
    FROM peticiones_cambio_carrera
    WHERE alumno_id = p_alumno_id 
    AND carrera_actual_id = p_carrera_actual_id
    AND carrera_nueva_id = p_carrera_nueva_id
    AND ciclo_actual_id = p_ciclo_actual_id
    AND ciclo_nuevo_id = p_ciclo_nuevo_id
    AND estado IN ('pendiente', 'aprobada');
    
    RETURN peticion_existente > 0;
END;
$$ LANGUAGE plpgsql;

-- 3. Crear trigger para prevenir peticiones duplicadas antes de insertar
CREATE OR REPLACE FUNCTION prevenir_peticiones_duplicadas()
RETURNS TRIGGER AS $$
BEGIN
    -- Verificar si ya existe una petición similar
    IF EXISTS (
        SELECT 1 FROM peticiones_cambio_carrera 
        WHERE alumno_id = NEW.alumno_id 
        AND carrera_actual_id = NEW.carrera_actual_id
        AND carrera_nueva_id = NEW.carrera_nueva_id
        AND ciclo_actual_id = NEW.ciclo_actual_id
        AND ciclo_nuevo_id = NEW.ciclo_nuevo_id
        AND estado IN ('pendiente', 'aprobada')
        AND id != COALESCE(NEW.id, -1)
    ) THEN
        RAISE EXCEPTION 'Ya existe una petición similar para este alumno. No se pueden crear peticiones duplicadas.';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Crear trigger para ejecutar la validación
DROP TRIGGER IF EXISTS trigger_prevenir_peticiones_duplicadas ON peticiones_cambio_carrera;
CREATE TRIGGER trigger_prevenir_peticiones_duplicadas
    BEFORE INSERT OR UPDATE ON peticiones_cambio_carrera
    FOR EACH ROW
    EXECUTE FUNCTION prevenir_peticiones_duplicadas();

-- 5. Crear función para obtener peticiones duplicadas existentes
CREATE OR REPLACE FUNCTION obtener_peticiones_duplicadas()
RETURNS TABLE (
    alumno_id INTEGER,
    carrera_actual_id INTEGER,
    carrera_nueva_id INTEGER,
    ciclo_actual_id INTEGER,
    ciclo_nuevo_id INTEGER,
    cantidad_duplicadas BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.alumno_id,
        p.carrera_actual_id,
        p.carrera_nueva_id,
        p.ciclo_actual_id,
        p.ciclo_nuevo_id,
        COUNT(*) as cantidad_duplicadas
    FROM peticiones_cambio_carrera p
    GROUP BY p.alumno_id, p.carrera_actual_id, p.carrera_nueva_id, p.ciclo_actual_id, p.ciclo_nuevo_id
    HAVING COUNT(*) > 1
    ORDER BY cantidad_duplicadas DESC;
END;
$$ LANGUAGE plpgsql;

-- 6. Crear función para limpiar peticiones duplicadas (mantener la más reciente)
CREATE OR REPLACE FUNCTION limpiar_peticiones_duplicadas()
RETURNS INTEGER AS $$
DECLARE
    peticiones_eliminadas INTEGER := 0;
    peticion_record RECORD;
BEGIN
    -- Eliminar peticiones duplicadas (mantener la más reciente)
    FOR peticion_record IN 
        SELECT DISTINCT ON (alumno_id, carrera_actual_id, carrera_nueva_id, ciclo_actual_id, ciclo_nuevo_id) 
            id, alumno_id, carrera_actual_id, carrera_nueva_id, ciclo_actual_id, ciclo_nuevo_id, fecha_solicitud
        FROM peticiones_cambio_carrera 
        ORDER BY alumno_id, carrera_actual_id, carrera_nueva_id, ciclo_actual_id, ciclo_nuevo_id, fecha_solicitud DESC
    LOOP
        DELETE FROM peticiones_cambio_carrera 
        WHERE alumno_id = peticion_record.alumno_id 
        AND carrera_actual_id = peticion_record.carrera_actual_id
        AND carrera_nueva_id = peticion_record.carrera_nueva_id
        AND ciclo_actual_id = peticion_record.ciclo_actual_id
        AND ciclo_nuevo_id = peticion_record.ciclo_nuevo_id
        AND id != peticion_record.id;
        
        GET DIAGNOSTICS peticiones_eliminadas = ROW_COUNT;
    END LOOP;
    
    RETURN peticiones_eliminadas;
END;
$$ LANGUAGE plpgsql;

-- 7. Verificar que las restricciones se aplicaron correctamente
SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'peticiones_cambio_carrera' 
AND constraint_type = 'UNIQUE'
ORDER BY constraint_name;

-- 8. Verificar que las funciones se crearon correctamente
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name LIKE '%peticion%'
ORDER BY routine_name; 