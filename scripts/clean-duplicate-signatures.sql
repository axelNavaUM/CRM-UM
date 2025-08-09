-- Script para limpiar firmas duplicadas existentes
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar firmas duplicadas existentes
SELECT 
    peticion_id,
    usuario_firmante_id,
    COUNT(*) as firmas_duplicadas
FROM firmas_cambio_carrera 
WHERE usuario_firmante_id IS NOT NULL
GROUP BY peticion_id, usuario_firmante_id
HAVING COUNT(*) > 1
ORDER BY firmas_duplicadas DESC;

-- 2. Verificar firmas duplicadas por área
SELECT 
    peticion_id,
    area_id,
    COUNT(*) as firmas_duplicadas
FROM firmas_cambio_carrera 
GROUP BY peticion_id, area_id
HAVING COUNT(*) > 1
ORDER BY firmas_duplicadas DESC;

-- 3. Limpiar firmas duplicadas por usuario (mantener la más reciente)
WITH firmas_duplicadas AS (
    SELECT 
        id,
        peticion_id,
        usuario_firmante_id,
        fecha_firma,
        ROW_NUMBER() OVER (
            PARTITION BY peticion_id, usuario_firmante_id 
            ORDER BY fecha_firma DESC, id DESC
        ) as rn
    FROM firmas_cambio_carrera 
    WHERE usuario_firmante_id IS NOT NULL
)
DELETE FROM firmas_cambio_carrera 
WHERE id IN (
    SELECT id 
    FROM firmas_duplicadas 
    WHERE rn > 1
);

-- 4. Limpiar firmas duplicadas por área (mantener la más reciente)
WITH firmas_duplicadas_area AS (
    SELECT 
        id,
        peticion_id,
        area_id,
        fecha_firma,
        ROW_NUMBER() OVER (
            PARTITION BY peticion_id, area_id 
            ORDER BY fecha_firma DESC, id DESC
        ) as rn
    FROM firmas_cambio_carrera 
)
DELETE FROM firmas_cambio_carrera 
WHERE id IN (
    SELECT id 
    FROM firmas_duplicadas_area 
    WHERE rn > 1
);

-- 5. Verificar que se limpiaron las duplicadas
SELECT 
    'Firmas duplicadas por usuario' as tipo,
    COUNT(*) as cantidad
FROM (
    SELECT peticion_id, usuario_firmante_id
    FROM firmas_cambio_carrera 
    WHERE usuario_firmante_id IS NOT NULL
    GROUP BY peticion_id, usuario_firmante_id
    HAVING COUNT(*) > 1
) as duplicadas_usuario

UNION ALL

SELECT 
    'Firmas duplicadas por área' as tipo,
    COUNT(*) as cantidad
FROM (
    SELECT peticion_id, area_id
    FROM firmas_cambio_carrera 
    GROUP BY peticion_id, area_id
    HAVING COUNT(*) > 1
) as duplicadas_area;

-- 6. Mostrar estadísticas finales
SELECT 
    'Total de firmas' as descripcion,
    COUNT(*) as cantidad
FROM firmas_cambio_carrera

UNION ALL

SELECT 
    'Firmas pendientes' as descripcion,
    COUNT(*) as cantidad
FROM firmas_cambio_carrera
WHERE estado = 'pendiente'

UNION ALL

SELECT 
    'Firmas aprobadas' as descripcion,
    COUNT(*) as cantidad
FROM firmas_cambio_carrera
WHERE estado = 'aprobada'

UNION ALL

SELECT 
    'Firmas rechazadas' as descripcion,
    COUNT(*) as cantidad
FROM firmas_cambio_carrera
WHERE estado = 'rechazada'; 