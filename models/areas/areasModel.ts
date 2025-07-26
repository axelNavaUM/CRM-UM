import { supabase } from '@/services/supabase/supaConf';

export interface Area {
  idarea: number;
  nombrearea: string;
  rolarea: string;
  permisos: Record<string, boolean>;
}

export class AreasModel {
  static async getAll(): Promise<Area[]> {
    const { data, error } = await supabase
      .from('areas')
      .select('*');
    if (error) {
      throw new Error(`Error al obtener áreas: ${error.message}`);
    }
    return data as Area[];
  }

  static async getById(idarea: number): Promise<Area | null> {
    const { data, error } = await supabase
      .from('areas')
      .select('*')
      .eq('idarea', idarea)
      .single();
    if (error) {
      throw new Error(`Error al obtener área: ${error.message}`);
    }
    return data as Area | null;
  }

  static async create(area: Omit<Area, 'idarea'>): Promise<Area> {
    const { data, error } = await supabase
      .from('areas')
      .insert(area)
      .select()
      .single();
    if (error) {
      throw new Error(`Error al crear área: ${error.message}`);
    }
    return data as Area;
  }

  static async update(idarea: number, updates: Partial<Omit<Area, 'idarea'>>): Promise<void> {
    const { error } = await supabase
      .from('areas')
      .update(updates)
      .eq('idarea', idarea);
    if (error) {
      throw new Error(`Error al actualizar área: ${error.message}`);
    }
  }

  static async delete(idarea: number): Promise<void> {
    const { error } = await supabase
      .from('areas')
      .delete()
      .eq('idarea', idarea);
    if (error) {
      throw new Error(`Error al eliminar área: ${error.message}`);
    }
  }
} 