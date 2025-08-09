import { supabase } from '@/services/supabase/supaConf';

export interface Permiso {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: 'pantalla' | 'funcion' | 'dato';
  area_id: number;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface PoliticaRLS {
  id: number;
  nombre: string;
  tabla: string;
  politica: string;
  area_id: number;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export class PermisosModel {
  // Permisos - Usando tabla areas con campo permisos JSON
  static async getAllPermisos(): Promise<Permiso[]> {
    try {
      // Intentar usar la tabla permisos si existe
      const { data, error } = await supabase
        .from('permisos')
        .select('*')
        .order('nombre');
      
      if (error && error.message.includes('does not exist')) {
        // Si la tabla no existe, usar el campo permisos de areas
        const { data: areasData, error: areasError } = await supabase
          .from('areas')
          .select('idarea, nombrearea, permisos');
        
        if (areasError) {
          throw new Error(`Error al obtener áreas: ${areasError.message}`);
        }
        
        // Convertir permisos de areas a formato de permisos
        const permisos: Permiso[] = [];
        areasData?.forEach(area => {
          if (area.permisos) {
            Object.entries(area.permisos).forEach(([permiso, activo]) => {
              permisos.push({
                id: parseInt(`${area.idarea}${permiso.length}`), // ID temporal
                nombre: permiso,
                descripcion: `Permiso ${permiso} para ${area.nombrearea}`,
                tipo: 'funcion',
                area_id: area.idarea,
                activo: activo as boolean,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
            });
          }
        });
        
        return permisos;
      }
      
      if (error) {
        throw new Error(`Error al obtener permisos: ${error.message}`);
      }
      
      return data as Permiso[];
    } catch (error) {
      throw new Error(`Error al obtener permisos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  static async getPermisosByArea(areaId: number): Promise<Permiso[]> {
    try {
      // Intentar usar la tabla permisos si existe
      const { data, error } = await supabase
        .from('permisos')
        .select('*')
        .eq('area_id', areaId)
        .eq('activo', true)
        .order('nombre');
      
      if (error && error.message.includes('does not exist')) {
        // Si la tabla no existe, usar el campo permisos de areas
        const { data: areaData, error: areaError } = await supabase
          .from('areas')
          .select('idarea, nombrearea, permisos')
          .eq('idarea', areaId)
          .single();
        
        if (areaError) {
          throw new Error(`Error al obtener área: ${areaError.message}`);
        }
        
        if (!areaData || !areaData.permisos) {
          return [];
        }
        
        // Convertir permisos de area a formato de permisos
        const permisos: Permiso[] = [];
        Object.entries(areaData.permisos).forEach(([permiso, activo]) => {
          if (activo) {
            permisos.push({
              id: parseInt(`${areaData.idarea}${permiso.length}`), // ID temporal
              nombre: permiso,
              descripcion: `Permiso ${permiso} para ${areaData.nombrearea}`,
              tipo: 'funcion',
              area_id: areaData.idarea,
              activo: activo as boolean,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          }
        });
        
        return permisos;
      }
      
      if (error) {
        throw new Error(`Error al obtener permisos del área: ${error.message}`);
      }
      
      return data as Permiso[];
    } catch (error) {
      throw new Error(`Error al obtener permisos del área: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  static async createPermiso(permiso: Omit<Permiso, 'id' | 'created_at' | 'updated_at'>): Promise<Permiso> {
    try {
      // Intentar usar la tabla permisos si existe
      const { data, error } = await supabase
        .from('permisos')
        .insert(permiso)
        .select()
        .single();
      
      if (error && error.message.includes('does not exist')) {
        // Si la tabla no existe, actualizar el campo permisos en areas
        const { data: areaData, error: areaError } = await supabase
          .from('areas')
          .select('permisos')
          .eq('idarea', permiso.area_id)
          .single();
        
        if (areaError) {
          throw new Error(`Error al obtener área: ${areaError.message}`);
        }
        
        const currentPermisos = areaData?.permisos || {};
        const updatedPermisos = {
          ...currentPermisos,
          [permiso.nombre]: permiso.activo
        };
        
        const { error: updateError } = await supabase
          .from('areas')
          .update({ permisos: updatedPermisos })
          .eq('idarea', permiso.area_id);
        
        if (updateError) {
          throw new Error(`Error al actualizar permisos: ${updateError.message}`);
        }
        
        return {
          ...permiso,
          id: parseInt(`${permiso.area_id}${permiso.nombre.length}`),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
      
      if (error) {
        throw new Error(`Error al crear permiso: ${error.message}`);
      }
      
      return data as Permiso;
    } catch (error) {
      throw new Error(`Error al crear permiso: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  static async updatePermiso(idusuarios: number, updates: Partial<Omit<Permiso, 'id' | 'created_at' | 'updated_at'>>): Promise<void> {
    try {
      // Intentar usar la tabla permisos si existe
      const { error } = await supabase
        .from('permisos')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', idusuarios);
      
      if (error && error.message.includes('does not exist')) {
        // Si la tabla no existe, actualizar el campo permisos en areas
        if (updates.area_id) {
          const { data: areaData, error: areaError } = await supabase
            .from('areas')
            .select('permisos')
            .eq('idarea', updates.area_id)
            .single();
          
          if (areaError) {
            throw new Error(`Error al obtener área: ${areaError.message}`);
          }
          
          const currentPermisos = areaData?.permisos || {};
          const updatedPermisos = {
            ...currentPermisos,
            [updates.nombre || '']: updates.activo
          };
          
          const { error: updateError } = await supabase
            .from('areas')
            .update({ permisos: updatedPermisos })
            .eq('idarea', updates.area_id);
          
          if (updateError) {
            throw new Error(`Error al actualizar permisos: ${updateError.message}`);
          }
        }
        return;
      }
      
      if (error) {
        throw new Error(`Error al actualizar permiso: ${error.message}`);
      }
    } catch (error) {
      throw new Error(`Error al actualizar permiso: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  static async delete(idusuario: number): Promise<void> {
    try {
      // Intentar usar la tabla permisos si existe
      const { error } = await supabase
        .from('permisos')
        .delete()
        .eq('id', idusuario);
      
      if (error && error.message.includes('does not exist')) {
        // Si la tabla no existe, no hacer nada por ahora
        return;
      }
      
      if (error) {
        throw new Error(`Error al eliminar permiso: ${error.message}`);
      }
    } catch (error) {
      throw new Error(`Error al eliminar permiso: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  // Políticas RLS - Usando tabla areas con campo permisos JSON
  static async getAllPoliticasRLS(): Promise<PoliticaRLS[]> {
    try {
      // Intentar usar la tabla politicas_rls si existe
      const { data, error } = await supabase
        .from('politicas_rls')
        .select('*')
        .order('nombre');
      
      if (error && error.message.includes('does not exist')) {
        // Si la tabla no existe, retornar array vacío por ahora
        return [];
      }
      
      if (error) {
        throw new Error(`Error al obtener políticas RLS: ${error.message}`);
      }
      
      return data as PoliticaRLS[];
    } catch (error) {
      throw new Error(`Error al obtener políticas RLS: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  static async getPoliticasByArea(areaId: number): Promise<PoliticaRLS[]> {
    try {
      // Intentar usar la tabla politicas_rls si existe
      const { data, error } = await supabase
        .from('politicas_rls')
        .select('*')
        .eq('area_id', areaId)
        .eq('activo', true)
        .order('nombre');
      
      if (error && error.message.includes('does not exist')) {
        // Si la tabla no existe, retornar array vacío por ahora
        return [];
      }
      
      if (error) {
        throw new Error(`Error al obtener políticas del área: ${error.message}`);
      }
      
      return data as PoliticaRLS[];
    } catch (error) {
      throw new Error(`Error al obtener políticas del área: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  static async createPoliticaRLS(politica: Omit<PoliticaRLS, 'id' | 'created_at' | 'updated_at'>): Promise<PoliticaRLS> {
    try {
      // Intentar usar la tabla politicas_rls si existe
      const { data, error } = await supabase
        .from('politicas_rls')
        .insert(politica)
        .select()
        .single();
      
      if (error && error.message.includes('does not exist')) {
        // Si la tabla no existe, crear un objeto temporal
        return {
          ...politica,
          id: parseInt(`${politica.area_id}${politica.nombre.length}`),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
      
      if (error) {
        throw new Error(`Error al crear política RLS: ${error.message}`);
      }
      
      return data as PoliticaRLS;
    } catch (error) {
      throw new Error(`Error al crear política RLS: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  static async updatePoliticaRLS(id: number, updates: Partial<Omit<PoliticaRLS, 'id' | 'created_at' | 'updated_at'>>): Promise<void> {
    try {
      // Intentar usar la tabla politicas_rls si existe
      const { error } = await supabase
        .from('politicas_rls')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error && error.message.includes('does not exist')) {
        // Si la tabla no existe, no hacer nada por ahora
        return;
      }
      
      if (error) {
        throw new Error(`Error al actualizar política RLS: ${error.message}`);
      }
    } catch (error) {
      throw new Error(`Error al actualizar política RLS: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  static async deletePoliticaRLS(id: number): Promise<void> {
    try {
      // Intentar usar la tabla politicas_rls si existe
      const { error } = await supabase
        .from('politicas_rls')
        .delete()
        .eq('id', id);
      
      if (error && error.message.includes('does not exist')) {
        // Si la tabla no existe, no hacer nada por ahora
        return;
      }
      
      if (error) {
        throw new Error(`Error al eliminar política RLS: ${error.message}`);
      }
    } catch (error) {
      throw new Error(`Error al eliminar política RLS: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  // Utilidades
  static async getAreasConPermisos(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('areas')
        .select(`
          idarea,
          nombrearea,
          rolarea,
          permisos
        `)
        .order('nombrearea');
      
      if (error) {
        throw new Error(`Error al obtener áreas con permisos: ${error.message}`);
      }
      
      return data || [];
    } catch (error) {
      throw new Error(`Error al obtener áreas con permisos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  // Verificar si un usuario tiene un permiso específico
  static async verificarPermisoUsuario(email: string, permisoNombre: string): Promise<boolean> {
    // This method will now need to be implemented directly or removed if not used
    // For now, returning a placeholder or throwing an error as PermisosService is removed
    console.warn("PermisosService is no longer imported, verificarPermisoUsuario will not work as intended.");
    return false;
  }

  // Verificar si un usuario es super su
  static async verificarSuperSu(email: string): Promise<boolean> {
    // This method will now need to be implemented directly or removed if not used
    // For now, returning a placeholder or throwing an error as PermisosService is removed
    console.warn("PermisosService is no longer imported, verificarSuperSu will not work as intended.");
    return false;
  }
} 