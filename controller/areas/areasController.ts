import type { Area } from '@/models/areas/areasModel';
import { AreasService, CreateAreaData, UpdateAreaData } from '@/services/areas/areasService';

export class AreasController {
  static async getAll(): Promise<Area[]> {
    try {
      return await AreasService.getAllAreas();
    } catch (error) {
      throw new Error(`Error en el controlador al obtener áreas: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  static async getById(idarea: number): Promise<Area | null> {
    try {
      return await AreasService.getAreaById(idarea);
    } catch (error) {
      throw new Error(`Error en el controlador al obtener área: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  static async create(areaData: CreateAreaData): Promise<Area> {
    try {
      return await AreasService.createArea(areaData);
    } catch (error) {
      throw new Error(`Error en el controlador al crear área: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  static async update(idarea: number, areaData: UpdateAreaData): Promise<void> {
    try {
      await AreasService.updateArea(idarea, areaData);
    } catch (error) {
      throw new Error(`Error en el controlador al actualizar área: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  static async delete(idarea: number): Promise<void> {
    try {
      await AreasService.deleteArea(idarea);
    } catch (error) {
      throw new Error(`Error en el controlador al eliminar área: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  // Métodos de utilidad
  static getPermisosDisponibles(): string[] {
    return AreasService.getPermisosDisponibles();
  }

  static formatPermisoName(permiso: string): string {
    return AreasService.formatPermisoName(permiso);
  }
} 