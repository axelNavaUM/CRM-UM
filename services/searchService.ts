import { supabase } from './supabase/supaConf';

export interface SearchResult {
  id: string;
  type: 'alumno' | 'usuario' | 'configuracion' | 'alta';
  title: string;
  subtitle: string;
  icon: string;
  route?: string;
  data?: any;
}

export class SearchService {
  /**
   * Búsqueda global que incluye alumnos, usuarios UM, configuraciones y altas
   */
  static async globalSearch(query: string): Promise<SearchResult[]> {
    try {
      console.log('🔍 SearchService: Starting global search for:', query);
      const results: SearchResult[] = [];
      const searchTerm = query.toLowerCase().trim();

      // Búsqueda de alumnos por matrícula, nombre o apellido
      const { data: alumnos, error: alumnosError } = await supabase
        .from('alumnos')
        .select(`
          id,
          nombre,
          apellidos,
          matricula,
          email,
          carrera_id,
          ciclo_id,
          carreras(nombre)
        `)
        .or(`matricula.ilike.%${searchTerm}%,nombre.ilike.%${searchTerm}%,apellidos.ilike.%${searchTerm}%`)
        .limit(10);

      if (!alumnosError && alumnos) {
        console.log('🔍 SearchService: Found', alumnos.length, 'alumnos');
        alumnos.forEach((alumno: any) => {
          const carreraNombre = Array.isArray(alumno.carreras) && alumno.carreras.length > 0 
            ? alumno.carreras[0].nombre 
            : 'Carrera no especificada';
          
          const result: SearchResult = {
            id: `alumno_${alumno.id}`,
            type: 'alumno' as const,
            title: `${alumno.nombre} ${alumno.apellidos}`,
            subtitle: `Matrícula: ${alumno.matricula} - ${carreraNombre}`,
            icon: 'account',
            route: `/alumno/${alumno.id}`,
            data: {
              id: alumno.id,
              nombre: alumno.nombre,
              apellidos: alumno.apellidos,
              matricula: alumno.matricula,
              email: alumno.email,
              carrera_id: alumno.carrera_id,
              ciclo_id: alumno.ciclo_id,
              carrera: carreraNombre,
              ...alumno
            },
          };
          
          console.log('🔍 SearchService: Created alumno result:', result);
          results.push(result);
        });
      }

      // Búsqueda de usuarios UM (usuariosum)
      console.log('🔍 SearchService: Searching usuariosum table with term:', searchTerm);
      
      const { data: usuariosUM, error: usuariosUMError } = await supabase
        .from('usuariosum')
        .select(`
          idusuario,
          nombreusuario,
          apellido,
          correoinstitucional,
          rolarea
        `)
        .or(`nombreusuario.ilike.%${searchTerm}%,apellido.ilike.%${searchTerm}%,correoinstitucional.ilike.%${searchTerm}%`)
        .limit(10);

      console.log('🔍 SearchService: UsuariosUM search result:', { usuariosUM, error: usuariosUMError });

      if (!usuariosUMError && usuariosUM) {
        console.log('🔍 SearchService: Found', usuariosUM.length, 'usuarios UM');
        usuariosUM.forEach((usuario) => {
          const result: SearchResult = {
            id: `usuario_${usuario.idusuario}`,
            type: 'usuario' as const,
            title: `${usuario.nombreusuario} ${usuario.apellido}`,
            subtitle: `Usuario UM - ${usuario.rolarea || 'Sin rol'} - ${usuario.correoinstitucional}`,
            icon: 'account-cog',
            route: `/configuracion/usuario/${usuario.idusuario}`,
            data: usuario,
          };
          
          console.log('🔍 SearchService: Created usuario result:', result);
          results.push(result);
        });
      }

      // Búsqueda de áreas (para configuraciones)
      const { data: areas, error: areasError } = await supabase
        .from('areas')
        .select('*')
        .ilike('nombre', `%${searchTerm}%`)
        .limit(5);

      if (!areasError && areas) {
        areas.forEach((area) => {
          results.push({
            id: `area_${area.id}`,
            type: 'configuracion',
            title: area.nombre,
            subtitle: `Área - ${area.descripcion || 'Sin descripción'}`,
            icon: 'domain',
            route: `/configuracion/area/${area.id}`,
            data: area,
          });
        });
      }

      console.log('🔍 SearchService: Total results found:', results.length);
      return results;
    } catch (error) {
      console.error('🔍 SearchService: Error in global search:', error);
      return [];
    }
  }

  /**
   * Búsqueda específica de alumnos
   */
  static async searchAlumnos(query: string): Promise<SearchResult[]> {
    try {
      console.log('🔍 SearchService: Searching alumnos for:', query);
      const searchTerm = query.toLowerCase().trim();

      const { data: alumnos, error } = await supabase
        .from('alumnos')
        .select(`
          id,
          nombre,
          apellidos,
          matricula,
          email,
          carreras(nombre)
        `)
        .or(`matricula.ilike.%${searchTerm}%,nombre.ilike.%${searchTerm}%,apellidos.ilike.%${searchTerm}%`)
        .limit(20);

      if (error) {
        console.error('Error buscando alumnos:', error);
        return [];
      }

      console.log('🔍 SearchService: Found', alumnos?.length || 0, 'alumnos');

      return alumnos?.map((alumno: any) => {
        const carreraNombre = Array.isArray(alumno.carreras) && alumno.carreras.length > 0 
          ? alumno.carreras[0].nombre 
          : 'Carrera no especificada';
        
        return {
          id: `alumno_${alumno.id}`,
          type: 'alumno',
          title: `${alumno.nombre} ${alumno.apellidos}`,
          subtitle: `Matrícula: ${alumno.matricula} - ${carreraNombre}`,
          icon: 'account',
          route: `/alumno/${alumno.id}`,
          data: alumno,
        };
      }) || [];
    } catch (error) {
      console.error('Error en búsqueda de alumnos:', error);
      return [];
    }
  }

  /**
   * Búsqueda específica de usuarios UM
   */
  static async searchUsuariosUM(query: string): Promise<SearchResult[]> {
    try {
      console.log('🔍 SearchService: Searching usuarios UM for:', query);
      const searchTerm = query.toLowerCase().trim();

      const { data: usuarios, error } = await supabase
        .from('usuariosum')
        .select(`
          idusuario,
          nombreusuario,
          apellido,
          correoinstitucional,
          rolarea
        `)
        .or(`nombreusuario.ilike.%${searchTerm}%,apellido.ilike.%${searchTerm}%,correoinstitucional.ilike.%${searchTerm}%`)
        .limit(20);

      if (error) {
        console.error('Error buscando usuarios UM:', error);
        return [];
      }

      console.log('🔍 SearchService: Found', usuarios?.length || 0, 'usuarios UM');

      return usuarios?.map((usuario: any) => {
        return {
          id: `usuario_${usuario.idusuario}`,
          type: 'usuario',
          title: `${usuario.nombreusuario} ${usuario.apellido}`,
          subtitle: `Usuario UM - ${usuario.rolarea || 'Sin rol'} - ${usuario.correoinstitucional}`,
          icon: 'account',
          route: `/configuracion/usuario/${usuario.idusuario}`,
          data: usuario,
        };
      }) || [];
    } catch (error) {
      console.error('Error en búsqueda de usuarios UM:', error);
      return [];
    }
  }

  /**
   * Búsqueda de alumnos por matrícula específica
   */
  static async searchAlumnosByMatricula(matricula: string): Promise<SearchResult[]> {
    try {
      console.log('🔍 SearchService: Searching alumno by matricula:', matricula);
      
      const { data: alumnos, error } = await supabase
        .from('alumnos')
        .select(`
          id,
          nombre,
          apellidos,
          matricula,
          email,
          carreras(nombre)
        `)
        .eq('matricula', matricula)
        .limit(10);

      if (error) {
        console.error('Error buscando alumnos por matrícula:', error);
        return [];
      }

      return alumnos?.map((alumno: any) => {
        const carreraNombre = Array.isArray(alumno.carreras) && alumno.carreras.length > 0 
          ? alumno.carreras[0].nombre 
          : 'Carrera no especificada';
        
        return {
          id: `alumno_${alumno.id}`,
          type: 'alumno',
          title: `${alumno.nombre} ${alumno.apellidos}`,
          subtitle: `Matrícula: ${alumno.matricula} - ${carreraNombre}`,
          icon: 'account',
          route: `/alumno/${alumno.id}`,
          data: alumno,
        };
      }) || [];
    } catch (error) {
      console.error('Error en búsqueda de alumnos por matrícula:', error);
      return [];
    }
  }

  /**
   * Búsqueda de configuraciones del sistema
   */
  static async searchConfiguraciones(query: string): Promise<SearchResult[]> {
    try {
      const results: SearchResult[] = [];
      const searchTerm = query.toLowerCase().trim();

      // Búsqueda de usuarios UM
      const { data: usuarios, error: usuariosError } = await supabase
        .from('usuariosum')
        .select(`
          idusuario,
          nombreusuario,
          apellido,
          correoinstitucional,
          rolarea
        `)
        .or(`nombreusuario.ilike.%${searchTerm}%,apellido.ilike.%${searchTerm}%`)
        .limit(5);

      if (!usuariosError && usuarios) {
        usuarios.forEach((usuario) => {
          results.push({
            id: `usuario_${usuario.idusuario}`,
            type: 'usuario',
            title: `${usuario.nombreusuario} ${usuario.apellido}`,
            subtitle: `Usuario UM - ${usuario.rolarea || 'Sin rol'}`,
            icon: 'account-cog',
            route: `/configuracion/usuario/${usuario.idusuario}`,
            data: usuario,
          });
        });
      }

      // Búsqueda de áreas
      const { data: areas, error: areasError } = await supabase
        .from('areas')
        .select('*')
        .ilike('nombre', `%${searchTerm}%`)
        .limit(5);

      if (!areasError && areas) {
        areas.forEach((area) => {
          results.push({
            id: `area_${area.id}`,
            type: 'configuracion',
            title: area.nombre,
            subtitle: `Área - ${area.descripcion || 'Sin descripción'}`,
            icon: 'domain',
            route: `/configuracion/area/${area.id}`,
            data: area,
          });
        });
      }

      return results;
    } catch (error) {
      console.error('Error en búsqueda de configuraciones:', error);
      return [];
    }
  }

  /**
   * Obtener sugerencias de búsqueda
   */
  static async getSearchSuggestions(query: string): Promise<string[]> {
    try {
      const suggestions: string[] = [];
      const searchTerm = query.toLowerCase().trim();

      // Sugerencias de matrículas
      const { data: matriculas } = await supabase
        .from('alumnos')
        .select('matricula')
        .ilike('matricula', `%${searchTerm}%`)
        .limit(5);

      if (matriculas) {
        matriculas.forEach((alumno: any) => {
          suggestions.push(`Matrícula: ${alumno.matricula}`);
        });
      }

      // Sugerencias de nombres de usuarios
      const { data: usuarios } = await supabase
        .from('usuariosum')
        .select('nombreusuario, apellido')
        .or(`nombreusuario.ilike.%${searchTerm}%,apellido.ilike.%${searchTerm}%`)
        .limit(5);

      if (usuarios) {
        usuarios.forEach((usuario: any) => {
          suggestions.push(`${usuario.nombreusuario} ${usuario.apellido}`);
        });
      }

      return suggestions;
    } catch (error) {
      console.error('Error obteniendo sugerencias:', error);
      return [];
    }
  }
} 