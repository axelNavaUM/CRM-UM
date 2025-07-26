-- Script para crear tabla de firmas de aprobación
-- Ejecutar en Supabase SQL Editor

-- 1. Crear tabla para las firmas de aprobación
CREATE TABLE IF NOT EXISTS firmas_cambio_carrera (
    id SERIAL PRIMARY KEY,
    peticion_id INTEGER REFERENCES peticiones_cambio_carrera(id) ON DELETE CASCADE,
    area_id INTEGER REFERENCES areas(idarea),
    usuario_firmante_id INTEGER REFERENCES usuariosum(idusuario),
    estado VARCHAR(20) DEFAULT 'pendiente', -- 'pendiente', 'aprobada', 'rechazada'
    fecha_firma TIMESTAMP,
    contraseña_usada VARCHAR(255),
    comentarios TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_firmas_peticion ON firmas_cambio_carrera(peticion_id);
CREATE INDEX IF NOT EXISTS idx_firmas_area ON firmas_cambio_carrera(area_id);
CREATE INDEX IF NOT EXISTS idx_firmas_estado ON firmas_cambio_carrera(estado);

-- 3. Función para crear automáticamente las firmas requeridas cuando se crea una petición
CREATE OR REPLACE FUNCTION crear_firmas_requeridas()
RETURNS TRIGGER AS $$
BEGIN
    -- Crear una firma para cada área que participa en la firma de cambio de carrera
    INSERT INTO firmas_cambio_carrera (peticion_id, area_id, estado)
    SELECT 
        NEW.id,
        a.idarea,
        'pendiente'
    FROM areas a
    WHERE a.participa_firma_cambio_carrera = true
    AND a.rolarea NOT IN ('superSu', 'administrador'); -- superSU y admin pueden firmar cualquier cosa
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Trigger para crear firmas automáticamente
CREATE TRIGGER trigger_crear_firmas_requeridas
    AFTER INSERT ON peticiones_cambio_carrera
    FOR EACH ROW
    EXECUTE FUNCTION crear_firmas_requeridas();

-- 5. Función para verificar si todas las firmas están aprobadas
CREATE OR REPLACE FUNCTION verificar_firmas_completas(peticion_id_param INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    firmas_pendientes INTEGER;
    firmas_rechazadas INTEGER;
BEGIN
    -- Contar firmas pendientes
    SELECT COUNT(*) INTO firmas_pendientes
    FROM firmas_cambio_carrera
    WHERE peticion_id = peticion_id_param AND estado = 'pendiente';
    
    -- Contar firmas rechazadas
    SELECT COUNT(*) INTO firmas_rechazadas
    FROM firmas_cambio_carrera
    WHERE peticion_id = peticion_id_param AND estado = 'rechazada';
    
    -- Si hay rechazadas, retornar false
    IF firmas_rechazadas > 0 THEN
        RETURN false;
    END IF;
    
    -- Si no hay pendientes, todas están aprobadas
    RETURN firmas_pendientes = 0;
END;
$$ LANGUAGE plpgsql;

-- 6. Función para procesar cambio de carrera cuando todas las firmas están aprobadas
CREATE OR REPLACE FUNCTION procesar_cambio_carrera_aprobado(peticion_id_param INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    peticion RECORD;
    todas_aprobadas BOOLEAN;
BEGIN
    -- Obtener la petición
    SELECT * INTO peticion FROM peticiones_cambio_carrera WHERE id = peticion_id_param;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Petición no encontrada';
    END IF;
    
    -- Verificar si todas las firmas están aprobadas
    SELECT verificar_firmas_completas(peticion_id_param) INTO todas_aprobadas;
    
    IF NOT todas_aprobadas THEN
        RAISE EXCEPTION 'No todas las firmas están aprobadas';
    END IF;
    
    -- Actualizar el alumno
    UPDATE alumnos 
    SET 
        carrera_id = peticion.carrera_nueva_id,
        ciclo_id = peticion.ciclo_nuevo_id
    WHERE id = peticion.alumno_id;
    
    -- Actualizar la petición como aprobada
    UPDATE peticiones_cambio_carrera 
    SET 
        estado = 'aprobada',
        fecha_resolucion = NOW()
    WHERE id = peticion_id_param;
    
    -- Crear notificación para el asesor
    INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje, datos_adicionales)
    VALUES (
        peticion.asesor_id,
        'cambio_carrera_aprobado',
        'Cambio de carrera aprobado',
        'Su petición de cambio de carrera para el alumno ' || 
        (SELECT nombre || ' ' || apellidos FROM alumnos WHERE id = peticion.alumno_id) || 
        ' ha sido aprobada por todas las áreas.',
        jsonb_build_object('peticion_id', peticion_id_param, 'alumno_id', peticion.alumno_id)
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 7. Verificar que las tablas se crearon correctamente
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('firmas_cambio_carrera')
ORDER BY table_name, ordinal_position; 