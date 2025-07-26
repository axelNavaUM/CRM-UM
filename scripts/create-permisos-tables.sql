-- Script para crear las tablas de permisos y políticas RLS
-- Ejecutar en Supabase SQL Editor

-- 1. Crear tabla de permisos
CREATE TABLE IF NOT EXISTS public.permisos (
    id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
    nombre text NOT NULL,
    descripcion text,
    tipo text NOT NULL CHECK (tipo IN ('pantalla', 'funcion', 'dato')),
    area_id bigint NOT NULL,
    activo boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT permisos_pkey PRIMARY KEY (id),
    CONSTRAINT permisos_area_id_fkey FOREIGN KEY (area_id) REFERENCES public.areas(idarea) ON DELETE CASCADE
);

-- 2. Crear tabla de políticas RLS
CREATE TABLE IF NOT EXISTS public.politicas_rls (
    id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
    nombre text NOT NULL,
    tabla text NOT NULL,
    politica text NOT NULL,
    area_id bigint NOT NULL,
    activo boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT politicas_rls_pkey PRIMARY KEY (id),
    CONSTRAINT politicas_rls_area_id_fkey FOREIGN KEY (area_id) REFERENCES public.areas(idarea) ON DELETE CASCADE
);

-- 3. Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_permisos_area_id ON public.permisos(area_id);
CREATE INDEX IF NOT EXISTS idx_permisos_activo ON public.permisos(activo);
CREATE INDEX IF NOT EXISTS idx_politicas_rls_area_id ON public.politicas_rls(area_id);
CREATE INDEX IF NOT EXISTS idx_politicas_rls_activo ON public.politicas_rls(activo);

-- 4. Habilitar RLS en las nuevas tablas
ALTER TABLE public.permisos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.politicas_rls ENABLE ROW LEVEL SECURITY;

-- 5. Crear políticas RLS básicas (temporales para desarrollo)
CREATE POLICY "Allow all operations for permisos" ON public.permisos FOR ALL USING (true);
CREATE POLICY "Allow all operations for politicas_rls" ON public.politicas_rls FOR ALL USING (true);

-- 6. Insertar algunos permisos de ejemplo
INSERT INTO public.permisos (nombre, descripcion, tipo, area_id, activo) VALUES
('Acceso a Alta Alumnos', 'Permite dar de alta nuevos alumnos', 'pantalla', 1, true),
('Búsqueda de Alumnos', 'Permite buscar alumnos en el sistema', 'funcion', 1, true),
('Editar Alumnos', 'Permite editar información de alumnos', 'dato', 1, true),
('Leer Alumnos', 'Permite ver información de alumnos', 'dato', 1, true),
('Actualizar Alumnos', 'Permite actualizar datos de alumnos', 'dato', 1, true),
('Alta de Usuarios', 'Permite crear nuevos usuarios', 'pantalla', 1, true),
('Eliminar Registros', 'Permite eliminar registros del sistema', 'funcion', 1, false),
('Insertar Datos', 'Permite insertar nuevos datos', 'funcion', 1, true),
('Seleccionar Datos', 'Permite consultar datos', 'funcion', 1, true),
('Actualizar Datos', 'Permite modificar datos existentes', 'funcion', 1, true)
ON CONFLICT DO NOTHING;

-- 7. Insertar algunas políticas RLS de ejemplo
INSERT INTO public.politicas_rls (nombre, tabla, politica, area_id, activo) VALUES
('Política Usuarios por Área', 'usuariosum', 'auth.uid() IN (SELECT auth_uid FROM usuariosum WHERE idarea = areas.idarea)', 1, true),
('Política Alumnos por Área', 'alumnos', 'asesor_id IN (SELECT idusuario FROM usuariosum WHERE idarea = areas.idarea)', 1, true)
ON CONFLICT DO NOTHING;

-- 8. Comentarios para documentación
COMMENT ON TABLE public.permisos IS 'Tabla para almacenar permisos específicos por área';
COMMENT ON TABLE public.politicas_rls IS 'Tabla para almacenar políticas RLS dinámicas por área';
COMMENT ON COLUMN public.permisos.tipo IS 'Tipo de permiso: pantalla, funcion, dato';
COMMENT ON COLUMN public.politicas_rls.politica IS 'SQL de la política RLS a aplicar'; 