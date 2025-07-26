-- Script para deshabilitar temporalmente RLS en peticiones_cambio_carrera
-- Ejecutar en Supabase SQL Editor

-- 1. Deshabilitar RLS temporalmente para desarrollo
ALTER TABLE peticiones_cambio_carrera DISABLE ROW LEVEL SECURITY;

-- 2. Verificar que RLS está deshabilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'peticiones_cambio_carrera';

-- 3. También deshabilitar RLS en notificaciones si es necesario
ALTER TABLE notificaciones DISABLE ROW LEVEL SECURITY;

-- 4. Verificar que ambas tablas tienen RLS deshabilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('peticiones_cambio_carrera', 'notificaciones')
ORDER BY tablename; 