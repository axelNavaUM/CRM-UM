-- Script para corregir el error de columna "rolarea" no existente
-- Elimina el trigger anterior y crea el corregido

-- 1. Eliminar el trigger anterior que causa el error
DROP TRIGGER IF EXISTS trigger_notificar_firma_cambio_carrera ON firmas_cambio_carrera;
DROP FUNCTION IF EXISTS notificar_firma_cambio_carrera();

-- 2. Crear la función corregida
CREATE OR REPLACE FUNCTION notificar_firma_cambio_carrera()
RETURNS TRIGGER AS $$
DECLARE
  jefe_ventas_id INT;
  asesor_id INT;
  estado_firma TEXT;
  mensaje TEXT;
BEGIN
  -- Solo notificar si el estado cambió a aprobada o rechazada
  IF NEW.estado IN ('aprobada', 'rechazada') AND OLD.estado = 'pendiente' THEN
    -- Buscar jefe de ventas usando JOIN correcto con areas
    SELECT u.idusuario INTO jefe_ventas_id
    FROM usuariosum u
    JOIN areas a ON u.idarea = a.idarea
    WHERE a.rolarea = 'jefe de ventas'
    LIMIT 1;

    -- Buscar asesor que creó la petición
    SELECT asesor_id INTO asesor_id
    FROM peticiones_cambio_carrera
    WHERE id = NEW.peticion_id;

    -- Mensaje personalizado
    IF NEW.estado = 'aprobada' THEN
      mensaje := 'Un área ha aprobado la petición de cambio de carrera.';
    ELSE
      mensaje := 'Un área ha rechazado la petición de cambio de carrera.';
    END IF;

    -- Notificar al jefe de ventas
    IF jefe_ventas_id IS NOT NULL THEN
      INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje, datos_adicionales, fecha_creacion)
      VALUES (
        jefe_ventas_id,
        'firma_area',
        'Firma de área registrada',
        mensaje,
        jsonb_build_object('peticion_id', NEW.peticion_id, 'area_id', NEW.area_id, 'estado', NEW.estado),
        NOW()
      );
    END IF;

    -- Notificar al asesor
    IF asesor_id IS NOT NULL THEN
      INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje, datos_adicionales, fecha_creacion)
      VALUES (
        asesor_id,
        'firma_area',
        'Firma de área registrada',
        mensaje,
        jsonb_build_object('peticion_id', NEW.peticion_id, 'area_id', NEW.area_id, 'estado', NEW.estado),
        NOW()
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Crear el trigger corregido
CREATE TRIGGER trigger_notificar_firma_cambio_carrera
AFTER UPDATE ON firmas_cambio_carrera
FOR EACH ROW
EXECUTE FUNCTION notificar_firma_cambio_carrera();

-- 4. Verificar que se creó correctamente
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_notificar_firma_cambio_carrera';

-- 5. Verificar que la función existe
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_name = 'notificar_firma_cambio_carrera'; 