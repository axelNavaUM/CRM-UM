const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://nfnhfkmpvvgsdoekyxgm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mbmhma21wdnZnc2RvZWt5eGdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3OTM3MDMsImV4cCI6MjA2NTM2OTcwM30.w_aBmKhwgOd3lss35Xm8-7cVzsHfdwzNEtiYs6dIDp8'
);

async function createTables() {
  try {
    console.log('🚀 Creando tablas en Supabase...');

    // 1. Crear tabla carreras
    console.log('📚 Creando tabla carreras...');
    const { error: carrerasError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS carreras (
          id SERIAL PRIMARY KEY,
          nombre VARCHAR(100) NOT NULL,
          duracion_anios INT NOT NULL
        );
      `
    });
    if (carrerasError) console.log('Error en carreras:', carrerasError);

    // 2. Crear tabla ciclos
    console.log('📅 Creando tabla ciclos...');
    const { error: ciclosError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS ciclos (
          id SERIAL PRIMARY KEY,
          nombre VARCHAR(50) NOT NULL,
          fecha_inicio DATE NOT NULL,
          fecha_fin DATE NOT NULL,
          carrera_id INT REFERENCES carreras(id)
        );
      `
    });
    if (ciclosError) console.log('Error en ciclos:', ciclosError);

    // 3. Crear tabla alumnos
    console.log('👨‍🎓 Creando tabla alumnos...');
    const { error: alumnosError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS alumnos (
          id SERIAL PRIMARY KEY,
          nombre VARCHAR(100) NOT NULL,
          apellidos VARCHAR(100) NOT NULL,
          email VARCHAR(100) NOT NULL,
          telefono VARCHAR(20),
          carrera_id INT REFERENCES carreras(id),
          ciclo_id INT REFERENCES ciclos(id),
          status VARCHAR(50) DEFAULT 'pendiente',
          fecha_alta TIMESTAMP DEFAULT NOW(),
          asesor_id INT
        );
      `
    });
    if (alumnosError) console.log('Error en alumnos:', alumnosError);

    // 4. Crear tabla documentos_alumno
    console.log('📄 Creando tabla documentos_alumno...');
    const { error: documentosError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS documentos_alumno (
          id SERIAL PRIMARY KEY,
          alumno_id INT REFERENCES alumnos(id),
          tipo_documento VARCHAR(50) NOT NULL,
          url_archivo TEXT NOT NULL,
          fecha_subida TIMESTAMP DEFAULT NOW()
        );
      `
    });
    if (documentosError) console.log('Error en documentos:', documentosError);

    // 5. Crear tabla pagos
    console.log('💰 Creando tabla pagos...');
    const { error: pagosError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS pagos (
          id SERIAL PRIMARY KEY,
          alumno_id INT REFERENCES alumnos(id),
          modo_pago VARCHAR(20) NOT NULL,
          status VARCHAR(50) DEFAULT 'pendiente',
          fecha_pago TIMESTAMP,
          pin_cajero VARCHAR(10)
        );
      `
    });
    if (pagosError) console.log('Error en pagos:', pagosError);

    console.log('✅ Tablas creadas exitosamente!');

    // 6. Insertar datos de ejemplo
    console.log('📝 Insertando datos de ejemplo...');
    
    // Insertar carreras
    const { error: insertCarrerasError } = await supabase
      .from('carreras')
      .upsert([
        { nombre: 'Ingeniería en Sistemas', duracion_anios: 4 },
        { nombre: 'Administración', duracion_anios: 3 },
        { nombre: 'Contabilidad', duracion_anios: 3 },
        { nombre: 'Derecho', duracion_anios: 4 },
        { nombre: 'Psicología', duracion_anios: 4 }
      ], { onConflict: 'nombre' });

    if (insertCarrerasError) {
      console.log('Error insertando carreras:', insertCarrerasError);
    } else {
      console.log('✅ Carreras insertadas');
    }

    // Obtener las carreras para insertar ciclos
    const { data: carreras } = await supabase.from('carreras').select('id, nombre');
    
    if (carreras) {
      // Insertar ciclos para cada carrera
      const ciclosData = carreras.map(carrera => ({
        nombre: '2025/2025-ECA-1',
        fecha_inicio: '2025-01-01',
        fecha_fin: '2025-06-30',
        carrera_id: carrera.id
      }));

      const { error: insertCiclosError } = await supabase
        .from('ciclos')
        .upsert(ciclosData, { onConflict: 'nombre,carrera_id' });

      if (insertCiclosError) {
        console.log('Error insertando ciclos:', insertCiclosError);
      } else {
        console.log('✅ Ciclos insertados');
      }
    }

    console.log('🎉 ¡Todo listo! Las tablas y datos de ejemplo han sido creados.');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createTables(); 