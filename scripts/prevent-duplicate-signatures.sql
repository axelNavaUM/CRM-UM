-- Script para prevenir firmas duplicadas
-- Ejecutar en Supabase SQL Editor

-- 1. Agregar restricción única para prevenir que un usuario firme múltiples veces la misma petición
-- Esta restricción asegura que un usuario solo pueda firmar una vez por petición
ALTER TABLE firmas_cambio_carrera 
ADD CONSTRAINT unique_usuario_peticion 
UNIQUE (peticion_id, usuario_firmante_id);

-- 2. Agregar restricción única para prevenir múltiples firmas de la misma área para una petición
-- Esta restricción asegura que solo haya una firma por área por petición
ALTER TABLE firmas_cambio_carrera 
ADD CONSTRAINT unique_area_peticion 
UNIQUE (peticion_id, area_id);

-- 3. Crear función para verificar si un usuario ya firmó una petición
CREATE OR REPLACE FUNCTION verificar_usuario_ya_firmo(
    p_usuario_id INTEGER,
    p_peticion_id INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
    firma_existente INTEGER;
BEGIN
    -- Verificar si el usuario ya firmó esta petición
    SELECT COUNT(*) INTO firma_existente
    FROM firmas_cambio_carrera
    WHERE peticion_id = p_peticion_id 
    AND usuario_firmante_id = p_usuario_id;
    
    RETURN firma_existente > 0;
END;
$$ LANGUAGE plpgsql;

-- 4. Crear función para verificar si un área ya firmó una petición
CREATE OR REPLACE FUNCTION verificar_area_ya_firmo(
    p_area_id INTEGER,
    p_peticion_id INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
    firma_existente INTEGER;
BEGIN
    -- Verificar si el área ya firmó esta petición
    SELECT COUNT(*) INTO firma_existente
    FROM firmas_cambio_carrera
    WHERE peticion_id = p_peticion_id 
    AND area_id = p_area_id
    AND estado IN ('aprobada', 'rechazada');
    
    RETURN firma_existente > 0;
END;
$$ LANGUAGE plpgsql;

-- 5. Crear trigger para prevenir firmas duplicadas antes de insertar/actualizar
CREATE OR REPLACE FUNCTION prevenir_firmas_duplicadas()
RETURNS TRIGGER AS $$
BEGIN
    -- Si ya existe una firma para esta petición y área, no permitir modificar
    IF EXISTS (
        SELECT 1 FROM firmas_cambio_carrera 
        WHERE peticion_id = NEW.peticion_id 
        AND area_id = NEW.area_id 
        AND id != COALESCE(NEW.id, -1)
        AND estado IN ('aprobada', 'rechazada')
    ) THEN
        RAISE EXCEPTION 'Esta petición ya ha sido firmada por esta área';
    END IF;
    
    -- Si ya existe una firma para esta petición y usuario, no permitir modificar
    IF NEW.usuario_firmante_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM firmas_cambio_carrera 
        WHERE peticion_id = NEW.peticion_id 
        AND usuario_firmante_id = NEW.usuario_firmante_id 
        AND id != COALESCE(NEW.id, -1)
    ) THEN
        RAISE EXCEPTION 'Este usuario ya ha firmado esta petición';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Crear trigger para ejecutar la validación
DROP TRIGGER IF EXISTS trigger_prevenir_firmas_duplicadas ON firmas_cambio_carrera;
CREATE TRIGGER trigger_prevenir_firmas_duplicadas
    BEFORE INSERT OR UPDATE ON firmas_cambio_carrera
    FOR EACH ROW
    EXECUTE FUNCTION prevenir_firmas_duplicadas();

-- 7. Crear función para limpiar firmas duplicadas existentes (ejecutar solo si es necesario)
CREATE OR REPLACE FUNCTION limpiar_firmas_duplicadas()
RETURNS INTEGER AS $$
DECLARE
    firmas_eliminadas INTEGER := 0;
    firma_record RECORD;
BEGIN
    -- Eliminar firmas duplicadas por usuario y petición (mantener la más reciente)
    FOR firma_record IN 
        SELECT DISTINCT ON (peticion_id, usuario_firmante_id) 
            id, peticion_id, usuario_firmante_id, fecha_firma
        FROM firmas_cambio_carrera 
        WHERE usuario_firmante_id IS NOT NULL
        ORDER BY peticion_id, usuario_firmante_id, fecha_firma DESC
    LOOP
        DELETE FROM firmas_cambio_carrera 
        WHERE peticion_id = firma_record.peticion_id 
        AND usuario_firmante_id = firma_record.usuario_firmante_id 
        AND id != firma_record.id;
        
        GET DIAGNOSTICS firmas_eliminadas = ROW_COUNT;
    END LOOP;
    
    RETURN firmas_eliminadas;
END;
$$ LANGUAGE plpgsql;

-- 8. Verificar que las restricciones se aplicaron correctamente
SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'firmas_cambio_carrera' 
AND constraint_type = 'UNIQUE'
ORDER BY constraint_name; 