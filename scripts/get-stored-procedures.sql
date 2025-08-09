-- Script para obtener todos los stored procedures de la base de datos
-- Ejecutar en Supabase SQL Editor o en tu cliente PostgreSQL

-- 1. Obtener todos los stored procedures
SELECT 
    p.proname AS procedure_name,
    pg_get_function_arguments(p.oid) AS arguments,
    pg_get_function_result(p.oid) AS return_type,
    l.lanname AS language,
    p.prosrc AS source_code,
    obj_description(p.oid) AS description
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
JOIN pg_language l ON p.prolang = l.oid
WHERE n.nspname = 'public'
  AND p.prokind = 'f'  -- funciones (incluye stored procedures)
ORDER BY p.proname;

-- 2. Obtener solo los nombres de los stored procedures
SELECT DISTINCT
    p.proname AS procedure_name,
    n.nspname AS schema_name
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.prokind = 'f'
ORDER BY p.proname;

-- 3. Obtener información detallada de un stored procedure específico
-- Reemplaza 'nombre_del_procedure' con el nombre real
SELECT 
    p.proname AS procedure_name,
    pg_get_function_arguments(p.oid) AS arguments,
    pg_get_function_result(p.oid) AS return_type,
    l.lanname AS language,
    p.prosrc AS source_code
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
JOIN pg_language l ON p.prolang = l.oid
WHERE n.nspname = 'public'
  AND p.proname = 'nombre_del_procedure';

-- 4. Obtener triggers que pueden estar relacionados con stored procedures
SELECT 
    t.tgname AS trigger_name,
    p.proname AS function_name,
    c.relname AS table_name,
    t.tgtype AS trigger_type
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY c.relname, t.tgname; 