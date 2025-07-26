-- Trigger corregido para notificar a todos los firmantes de una petición de cambio de carrera
-- Corrige el problema de la relación usuariosum -> areas

CREATE OR REPLACE FUNCTION crear_notificaciones_firmantes()
RETURNS TRIGGER AS $$
BEGIN
  -- Para cada área involucrada en la petición, notifica a todos los usuarios de esa área
  INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje, datos_adicionales, leida, fecha_creacion)
  SELECT u.idusuario,
         'firma_cambio_carrera',
         'Nueva solicitud de cambio de carrera',
         'Tienes una petición pendiente para firmar',
         jsonb_build_object('peticion_id', NEW.id),
         false,
         NOW()
  FROM firmas_cambio_carrera f
  JOIN usuariosum u ON u.idarea = f.area_id
  WHERE f.peticion_id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para ejecutarse después de crear una petición
DROP TRIGGER IF EXISTS trigger_notificaciones_firmantes ON peticiones_cambio_carrera;
CREATE TRIGGER trigger_notificaciones_firmantes
AFTER INSERT ON peticiones_cambio_carrera
FOR EACH ROW
EXECUTE FUNCTION crear_notificaciones_firmantes();

-- Verificar que el trigger se creó correctamente
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_notificaciones_firmantes'; 