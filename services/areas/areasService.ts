import { Area, AreasModel } from '@/models/areas/areasModel';

export interface CreateAreaData {
  nombrearea: string;
  rolarea: string;
  permisos: Record<string, boolean>;
}

export interface UpdateAreaData {
  nombrearea?: string;
  rolarea?: string;
  permisos?: Record<string, boolean>;
}

export class AreasService {
  // Validaciones
  static validateAreaData(data: CreateAreaData): void {
    if (!data.nombrearea || data.nombrearea.trim().length === 0) {
      throw new Error('El nombre del área es obligatorio');
    }
    if (!data.rolarea || data.rolarea.trim().length === 0) {
      throw new Error('El rol del área es obligatorio');
    }
    if (!data.permisos || typeof data.permisos !== 'object') {
      throw new Error('Los permisos son obligatorios');
    }
  }

  static validateUpdateData(data: UpdateAreaData): void {
    if (data.nombrearea !== undefined && data.nombrearea.trim().length === 0) {
      throw new Error('El nombre del área no puede estar vacío');
    }
    if (data.rolarea !== undefined && data.rolarea.trim().length === 0) {
      throw new Error('El rol del área no puede estar vacío');
    }
  }

  // Transformaciones
  static transformAreaData(data: CreateAreaData): Omit<Area, 'idarea'> {
    return {
      nombrearea: data.nombrearea.trim(),
      rolarea: data.rolarea.trim(),
      permisos: this.normalizePermisos(data.permisos)
    };
  }

  static normalizePermisos(permisos: Record<string, boolean>): Record<string, boolean> {
    const defaultPermisos = {
      alta_alumnos: false,
      busqueda: false,
      editar: false,
      leer: false,
      actualizar: false,
      alta_usuarios: false,
      delete: false,
      insert: false,
      select: false,
      update: false,
    };

    return {
      ...defaultPermisos,
      ...permisos
    };
  }

  // Operaciones de negocio
  static async getAllAreas(): Promise<Area[]> {
    try {
      return await AreasModel.getAll();
    } catch (error) {
      throw new Error(`Error en el servicio al obtener áreas: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  static async getAreaById(idarea: number): Promise<Area | null> {
    try {
      return await AreasModel.getById(idarea);
    } catch (error) {
      throw new Error(`Error en el servicio al obtener área: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  static async createArea(data: CreateAreaData): Promise<Area> {
    try {
      this.validateAreaData(data);
      const transformedData = this.transformAreaData(data);
      return await AreasModel.create(transformedData);
    } catch (error) {
      throw new Error(`Error en el servicio al crear área: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  static async updateArea(idarea: number, data: UpdateAreaData): Promise<void> {
    try {
      this.validateUpdateData(data);
      const transformedData = {
        ...(data.nombrearea && { nombrearea: data.nombrearea.trim() }),
        ...(data.rolarea && { rolarea: data.rolarea.trim() }),
        ...(data.permisos && { permisos: this.normalizePermisos(data.permisos) })
      };
      await AreasModel.update(idarea, transformedData);
    } catch (error) {
      throw new Error(`Error en el servicio al actualizar área: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  static async deleteArea(idarea: number): Promise<void> {
    try {
      await AreasModel.delete(idarea);
    } catch (error) {
      throw new Error(`Error en el servicio al eliminar área: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  // Utilidades
  static getPermisosDisponibles(): string[] {
    return [
      'alta_alumnos',
      'busqueda',
      'editar',
      'leer',
      'actualizar',
      'alta_usuarios',
      'delete',
      'insert',
      'select',
      'update'
    ];
  }

  static formatPermisoName(permiso: string): string {
    return permiso.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
} 