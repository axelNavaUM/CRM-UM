-- Script para corregir las políticas RLS de peticiones_cambio_carrera
-- Ejecutar en Supabase SQL Editor

-- 1. Eliminar políticas existentes que están causando problemas
DROP POLICY IF EXISTS "Asesores pueden crear peticiones" ON peticiones_cambio_carrera;
DROP POLICY IF EXISTS "Asesores ven sus peticiones" ON peticiones_cambio_carrera;
DROP POLICY IF EXISTS "Jefes ven todas las peticiones" ON peticiones_cambio_carrera;
DROP POLICY IF EXISTS "Jefes pueden actualizar peticiones" ON peticiones_cambio_carrera;

-- 2. Crear políticas más permisivas para desarrollo
-- Política para permitir todas las operaciones a usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden crear peticiones" ON peticiones_cambio_carrera
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuariosum 
      WHERE correoinstitucional = auth.jwt() ->> 'email'
    )
  );

-- Política para que los usuarios vean sus propias peticiones
CREATE POLICY "Usuarios ven sus peticiones" ON peticiones_cambio_carrera
  FOR SELECT USING (
    asesor_id = (
      SELECT idusuario FROM usuariosum 
      WHERE correoinstitucional = auth.jwt() ->> 'email'
    )
  );

-- Política para que los jefes de ventas vean todas las peticiones
CREATE POLICY "Jefes ven todas las peticiones" ON peticiones_cambio_carrera
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM usuariosum u 
      JOIN areas a ON u.idarea = a.idarea 
      WHERE u.correoinstitucional = auth.jwt() ->> 'email' 
      AND a.rolarea = 'jefe de ventas'
    )
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

-- 3. Política temporal para superSU (usuarios sin área)
CREATE POLICY "SuperSU acceso total" ON peticiones_cambio_carrera
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuariosum 
      WHERE correoinstitucional = auth.jwt() ->> 'email'
      AND idarea IS NULL
    )
  );

-- 4. Verificar que las políticas se crearon correctamente
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'peticiones_cambio_carrera'
ORDER BY policyname; 