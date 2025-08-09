const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function getStoredProcedures() {
  try {
    console.log('🔍 Obteniendo stored procedures...\n');

    // 1. Obtener todos los stored procedures
    const { data: procedures, error: proceduresError } = await supabase
      .rpc('get_all_procedures');

    if (proceduresError) {
      console.error('Error obteniendo procedures:', proceduresError);
      
      // Fallback: consulta directa
      const { data, error } = await supabase
        .from('information_schema.routines')
        .select('routine_name, routine_type, data_type, routine_definition')
        .eq('routine_schema', 'public')
        .eq('routine_type', 'PROCEDURE');

      if (error) {
        console.error('Error en fallback:', error);
        return;
      }

      console.log('📋 Stored Procedures encontrados:');
      data.forEach(proc => {
        console.log(`- ${proc.routine_name}`);
      });

      return data;
    }

    console.log('📋 Stored Procedures encontrados:');
    procedures.forEach(proc => {
      console.log(`- ${proc.procedure_name}`);
    });

    return procedures;

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

async function getProcedureDetails(procedureName) {
  try {
    console.log(`🔍 Obteniendo detalles de: ${procedureName}`);

    const { data, error } = await supabase
      .rpc('get_procedure_details', { proc_name: procedureName });

    if (error) {
      console.error('Error obteniendo detalles:', error);
      return;
    }

    console.log('📄 Detalles del stored procedure:');
    console.log(JSON.stringify(data, null, 2));

    return data;

  } catch (error) {
    console.error('❌ Error obteniendo detalles:', error);
  }
}

async function generateDocumentation() {
  try {
    console.log('📚 Generando documentación de stored procedures...\n');

    const procedures = await getStoredProcedures();
    
    if (!procedures || procedures.length === 0) {
      console.log('No se encontraron stored procedures');
      return;
    }

    let documentation = `# Stored Procedures - Documentación

## 📋 Lista de Stored Procedures

`;

    for (const proc of procedures) {
      documentation += `### ${proc.routine_name || proc.procedure_name}

**Tipo:** ${proc.routine_type || 'PROCEDURE'}
**Retorna:** ${proc.data_type || 'void'}

`;

      if (proc.routine_definition) {
        documentation += `**Definición:**
\`\`\`sql
${proc.routine_definition}
\`\`\`

`;
      }

      documentation += `---
`;
    }

    // Guardar documentación en archivo
    const fs = require('fs');
    fs.writeFileSync('STORED_PROCEDURES_DOCS.md', documentation);
    
    console.log('✅ Documentación generada en: STORED_PROCEDURES_DOCS.md');

  } catch (error) {
    console.error('❌ Error generando documentación:', error);
  }
}

// Función principal
async function main() {
  console.log('🚀 Iniciando consulta de stored procedures...\n');

  // Obtener lista de procedures
  await getStoredProcedures();

  // Generar documentación
  await generateDocumentation();

  console.log('\n✅ Proceso completado');
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  main();
}

module.exports = {
  getStoredProcedures,
  getProcedureDetails,
  generateDocumentation
}; 