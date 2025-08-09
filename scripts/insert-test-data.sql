-- Script para insertar datos de prueba para notificaciones
-- Ejecutar este script en Supabase para tener datos de prueba

-- Insertar alumnos de prueba
INSERT INTO alumnos (id, nombre, apellidos, matricula, email, carrera_id, created_at) VALUES
(1, 'Juan', 'Pérez García', '2024001', 'juan.perez@alumno.um.edu.mx', 1, NOW()),
(2, 'María', 'González López', '2024002', 'maria.gonzalez@alumno.um.edu.mx', 2, NOW()),
(3, 'Carlos', 'Rodríguez Martínez', '2024003', 'carlos.rodriguez@alumno.um.edu.mx', 1, NOW()),
(4, 'Ana', 'Martínez Silva', '2024004', 'ana.martinez@alumno.um.edu.mx', 3, NOW()),
(5, 'Pedro', 'Sánchez Ruiz', '2024005', 'pedro.sanchez@alumno.um.edu.mx', 2, NOW())
ON CONFLICT (id) DO NOTHING;

-- Insertar carreras de prueba si no existen
INSERT INTO carreras (id, nombre, duracion_anios) VALUES
(1, 'Ingeniería en Sistemas', 4),
(2, 'Administración', 4),
(3, 'Medicina', 6),
(4, 'Psicología', 4)
ON CONFLICT (id) DO NOTHING;

-- Insertar peticiones de cambio de carrera de prueba
INSERT INTO cambio_carrera (id, alumno_id, carrera_actual_id, carrera_solicitada_id, status, created_at) VALUES
(1, 1, 1, 3, 'pendiente', NOW()),
(2, 2, 2, 4, 'pendiente', NOW()),
(3, 3, 1, 2, 'aprobado', NOW()),
(4, 4, 3, 1, 'rechazado', NOW()),
(5, 5, 2, 1, 'pendiente', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insertar notificaciones de prueba
INSERT INTO notificaciones (id, usuario_id, tipo, titulo, mensaje, datos_adicionales, leida, created_at) VALUES
(1, 1, 'cambio_carrera', 'Nueva solicitud de cambio de carrera', 'El alumno Juan Pérez García ha solicitado un cambio de carrera de Ingeniería en Sistemas a Medicina.', '{"alumno_id": 1, "peticion_id": 1, "carrera_actual": "Ingeniería en Sistemas", "carrera_solicitada": "Medicina", "fecha_solicitud": "2024-01-15"}', false, NOW()),
(2, 1, 'cambio_carrera', 'Solicitud de cambio de carrera pendiente', 'María González López solicita cambio de Administración a Psicología.', '{"alumno_id": 2, "peticion_id": 2, "carrera_actual": "Administración", "carrera_solicitada": "Psicología", "fecha_solicitud": "2024-01-14"}', false, NOW()),
(3, 1, 'success', 'Documento aprobado', 'El documento de identificación del alumno Carlos Rodríguez ha sido aprobado exitosamente.', '{"alumno_id": 3, "documento": "INE", "fecha_aprobacion": "2024-01-13"}', true, NOW()),
(4, 1, 'warning', 'Documento rechazado', 'El certificado de estudios de Ana Martínez no cumple con los requisitos establecidos.', '{"alumno_id": 4, "documento": "Certificado de Estudios", "motivo_rechazo": "Documento ilegible"}', false, NOW()),
(5, 1, 'info', 'Nuevo registro de alumno', 'Se ha registrado exitosamente al alumno Pedro Sánchez en el sistema.', '{"alumno_id": 5, "matricula": "2024005", "fecha_registro": "2024-01-11"}', true, NOW())
ON CONFLICT (id) DO NOTHING;

-- Verificar que los datos se insertaron correctamente
SELECT 'Alumnos insertados:' as info, COUNT(*) as count FROM alumnos WHERE id IN (1,2,3,4,5)
UNION ALL
SELECT 'Carreras insertadas:', COUNT(*) FROM carreras WHERE id IN (1,2,3,4)
UNION ALL
SELECT 'Peticiones insertadas:', COUNT(*) FROM cambio_carrera WHERE id IN (1,2,3,4,5)
UNION ALL
SELECT 'Notificaciones insertadas:', COUNT(*) FROM notificaciones WHERE id IN (1,2,3,4,5); 