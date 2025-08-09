import { supabase } from '@/services/supabase/supaConf';

interface StoredProcedure {
  routine_name: string;
  routine_type: string;
  data_type: string;
  routine_definition?: string;
}

interface Trigger {
  trigger_name: string;
  event_manipulation: string;
  action_statement: string;
  action_timing: string;
}

export class ProcedureDocumentation {
  
  /**
   * Obtener todos los stored procedures
   */
  static async getStoredProcedures(): Promise<StoredProcedure[]> {
    try {
      console.log('🔍 Obteniendo stored procedures...');
      
      const { data, error } = await supabase
        .from('information_schema.routines')
        .select('routine_name, routine_type, data_type, routine_definition')
        .eq('routine_schema', 'public')
        .eq('routine_type', 'PROCEDURE')
        .order('routine_name');

      if (error) {
        console.error('Error obteniendo stored procedures:', error);
        return [];
      }

      console.log(`✅ Encontrados ${data?.length || 0} stored procedures`);
      return data || [];
      
    } catch (error) {
      console.error('Error general:', error);
      return [];
    }
  }

  /**
   * Obtener todas las funciones y procedures
   */
  static async getAllRoutines(): Promise<StoredProcedure[]> {
    try {
      console.log('🔍 Obteniendo todas las rutinas...');
      
      const { data, error } = await supabase
        .from('information_schema.routines')
        .select('routine_name, routine_type, data_type')
        .eq('routine_schema', 'public')
        .in('routine_type', ['PROCEDURE', 'FUNCTION'])
        .order('routine_type')
        .order('routine_name');

      if (error) {
        console.error('Error obteniendo rutinas:', error);
        return [];
      }

      console.log(`✅ Encontradas ${data?.length || 0} rutinas`);
      return data || [];
      
    } catch (error) {
      console.error('Error general:', error);
      return [];
    }
  }

  /**
   * Obtener todos los triggers
   */
  static async getTriggers(): Promise<Trigger[]> {
    try {
      console.log('🔍 Obteniendo triggers...');
      
      const { data, error } = await supabase
        .from('information_schema.triggers')
        .select('trigger_name, event_manipulation, action_statement, action_timing')
        .eq('trigger_schema', 'public')
        .order('trigger_name');

      if (error) {
        console.error('Error obteniendo triggers:', error);
        return [];
      }

      console.log(`✅ Encontrados ${data?.length || 0} triggers`);
      return data || [];
      
    } catch (error) {
      console.error('Error general:', error);
      return [];
    }
  }

  /**
   * Generar documentación completa
   */
  static async generateDocumentation(): Promise<string> {
    try {
      console.log('📚 Generando documentación...');
      
      const procedures = await this.getStoredProcedures();
      const routines = await this.getAllRoutines();
      const triggers = await this.getTriggers();

      let documentation = `# Documentación de Base de Datos

## 📋 Stored Procedures

`;

      if (procedures.length > 0) {
        procedures.forEach(proc => {
          documentation += `### ${proc.routine_name}

**Tipo:** ${proc.routine_type}
**Retorna:** ${proc.data_type}

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
        });
      } else {
        documentation += `No se encontraron stored procedures.

`;
      }

      documentation += `## 🔧 Funciones y Procedures

`;

      if (routines.length > 0) {
        routines.forEach(routine => {
          documentation += `- **${routine.routine_name}** (${routine.routine_type}) - Retorna: ${routine.data_type}
`;
        });
      } else {
        documentation += `No se encontraron rutinas.

`;
      }

      documentation += `## ⚡ Triggers

`;

      if (triggers.length > 0) {
        triggers.forEach(trigger => {
          documentation += `### ${trigger.trigger_name}

**Evento:** ${trigger.event_manipulation}
**Timing:** ${trigger.action_timing}
**Acción:** ${trigger.action_statement}

---
`;
        });
      } else {
        documentation += `No se encontraron triggers.

`;
      }

      documentation += `
## 📊 Resumen

- **Stored Procedures:** ${procedures.length}
- **Funciones:** ${routines.filter(r => r.routine_type === 'FUNCTION').length}
- **Triggers:** ${triggers.length}

---
*Documentación generada automáticamente*
`;

      return documentation;
      
    } catch (error) {
      console.error('Error generando documentación:', error);
      return 'Error generando documentación';
    }
  }

  /**
   * Mostrar resumen en consola
   */
  static async showSummary(): Promise<void> {
    try {
      const procedures = await this.getStoredProcedures();
      const routines = await this.getAllRoutines();
      const triggers = await this.getTriggers();

      console.log('\n📊 RESUMEN DE BASE DE DATOS');
      console.log('============================');
      console.log(`📋 Stored Procedures: ${procedures.length}`);
      console.log(`🔧 Funciones: ${routines.filter(r => r.routine_type === 'FUNCTION').length}`);
      console.log(`⚡ Triggers: ${triggers.length}`);
      
      if (procedures.length > 0) {
        console.log('\n📋 Stored Procedures encontrados:');
        procedures.forEach(proc => {
          console.log(`  - ${proc.routine_name}`);
        });
      }

      if (triggers.length > 0) {
        console.log('\n⚡ Triggers encontrados:');
        triggers.forEach(trigger => {
          console.log(`  - ${trigger.trigger_name}`);
        });
      }

    } catch (error) {
      console.error('Error mostrando resumen:', error);
    }
  }
}

// Función de ejemplo para usar
export async function getProceduresForDocumentation() {
  console.log('🚀 Iniciando consulta de stored procedures...\n');
  
  // Mostrar resumen
  await ProcedureDocumentation.showSummary();
  
  // Generar documentación
  const docs = await ProcedureDocumentation.generateDocumentation();
  
  console.log('\n📄 Documentación generada:');
  console.log(docs);
  
  return docs;
} 