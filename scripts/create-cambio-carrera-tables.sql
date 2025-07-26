-- Script para crear tablas de cambio de carrera
-- Ejecutar en Supabase SQL Editor

-- 1. Tabla de peticiones de cambio de carrera
CREATE TABLE IF NOT EXISTS peticiones_cambio_carrera (
  id SERIAL PRIMARY KEY,
  alumno_id INTEGER REFERENCES alumnos(id) ON DELETE CASCADE,
  asesor_id INTEGER REFERENCES usuariosum(idusuario),
  carrera_actual_id INTEGER REFERENCES carreras(id),
  carrera_nueva_id INTEGER REFERENCES carreras(id),
  ciclo_actual_id INTEGER REFERENCES ciclos(id),
  ciclo_nuevo_id INTEGER REFERENCES ciclos(id),
  grupo_actual VARCHAR(10),
  grupo_nuevo VARCHAR(10),
  motivo TEXT,
  estado VARCHAR(20) DEFAULT 'pendiente', -- 'pendiente', 'aprobada', 'rechazada'
  fecha_solicitud TIMESTAMP DEFAULT NOW(),
  fecha_resolucion TIMESTAMP,
  jefe_aprobador_id INTEGER REFERENCES usuariosum(idusuario),
  contraseña_aprobador VARCHAR(255),
  comentarios TEXT
);

-- 2. Tabla de notificaciones
CREATE TABLE IF NOT EXISTS notificaciones (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuariosum(idusuario) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL, -- 'cambio_carrera', 'general', etc.
  titulo VARCHAR(100) NOT NULL,
  mensaje TEXT NOT NULL,
  leida BOOLEAN DEFAULT FALSE,
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  datos_adicionales JSONB -- Para almacenar datos específicos como peticion_id
);

-- 3. Políticas RLS para peticiones_cambio_carrera
ALTER TABLE peticiones_cambio_carrera ENABLE ROW LEVEL SECURITY;

-- Política para que los asesores vean sus propias peticiones
CREATE POLICY "Asesores ven sus peticiones" ON peticiones_cambio_carrera
  FOR SELECT USING (
    asesor_id = (SELECT idusuario FROM usuariosum WHERE correoinstitucional = auth.jwt() ->> 'email')
  );

-- Política para que los jefes de ventas vean todas las peticiones
CREATE POLICY "Jefes ven todas las peticiones" ON peticiones_cambio_carrera
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuariosum u 
      JOIN areas a ON u.idarea = a.idarea 
      WHERE u.correoinstitucional = auth.jwt() ->> 'email' 
      AND a.rolarea = 'jefe de ventas'
    )
  );

-- Política para que los asesores puedan crear peticiones
CREATE POLICY "Asesores pueden crear peticiones" ON peticiones_cambio_carrera
  FOR INSERT WITH CHECK (
    asesor_id = (SELECT idusuario FROM usuariosum WHERE correoinstitucional = auth.jwt() ->> 'email')
  );

-- Política para que los jefes puedan actualizar peticiones
CREATE POLICY "Jefes pueden actualizar peticiones" ON peticiones_cambio_carrera
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM usuariosum u 
      JOIN areas a ON u.idarea = a.idarea 
      WHERE u.correoinstitucional = auth.jwt() ->> 'email' 
      AND a.rolarea = 'jefe de ventas'
    )
  );

-- 4. Políticas RLS para notificaciones
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios vean sus propias notificaciones
CREATE POLICY "Usuarios ven sus notificaciones" ON notificaciones
  FOR ALL USING (
    usuario_id = (SELECT idusuario FROM usuariosum WHERE correoinstitucional = auth.jwt() ->> 'email')
  );

-- 5. Función para crear notificación automática cuando se crea una petición
CREATE OR REPLACE FUNCTION crear_notificacion_cambio_carrera()
RETURNS TRIGGER AS $$
BEGIN
  -- Crear notificación para el jefe de ventas
  INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje, datos_adicionales)
  SELECT 
    u.idusuario,
    'cambio_carrera',
    'Nueva petición de cambio de carrera',
    'El asesor ' || (SELECT nombreusuario || ' ' || apellido FROM usuariosum WHERE idusuario = NEW.asesor_id) || 
    ' ha solicitado un cambio de carrera para el alumno ' || 
    (SELECT nombre || ' ' || apellidos FROM alumnos WHERE id = NEW.alumno_id),
    jsonb_build_object('peticion_id', NEW.id, 'alumno_id', NEW.alumno_id)
  FROM usuariosum u
  JOIN areas a ON u.idarea = a.idarea
  WHERE a.rolarea = 'jefe de ventas';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Trigger para crear notificación automática
CREATE TRIGGER trigger_notificacion_cambio_carrera
  AFTER INSERT ON peticiones_cambio_carrera
  FOR EACH ROW
  EXECUTE FUNCTION crear_notificacion_cambio_carrera();

-- 7. Función para procesar cambio de carrera cuando se aprueba
CREATE OR REPLACE FUNCTION procesar_cambio_carrera(peticion_id INTEGER, jefe_id INTEGER, contraseña_jefe TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  peticion RECORD;
  alumno_record RECORD;
BEGIN
  -- Obtener la petición
  SELECT * INTO peticion FROM peticiones_cambio_carrera WHERE id = peticion_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Petición no encontrada';
  END IF;
  
  -- Verificar que el jefe existe y su contraseña
  IF NOT EXISTS (
    SELECT 1 FROM usuariosum 
    WHERE idusuario = jefe_id 
    AND password = contraseña_jefe
    AND idusuario IN (
      SELECT u.idusuario FROM usuariosum u 
      JOIN areas a ON u.idarea = a.idarea 
      WHERE a.rolarea = 'jefe de ventas'
    )
  ) THEN
    RAISE EXCEPTION 'Credenciales de jefe inválidas';
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
    fecha_resolucion = NOW(),
    jefe_aprobador_id = jefe_id,
    contraseña_aprobador = contraseña_jefe
  WHERE id = peticion_id;
  
  -- Crear notificación para el asesor
  INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje, datos_adicionales)
  VALUES (
    peticion.asesor_id,
    'cambio_carrera_aprobado',
    'Cambio de carrera aprobado',
    'Su petición de cambio de carrera para el alumno ' || 
    (SELECT nombre || ' ' || apellidos FROM alumnos WHERE id = peticion.alumno_id) || 
    ' ha sido aprobada.',
    jsonb_build_object('peticion_id', peticion_id, 'alumno_id', peticion.alumno_id)
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 8. Función para rechazar cambio de carrera
CREATE OR REPLACE FUNCTION rechazar_cambio_carrera(peticion_id INTEGER, jefe_id INTEGER, contraseña_jefe TEXT, comentarios TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  peticion RECORD;
BEGIN
  -- Obtener la petición
  SELECT * INTO peticion FROM peticiones_cambio_carrera WHERE id = peticion_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Petición no encontrada';
  END IF;
  
  -- Verificar que el jefe existe y su contraseña
  IF NOT EXISTS (
    SELECT 1 FROM usuariosum 
    WHERE idusuario = jefe_id 
    AND password = contraseña_jefe
    AND idusuario IN (
      SELECT u.idusuario FROM usuariosum u 
      JOIN areas a ON u.idarea = a.idarea 
      WHERE a.rolarea = 'jefe de ventas'
    )
  ) THEN
    RAISE EXCEPTION 'Credenciales de jefe inválidas';
  END IF;
  
  -- Actualizar la petición como rechazada
  UPDATE peticiones_cambio_carrera 
  SET 
    estado = 'rechazada',
    fecha_resolucion = NOW(),
    jefe_aprobador_id = jefe_id,
    contraseña_aprobador = contraseña_jefe,
    comentarios = COALESCE(comentarios, 'Rechazado por el jefe de ventas')
  WHERE id = peticion_id;
  
  -- Crear notificación para el asesor
  INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje, datos_adicionales)
  VALUES (
    peticion.asesor_id,
    'cambio_carrera_rechazado',
    'Cambio de carrera rechazado',
    'Su petición de cambio de carrera para el alumno ' || 
    (SELECT nombre || ' ' || apellidos FROM alumnos WHERE id = peticion.alumno_id) || 
    ' ha sido rechazada. Comentarios: ' || COALESCE(comentarios, 'Sin comentarios'),
    jsonb_build_object('peticion_id', peticion_id, 'alumno_id', peticion.alumno_id)
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 9. Índices para mejorar rendimiento
CREATE INDEX idx_peticiones_asesor ON peticiones_cambio_carrera(asesor_id);
CREATE INDEX idx_peticiones_estado ON peticiones_cambio_carrera(estado);
CREATE INDEX idx_notificaciones_usuario ON notificaciones(usuario_id, leida);
CREATE INDEX idx_notificaciones_tipo ON notificaciones(tipo);

-- 10. Datos de ejemplo (opcional)
-- INSERT INTO carreras (nombre, duracion_anios) VALUES 
--   ('Ingeniería en Sistemas', 4),
--   ('Administración de Empresas', 4),
--   ('Contaduría Pública', 4),
--   ('Mercadotecnia', 4);

-- INSERT INTO ciclos (nombre, fecha_inicio, fecha_fin, carrera_id) VALUES 
--   ('Primer Semestre 2024', '2024-01-15', '2024-06-15', 1),
--   ('Segundo Semestre 2024', '2024-08-15', '2024-12-15', 1); 