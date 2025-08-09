-- Script simple para obtener stored procedures en Supabase
-- Ejecutar en Supabase SQL Editor

-- 1. Consulta básica para obtener todos los stored procedures
SELECT 
    routine_name,
    routine_type,
    data_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_type = 'PROCEDURE'
ORDER BY routine_name;

-- 2. Consulta para obtener solo los nombres
SELECT routine_name
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_type = 'PROCEDURE'
ORDER BY routine_name;

-- 3. Consulta para obtener funciones también
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND (routine_type = 'PROCEDURE' OR routine_type = 'FUNCTION')
ORDER BY routine_type, routine_name;

-- 4. Consulta para obtener triggers
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY trigger_name; 