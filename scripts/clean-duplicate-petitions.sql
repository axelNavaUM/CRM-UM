-- Script para limpiar peticiones duplicadas
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar peticiones duplicadas existentes
SELECT 
    alumno_id,
    carrera_actual_id,
    carrera_nueva_id,
    ciclo_actual_id,
    ciclo_nuevo_id,
    COUNT(*) as peticiones_duplicadas
FROM peticiones_cambio_carrera 
GROUP BY alumno_id, carrera_actual_id, carrera_nueva_id, ciclo_actual_id, ciclo_nuevo_id
HAVING COUNT(*) > 1
ORDER BY peticiones_duplicadas DESC;

-- 2. Mostrar detalles de las peticiones duplicadas
WITH peticiones_duplicadas AS (
    SELECT 
        alumno_id,
        carrera_actual_id,
        carrera_nueva_id,
        ciclo_actual_id,
        ciclo_nuevo_id,
        COUNT(*) as total
    FROM peticiones_cambio_carrera 
    GROUP BY alumno_id, carrera_actual_id, carrera_nueva_id, ciclo_actual_id, ciclo_nuevo_id
    HAVING COUNT(*) > 1
)
SELECT 
    p.id,
    p.alumno_id,
    p.carrera_actual_id,
    p.carrera_nueva_id,
    p.ciclo_actual_id,
    p.ciclo_nuevo_id,
    p.estado,
    p.fecha_solicitud,
    a.nombre || ' ' || a.apellidos as alumno_nombre,
    c1.nombre as carrera_actual,
    c2.nombre as carrera_nueva
FROM peticiones_cambio_carrera p
JOIN alumnos a ON p.alumno_id = a.id
JOIN carreras c1 ON p.carrera_actual_id = c1.id
JOIN carreras c2 ON p.carrera_nueva_id = c2.id
WHERE (p.alumno_id, p.carrera_actual_id, p.carrera_nueva_id, p.ciclo_actual_id, p.ciclo_nuevo_id) IN (
    SELECT alumno_id, carrera_actual_id, carrera_nueva_id, ciclo_actual_id, ciclo_nuevo_id
    FROM peticiones_duplicadas
)
ORDER BY p.alumno_id, p.fecha_solicitud DESC;

-- 3. Limpiar peticiones duplicadas (mantener la más reciente)
WITH peticiones_duplicadas AS (
    SELECT 
        id,
        alumno_id,
        carrera_actual_id,
        carrera_nueva_id,
        ciclo_actual_id,
        ciclo_nuevo_id,
        fecha_solicitud,
        ROW_NUMBER() OVER (
            PARTITION BY alumno_id, carrera_actual_id, carrera_nueva_id, ciclo_actual_id, ciclo_nuevo_id 
            ORDER BY fecha_solicitud DESC, id DESC
        ) as rn
    FROM peticiones_cambio_carrera
)
DELETE FROM peticiones_cambio_carrera 
WHERE id IN (
    SELECT id 
    FROM peticiones_duplicadas 
    WHERE rn > 1
);

-- 4. Verificar que se limpiaron las duplicadas
SELECT 
    'Peticiones duplicadas restantes' as descripcion,
    COUNT(*) as cantidad
FROM (
    SELECT alumno_id, carrera_actual_id, carrera_nueva_id, ciclo_actual_id, ciclo_nuevo_id
    FROM peticiones_cambio_carrera 
    GROUP BY alumno_id, carrera_actual_id, carrera_nueva_id, ciclo_actual_id, ciclo_nuevo_id
    HAVING COUNT(*) > 1
) as duplicadas;

-- 5. Mostrar estadísticas finales
SELECT 
    'Total de peticiones' as descripcion,
    COUNT(*) as cantidad
FROM peticiones_cambio_carrera

UNION ALL

SELECT 
    'Peticiones pendientes' as descripcion,
    COUNT(*) as cantidad
FROM peticiones_cambio_carrera
WHERE estado = 'pendiente'

UNION ALL

SELECT 
    'Peticiones aprobadas' as descripcion,
    COUNT(*) as cantidad
FROM peticiones_cambio_carrera
WHERE estado = 'aprobada'

UNION ALL

SELECT 
    'Peticiones rechazadas' as descripcion,
    COUNT(*) as cantidad
FROM peticiones_cambio_carrera
WHERE estado = 'rechazada'; 