import { Permiso, PermisosModel, PoliticaRLS } from '@/models/permisos/permisosModel';

export interface CreatePermisoData {
  nombre: string;
  descripcion: string;
  tipo: 'pantalla' | 'funcion' | 'dato';
  area_id: number;
  activo: boolean;
}

export interface UpdatePermisoData {
  nombre?: string;
  descripcion?: string;
  tipo?: 'pantalla' | 'funcion' | 'dato';
  activo?: boolean;
}

export interface CreatePoliticaRLSData {
  nombre: string;
  tabla: string;
  politica: string;
  area_id: number;
  activo: boolean;
}

export interface UpdatePoliticaRLSData {
  nombre?: string;
  tabla?: string;
  politica?: string;
  activo?: boolean;
}

export class PermisosService {
  // Validaciones
  static validatePermisoData(data: CreatePermisoData): void {
    if (!data.nombre || data.nombre.trim().length === 0) {
      throw new Error('El nombre del permiso es obligatorio');
    }
    if (!data.descripcion || data.descripcion.trim().length === 0) {
      throw new Error('La descripción del permiso es obligatoria');
    }
    if (!['pantalla', 'funcion', 'dato'].includes(data.tipo)) {
      throw new Error('El tipo de permiso debe ser: pantalla, funcion o dato');
    }
    if (!data.area_id || data.area_id <= 0) {
      throw new Error('El área es obligatoria');
    }
  }

  static validatePoliticaRLSData(data: CreatePoliticaRLSData): void {
    if (!data.nombre || data.nombre.trim().length === 0) {
      throw new Error('El nombre de la política es obligatorio');
    }
    if (!data.tabla || data.tabla.trim().length === 0) {
      throw new Error('La tabla es obligatoria');
    }
    if (!data.politica || data.politica.trim().length === 0) {
      throw new Error('La política SQL es obligatoria');
    }
    if (!data.area_id || data.area_id <= 0) {
      throw new Error('El área es obligatoria');
    }
  }

  // Transformaciones
  static transformPermisoData(data: CreatePermisoData): Omit<Permiso, 'id' | 'created_at' | 'updated_at'> {
    return {
      nombre: data.nombre.trim(),
      descripcion: data.descripcion.trim(),
      tipo: data.tipo,
      area_id: data.area_id,
      activo: data.activo
    };
  }

  static transformPoliticaRLSData(data: CreatePoliticaRLSData): Omit<PoliticaRLS, 'id' | 'created_at' | 'updated_at'> {
    return {
      nombre: data.nombre.trim(),
      tabla: data.tabla.trim(),
      politica: data.politica.trim(),
      area_id: data.area_id,
      activo: data.activo
    };
  }

  // Operaciones de negocio - Permisos
  static async getAllPermisos(): Promise<Permiso[]> {
    try {
      return await PermisosModel.getAllPermisos();
    } catch (error) {
      throw new Error(`Error en el servicio al obtener permisos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  static async getPermisosByArea(areaId: number): Promise<Permiso[]> {
    try {
      return await PermisosModel.getPermisosByArea(areaId);
    } catch (error) {
      throw new Error(`Error en el servicio al obtener permisos del área: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  static async createPermiso(data: CreatePermisoData): Promise<Permiso> {
    try {
      this.validatePermisoData(data);
      const transformedData = this.transformPermisoData(data);
      return await PermisosModel.createPermiso(transformedData);
    } catch (error) {
      throw new Error(`Error en el servicio al crear permiso: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  static async updatePermiso(id: number, data: UpdatePermisoData): Promise<void> {
    try {
      const transformedData = {
        ...(data.nombre && { nombre: data.nombre.trim() }),
        ...(data.descripcion && { descripcion: data.descripcion.trim() }),
        ...(data.tipo && { tipo: data.tipo }),
        ...(data.activo !== undefined && { activo: data.activo })
      };
      await PermisosModel.updatePermiso(id, transformedData);
    } catch (error) {
      throw new Error(`Error en el servicio al actualizar permiso: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  static async deletePermiso(id: number): Promise<void> {
    try {
      await PermisosModel.deletePermiso(id);
    } catch (error) {
      throw new Error(`Error en el servicio al eliminar permiso: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  // Operaciones de negocio - Políticas RLS
  static async getAllPoliticasRLS(): Promise<PoliticaRLS[]> {
    try {
      return await PermisosModel.getAllPoliticasRLS();
    } catch (error) {
      throw new Error(`Error en el servicio al obtener políticas RLS: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  static async getPoliticasByArea(areaId: number): Promise<PoliticaRLS[]> {
    try {
      return await PermisosModel.getPoliticasByArea(areaId);
    } catch (error) {
      throw new Error(`Error en el servicio al obtener políticas del área: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  static async createPoliticaRLS(data: CreatePoliticaRLSData): Promise<PoliticaRLS> {
    try {
      this.validatePoliticaRLSData(data);
      const transformedData = this.transformPoliticaRLSData(data);
      return await PermisosModel.createPoliticaRLS(transformedData);
    } catch (error) {
      throw new Error(`Error en el servicio al crear política RLS: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  static async updatePoliticaRLS(id: number, data: UpdatePoliticaRLSData): Promise<void> {
    try {
      const transformedData = {
        ...(data.nombre && { nombre: data.nombre.trim() }),
        ...(data.tabla && { tabla: data.tabla.trim() }),
        ...(data.politica && { politica: data.politica.trim() }),
        ...(data.activo !== undefined && { activo: data.activo })
      };
      await PermisosModel.updatePoliticaRLS(id, transformedData);
    } catch (error) {
      throw new Error(`Error en el servicio al actualizar política RLS: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  static async deletePoliticaRLS(id: number): Promise<void> {
    try {
      await PermisosModel.deletePoliticaRLS(id);
    } catch (error) {
      throw new Error(`Error en el servicio al eliminar política RLS: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  // Utilidades
  static async getAreasConPermisos(): Promise<any[]> {
    try {
      return await PermisosModel.getAreasConPermisos();
    } catch (error) {
      throw new Error(`Error en el servicio al obtener áreas con permisos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  static getTiposPermiso(): string[] {
    return ['pantalla', 'funcion', 'dato'];
  }

  static getTablasDisponibles(): string[] {
    return ['usuariosum', 'areas', 'alumnos', 'carreras', 'ciclos', 'pagos', 'documentos_alumno'];
  }

  static formatTipoPermiso(tipo: string): string {
    const formatos = {
      pantalla: 'Pantalla',
      funcion: 'Función',
      dato: 'Dato'
    };
    return formatos[tipo as keyof typeof formatos] || tipo;
  }

  static generatePoliticaRLSExample(tabla: string, areaId: number): string {
    return `CREATE POLICY "policy_${tabla}_area_${areaId}" ON public.${tabla} FOR ALL USING (auth.uid() IN (SELECT auth_uid FROM usuariosum WHERE idarea = ${areaId}));`;
  }

  // Verificar si un usuario tiene un permiso específico
  static async verificarPermisoUsuario(email: string, permisoNombre: string): Promise<boolean> {
    try {
      const { supabase } = await import('@/services/supabase/supaConf');
      
      // Obtener el usuario y su área
      const { data: usuario, error: usuarioError } = await supabase
        .from('usuariosum')
        .select('idarea')
        .eq('correoinstitucional', email)
        .single();

      if (usuarioError || !usuario) {
        console.log('Usuario no encontrado:', email);
        return false;
      }

      // Si el usuario no tiene área asignada, verificar si es super su
      if (!usuario.idarea) {
        // Verificar si es super su (todos los permisos)
        return true;
      }

      // Obtener el área y verificar si tiene el permiso
      const { data: area, error: areaError } = await supabase
        .from('areas')
        .select('permisos')
        .eq('idarea', usuario.idarea)
        .single();

      if (areaError || !area) {
        console.log('Área no encontrada para usuario:', email);
        return false;
      }

      // Verificar si el área tiene el permiso en su JSON de permisos
      if (area.permisos && typeof area.permisos === 'object') {
        return area.permisos[permisoNombre] === true;
      }

      return false;
    } catch (error) {
      console.error('Error al verificar permiso:', error);
      return false;
    }
  }

  // Verificar si un usuario es super su (tiene todos los permisos)
  static async verificarSuperSu(email: string): Promise<boolean> {
    try {
      const { supabase } = await import('@/services/supabase/supaConf');
      
      // Obtener el usuario
      const { data: usuario, error: usuarioError } = await supabase
        .from('usuariosum')
        .select('idarea')
        .eq('correoinstitucional', email)
        .single();

      if (usuarioError || !usuario) {
        return false;
      }

      // Si no tiene área asignada, es super su
      return !usuario.idarea;
    } catch (error) {
      console.error('Error al verificar super su:', error);
      return false;
    }
  }
}