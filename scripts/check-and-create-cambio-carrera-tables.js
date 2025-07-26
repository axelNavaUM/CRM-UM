const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  'https://nfnhfkmpvvgsdoekyxgm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mbmhma21wdnZnc2Rva2V5eGdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzI5NzQsImV4cCI6MjA1MDU0ODk3NH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8'
);

async function checkAndCreateTables() {
  console.log('🔍 Verificando tablas de cambio de carrera...');

  try {
    // Verificar si la tabla peticiones_cambio_carrera existe
    const { data: peticionesExists, error: peticionesError } = await supabase
      .from('peticiones_cambio_carrera')
      .select('id')
      .limit(1);

    if (peticionesError && peticionesError.code === 'PGRST116') {
      console.log('✅ Tabla peticiones_cambio_carrera existe');
    } else if (peticionesError && peticionesError.code === '42P01') {
      console.log('❌ Tabla peticiones_cambio_carrera NO existe');
      console.log('📝 Creando tabla peticiones_cambio_carrera...');
      
      // Crear tabla peticiones_cambio_carrera
      const { error: createPeticionesError } = await supabase.rpc('exec_sql', {
        sql: `
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
            estado VARCHAR(20) DEFAULT 'pendiente',
            fecha_solicitud TIMESTAMP DEFAULT NOW(),
            fecha_resolucion TIMESTAMP,
            jefe_aprobador_id INTEGER REFERENCES usuariosum(idusuario),
            contraseña_aprobador VARCHAR(255),
            comentarios TEXT
          );
        `
      });

      if (createPeticionesError) {
        console.error('❌ Error al crear tabla peticiones_cambio_carrera:', createPeticionesError);
      } else {
        console.log('✅ Tabla peticiones_cambio_carrera creada exitosamente');
      }
    }

    // Verificar si la tabla notificaciones existe
    const { data: notificacionesExists, error: notificacionesError } = await supabase
      .from('notificaciones')
      .select('id')
      .limit(1);

    if (notificacionesError && notificacionesError.code === 'PGRST116') {
      console.log('✅ Tabla notificaciones existe');
    } else if (notificacionesError && notificacionesError.code === '42P01') {
      console.log('❌ Tabla notificaciones NO existe');
      console.log('📝 Creando tabla notificaciones...');
      
      // Crear tabla notificaciones
      const { error: createNotificacionesError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS notificaciones (
            id SERIAL PRIMARY KEY,
            usuario_id INTEGER REFERENCES usuariosum(idusuario) ON DELETE CASCADE,
            tipo VARCHAR(50) NOT NULL,
            titulo VARCHAR(100) NOT NULL,
            mensaje TEXT NOT NULL,
            leida BOOLEAN DEFAULT FALSE,
            fecha_creacion TIMESTAMP DEFAULT NOW(),
            datos_adicionales JSONB
          );
        `
      });

      if (createNotificacionesError) {
        console.error('❌ Error al crear tabla notificaciones:', createNotificacionesError);
      } else {
        console.log('✅ Tabla notificaciones creada exitosamente');
      }
    }

    // Verificar si las funciones existen
    console.log('🔍 Verificando funciones...');
    
    // Crear función para crear notificación automática
    const { error: createFunctionError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION crear_notificacion_cambio_carrera()
        RETURNS TRIGGER AS $$
        BEGIN
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
      `
    });

    if (createFunctionError) {
      console.error('❌ Error al crear función crear_notificacion_cambio_carrera:', createFunctionError);
    } else {
      console.log('✅ Función crear_notificacion_cambio_carrera creada/actualizada');
    }

    // Crear trigger
    const { error: createTriggerError } = await supabase.rpc('exec_sql', {
      sql: `
        DROP TRIGGER IF EXISTS trigger_notificacion_cambio_carrera ON peticiones_cambio_carrera;
        CREATE TRIGGER trigger_notificacion_cambio_carrera
          AFTER INSERT ON peticiones_cambio_carrera
          FOR EACH ROW
          EXECUTE FUNCTION crear_notificacion_cambio_carrera();
      `
    });

    if (createTriggerError) {
      console.error('❌ Error al crear trigger:', createTriggerError);
    } else {
      console.log('✅ Trigger trigger_notificacion_cambio_carrera creado');
    }

    // Crear función para procesar cambio de carrera
    const { error: createProcesarError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION procesar_cambio_carrera(peticion_id INTEGER, jefe_id INTEGER, contraseña_jefe TEXT)
        RETURNS BOOLEAN AS $$
        DECLARE
          peticion RECORD;
        BEGIN
          SELECT * INTO peticion FROM peticiones_cambio_carrera WHERE id = peticion_id;
          IF NOT FOUND THEN
            RAISE EXCEPTION 'Petición no encontrada';
          END IF;
          
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
          
          UPDATE alumnos 
          SET 
            carrera_id = peticion.carrera_nueva_id,
            ciclo_id = peticion.ciclo_nuevo_id
          WHERE id = peticion.alumno_id;
          
          UPDATE peticiones_cambio_carrera 
          SET 
            estado = 'aprobada',
            fecha_resolucion = NOW(),
            jefe_aprobador_id = jefe_id,
            contraseña_aprobador = contraseña_jefe
          WHERE id = peticion_id;
          
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
      `
    });

    if (createProcesarError) {
      console.error('❌ Error al crear función procesar_cambio_carrera:', createProcesarError);
    } else {
      console.log('✅ Función procesar_cambio_carrera creada/actualizada');
    }

    // Crear función para rechazar cambio de carrera
    const { error: createRechazarError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION rechazar_cambio_carrera(peticion_id INTEGER, jefe_id INTEGER, contraseña_jefe TEXT, comentarios TEXT)
        RETURNS BOOLEAN AS $$
        DECLARE
          peticion RECORD;
        BEGIN
          SELECT * INTO peticion FROM peticiones_cambio_carrera WHERE id = peticion_id;
          IF NOT FOUND THEN
            RAISE EXCEPTION 'Petición no encontrada';
          END IF;
          
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
          
          UPDATE peticiones_cambio_carrera 
          SET 
            estado = 'rechazada',
            fecha_resolucion = NOW(),
            jefe_aprobador_id = jefe_id,
            contraseña_aprobador = contraseña_jefe,
            comentarios = COALESCE(comentarios, 'Rechazado por el jefe de ventas')
          WHERE id = peticion_id;
          
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
      `
    });

    if (createRechazarError) {
      console.error('❌ Error al crear función rechazar_cambio_carrera:', createRechazarError);
    } else {
      console.log('✅ Función rechazar_cambio_carrera creada/actualizada');
    }

    console.log('🎉 Verificación completada!');

  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
  }
}

checkAndCreateTables(); 