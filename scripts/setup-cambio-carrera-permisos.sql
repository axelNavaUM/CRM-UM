-- Script para configurar permisos específicos de cambio de carrera
-- Ejecutar en Supabase SQL Editor

-- 1. Primero, vamos a agregar los permisos específicos de cambio de carrera a todas las áreas existentes
-- Esto asegura que los permisos que busca el código existan en la base de datos

-- Función para agregar permisos de cambio de carrera a un área específica
CREATE OR REPLACE FUNCTION agregar_permisos_cambio_carrera(area_id_param bigint)
RETURNS void AS $$
DECLARE
    permisos_actuales json;
    permisos_actualizados json;
BEGIN
    -- Obtener permisos actuales
    SELECT permisos INTO permisos_actuales 
    FROM areas 
    WHERE idarea = area_id_param;
    
    -- Si no hay permisos, crear un objeto vacío
    IF permisos_actuales IS NULL THEN
        permisos_actuales = '{}'::json;
    END IF;
    
    -- Agregar permisos específicos de cambio de carrera
    permisos_actualizados = permisos_actuales || '{
        "cambio_carrera_crear": true,
        "cambio_carrera_aprobar": false,
        "cambio_carrera_rechazar": false,
        "cambio_carrera_ver": true
    }'::json;
    
    -- Actualizar el área con los nuevos permisos
    UPDATE areas 
    SET permisos = permisos_actualizados 
    WHERE idarea = area_id_param;
    
    RAISE NOTICE 'Permisos de cambio de carrera agregados al área %', area_id_param;
END;
$$ LANGUAGE plpgsql;

-- 2. Aplicar permisos a todas las áreas existentes
DO $$
DECLARE
    area_record RECORD;
BEGIN
    FOR area_record IN SELECT idarea FROM areas LOOP
        PERFORM agregar_permisos_cambio_carrera(area_record.idarea);
    END LOOP;
END $$;

-- 3. Configurar permisos específicos por rol

-- Para asesores: pueden crear peticiones pero no aprobar
UPDATE areas 
SET permisos = permisos || '{
    "cambio_carrera_crear": true,
    "cambio_carrera_aprobar": false,
    "cambio_carrera_rechazar": false,
    "cambio_carrera_ver": true
}'::json
WHERE rolarea = 'asesor';

-- Para jefes de ventas: pueden crear, aprobar y rechazar
UPDATE areas 
SET permisos = permisos || '{
    "cambio_carrera_crear": true,
    "cambio_carrera_aprobar": true,
    "cambio_carrera_rechazar": true,
    "cambio_carrera_ver": true
}'::json
WHERE rolarea = 'jefe de ventas';

-- Para superSU (usuarios sin área): se maneja en el código, pero podemos crear un área especial
-- Crear área para superSU si no existe
INSERT INTO areas (nombrearea, rolarea, permisos) 
VALUES (
    'Super Administrador', 
    'super_su', 
    '{
        "alta_alumnos": true,
        "busqueda": true,
        "editar": true,
        "leer": true,
        "actualizar": true,
        "alta_usuarios": true,
        "delete": true,
        "insert": true,
        "select": true,
        "update": true,
        "cambio_carrera_crear": true,
        "cambio_carrera_aprobar": true,
        "cambio_carrera_rechazar": true,
        "cambio_carrera_ver": true
    }'::json
) ON CONFLICT (idarea) DO NOTHING;

-- 4. Función para verificar permisos de cambio de carrera
CREATE OR REPLACE FUNCTION verificar_permiso_cambio_carrera(
    email_usuario text, 
    permiso_solicitado text
)
RETURNS boolean AS $$
DECLARE
    usuario_record RECORD;
    area_record RECORD;
    tiene_permiso boolean := false;
BEGIN
    -- Obtener información del usuario
    SELECT idusuario, idarea INTO usuario_record
    FROM usuariosum 
    WHERE correoinstitucional = email_usuario;
    
    -- Si no existe el usuario, no tiene permisos
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Si el usuario no tiene área asignada, es superSU (todos los permisos)
    IF usuario_record.idarea IS NULL THEN
        RETURN true;
    END IF;
    
    -- Obtener información del área
    SELECT permisos INTO area_record
    FROM areas 
    WHERE idarea = usuario_record.idarea;
    
    -- Si no existe el área, no tiene permisos
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Verificar si el área tiene el permiso específico
    IF area_record.permisos IS NOT NULL AND 
       area_record.permisos ? permiso_solicitado THEN
        tiene_permiso := (area_record.permisos ->> permiso_solicitado)::boolean;
    END IF;
    
    RETURN tiene_permiso;
END;
$$ LANGUAGE plpgsql;

-- 5. Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_areas_rolarea ON areas(rolarea);
CREATE INDEX IF NOT EXISTS idx_usuariosum_email ON usuariosum(correoinstitucional);

-- 6. Comentarios para documentación
COMMENT ON FUNCTION agregar_permisos_cambio_carrera IS 'Agrega permisos específicos de cambio de carrera a un área';
COMMENT ON FUNCTION verificar_permiso_cambio_carrera IS 'Verifica si un usuario tiene un permiso específico de cambio de carrera';

-- 7. Mostrar resumen de permisos configurados
SELECT 
    a.idarea,
    a.nombrearea,
    a.rolarea,
    a.permisos->>'cambio_carrera_crear' as puede_crear,
    a.permisos->>'cambio_carrera_aprobar' as puede_aprobar,
    a.permisos->>'cambio_carrera_rechazar' as puede_rechazar
FROM areas a
ORDER BY a.idarea; 