-- Script para actualizar la estructura de áreas para el sistema de 4 firmas
-- Ejecutar en Supabase SQL Editor

-- 1. Agregar campo para indicar si el área participa en firma de cambio de carrera
ALTER TABLE areas ADD COLUMN IF NOT EXISTS participa_firma_cambio_carrera BOOLEAN DEFAULT false;

-- 2. Agregar campo para el orden de firma (opcional, para definir el orden)
ALTER TABLE areas ADD COLUMN IF NOT EXISTS orden_firma INTEGER DEFAULT 0;

-- 3. Actualizar las áreas existentes con la nueva estructura
UPDATE areas SET 
    rolarea = 'jefe de ventas',
    participa_firma_cambio_carrera = true,
    orden_firma = 1
WHERE nombrearea = 'Jefe de Ventas';

UPDATE areas SET 
    rolarea = 'asesor',
    participa_firma_cambio_carrera = false,
    orden_firma = 0
WHERE nombrearea = 'Asesor';

UPDATE areas SET 
    rolarea = 'superSu',
    participa_firma_cambio_carrera = true,
    orden_firma = 0
WHERE nombrearea = 'superSu';

UPDATE areas SET 
    rolarea = 'administrador',
    participa_firma_cambio_carrera = true,
    orden_firma = 0
WHERE nombrearea = 'Administrador';

-- 4. Insertar las nuevas áreas que participan en la firma
INSERT INTO areas (nombrearea, rolarea, permisos, participa_firma_cambio_carrera, orden_firma) VALUES
('Coordinación', 'jefe de coordinacion', 
 '{"alta_alumnos": true, "busqueda": true, "editar": true, "leer": true, "actualizar": true, "alta_usuarios": false, "delete": false, "insert": true, "select": true, "update": true}'::json,
 true, 2),
('Control Escolar', 'jefe de control', 
 '{"alta_alumnos": true, "busqueda": true, "editar": true, "leer": true, "actualizar": true, "alta_usuarios": false, "delete": false, "insert": true, "select": true, "update": true}'::json,
 true, 3),
('Caja', 'jefe de caja', 
 '{"alta_alumnos": false, "busqueda": true, "editar": false, "leer": true, "actualizar": false, "alta_usuarios": false, "delete": false, "insert": true, "select": true, "update": false}'::json,
 true, 4),
('Dirección', 'director', 
 '{"alta_alumnos": true, "busqueda": true, "editar": true, "leer": true, "actualizar": true, "alta_usuarios": true, "delete": true, "insert": true, "select": true, "update": true}'::json,
 true, 5)
ON CONFLICT (idarea) DO NOTHING;

-- 5. Verificar la estructura actualizada
SELECT 
    idarea,
    nombrearea,
    rolarea,
    participa_firma_cambio_carrera,
    orden_firma,
    permisos
FROM areas
ORDER BY orden_firma, nombrearea; 