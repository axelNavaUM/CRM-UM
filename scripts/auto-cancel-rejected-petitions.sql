-- Script para implementar cancelación automática de peticiones rechazadas
-- Ejecutar en Supabase SQL Editor

-- 1. Función para cancelar automáticamente una petición cuando se rechaza
CREATE OR REPLACE FUNCTION cancelar_peticion_rechazada()
RETURNS TRIGGER AS $$
BEGIN
    -- Si la petición se rechaza, actualizar el estado a 'cancelada'
    IF NEW.estado = 'rechazada' AND OLD.estado != 'rechazada' THEN
        -- Actualizar la petición como cancelada
        UPDATE peticiones_cambio_carrera 
        SET 
            estado = 'cancelada',
            fecha_resolucion = NOW()
        WHERE id = NEW.id;
        
        -- Crear notificación para el asesor que solicitó la petición
        INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje, datos_adicionales)
        VALUES (
            NEW.asesor_id,
            'peticion_rechazada',
            'Petición de cambio de carrera rechazada',
            'Su petición de cambio de carrera ha sido rechazada y cancelada automáticamente.',
            jsonb_build_object('peticion_id', NEW.id, 'alumno_id', NEW.alumno_id)
        );
        
        -- Crear notificación para el alumno (si tiene usuario asociado)
        INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje, datos_adicionales)
        SELECT 
            u.idusuario,
            'peticion_rechazada',
            'Petición de cambio de carrera rechazada',
            'Su petición de cambio de carrera ha sido rechazada y cancelada automáticamente.',
            jsonb_build_object('peticion_id', NEW.id, 'alumno_id', NEW.alumno_id)
        FROM usuariosum u
        WHERE u.correoinstitucional = (
            SELECT email FROM alumnos WHERE id = NEW.alumno_id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Trigger para ejecutar la cancelación automática
DROP TRIGGER IF EXISTS trigger_cancelar_peticion_rechazada ON peticiones_cambio_carrera;
CREATE TRIGGER trigger_cancelar_peticion_rechazada
    AFTER UPDATE ON peticiones_cambio_carrera
    FOR EACH ROW
    EXECUTE FUNCTION cancelar_peticion_rechazada();

-- 3. Función para obtener estadísticas de peticiones canceladas
CREATE OR REPLACE FUNCTION obtener_estadisticas_peticiones_canceladas()
RETURNS TABLE (
    total_canceladas INTEGER,
    canceladas_por_rechazo INTEGER,
    canceladas_por_tiempo INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_canceladas,
        COUNT(CASE WHEN estado = 'cancelada' AND fecha_resolucion IS NOT NULL THEN 1 END) as canceladas_por_rechazo,
        COUNT(CASE WHEN estado = 'cancelada' AND fecha_resolucion IS NULL THEN 1 END) as canceladas_por_tiempo
    FROM peticiones_cambio_carrera 
    WHERE estado = 'cancelada';
END;
$$ LANGUAGE plpgsql;

-- 4. Función para limpiar peticiones canceladas antiguas (opcional)
CREATE OR REPLACE FUNCTION limpiar_peticiones_canceladas_antiguas(dias_antiguedad INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    peticiones_eliminadas INTEGER := 0;
BEGIN
    DELETE FROM peticiones_cambio_carrera 
    WHERE estado = 'cancelada' 
    AND fecha_resolucion < NOW() - INTERVAL '1 day' * dias_antiguedad;
    
    GET DIAGNOSTICS peticiones_eliminadas = ROW_COUNT;
    RETURN peticiones_eliminadas;
END;
$$ LANGUAGE plpgsql;

-- 5. Verificar que las funciones se crearon correctamente
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name LIKE '%cancelar%' OR routine_name LIKE '%peticion%'
ORDER BY routine_name;

-- 6. Mostrar estadísticas actuales de peticiones
SELECT 
    estado,
    COUNT(*) as cantidad,
    MIN(fecha_solicitud) as fecha_mas_antigua,
    MAX(fecha_solicitud) as fecha_mas_reciente
FROM peticiones_cambio_carrera 
GROUP BY estado
ORDER BY estado; 