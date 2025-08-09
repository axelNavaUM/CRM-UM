import type { Permiso, PoliticaRLS } from '@/models/permisos/permisosModel';
import { PermisosModel } from '@/models/permisos/permisosModel';
import { CreatePermisoData, CreatePoliticaRLSData, PermisosService, UpdatePermisoData, UpdatePoliticaRLSData } from '@/services/permisos/permisosService';

export class PermisosController {
  // Permisos
  static async getAllPermisos(): Promise<Permiso[]> {
    try {
      return await PermisosService.getAllPermisos();
    } catch (error) {
      throw new Error(`Error en el controlador al obtener permisos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  static async getPermisosByArea(areaId: number): Promise<Permiso[]> {
    try {
      return await PermisosService.getPermisosByArea(areaId);
    } catch (error) {
      throw new Error(`Error en el controlador al obtener permisos del área: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  static async createPermiso(permisoData: CreatePermisoData): Promise<Permiso> {
    try {
      return await PermisosService.createPermiso(permisoData);
    } catch (error) {
      throw new Error(`Error en el controlador al crear permiso: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  static async updatePermiso(id: number, permisoData: UpdatePermisoData): Promise<void> {
    try {
      await PermisosService.updatePermiso(id, permisoData);
    } catch (error) {
      throw new Error(`Error en el controlador al actualizar permiso: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  static async deletePermiso(id: number): Promise<void> {
    try {
      await PermisosService.deletePermiso(id);
    } catch (error) {
      throw new Error(`Error en el controlador al eliminar permiso: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  // Políticas RLS
  static async getAllPoliticasRLS(): Promise<PoliticaRLS[]> {
    try {
      return await PermisosService.getAllPoliticasRLS();
    } catch (error) {
      throw new Error(`Error en el controlador al obtener políticas RLS: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  static async getPoliticasByArea(areaId: number): Promise<PoliticaRLS[]> {
    try {
      return await PermisosService.getPoliticasByArea(areaId);
    } catch (error) {
      throw new Error(`Error en el controlador al obtener políticas del área: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  static async createPoliticaRLS(politicaData: CreatePoliticaRLSData): Promise<PoliticaRLS> {
    try {
      return await PermisosService.createPoliticaRLS(politicaData);
    } catch (error) {
      throw new Error(`Error en el controlador al crear política RLS: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  static async updatePoliticaRLS(id: number, politicaData: UpdatePoliticaRLSData): Promise<void> {
    try {
      await PermisosService.updatePoliticaRLS(id, politicaData);
    } catch (error) {
      throw new Error(`Error en el controlador al actualizar política RLS: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  static async deletePoliticaRLS(id: number): Promise<void> {
    try {
      await PermisosService.deletePoliticaRLS(id);
    } catch (error) {
      throw new Error(`Error en el controlador al eliminar política RLS: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  // Métodos de utilidad
  static async getAreasConPermisos(): Promise<any[]> {
    try {
      return await PermisosService.getAreasConPermisos();
    } catch (error) {
      throw new Error(`Error en el controlador al obtener áreas con permisos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  static getTiposPermiso(): string[] {
    return PermisosService.getTiposPermiso();
  }

  static getTablasDisponibles(): string[] {
    return PermisosService.getTablasDisponibles();
  }

  // Nuevos métodos para validar funciones y datos disponibles
  static getFuncionesDisponibles(): string[] {
    return PermisosService.getFuncionesDisponibles();
  }

  static getDatosDisponibles(): string[] {
    return PermisosService.getDatosDisponibles();
  }

  static validarFuncionDisponible(funcion: string): boolean {
    return PermisosService.validarFuncionDisponible(funcion);
  }

  static validarDatoDisponible(dato: string): boolean {
    return PermisosService.validarDatoDisponible(dato);
  }

  static getFuncionesDisponiblesConDescripcion(): Record<string, string> {
    return PermisosService.getFuncionesDisponiblesConDescripcion();
  }

  static getDatosDisponiblesConDescripcion(): Record<string, string> {
    return PermisosService.getDatosDisponiblesConDescripcion();
  }

  static formatTipoPermiso(tipo: string): string {
    return PermisosService.formatTipoPermiso(tipo);
  }

  static generatePoliticaRLSExample(tabla: string, areaId: number): string {
    return PermisosService.generatePoliticaRLSExample(tabla, areaId);
  }

  // Verificar si un usuario tiene un permiso específico
  static async verificarPermisoUsuario(email: string, permisoNombre: string): Promise<boolean> {
    if (!email || !permisoNombre) {
      return false;
    }
    return await PermisosModel.verificarPermisoUsuario(email, permisoNombre);
  }

  // Verificar si un usuario es super su
  static async verificarSuperSu(email: string): Promise<boolean> {
    if (!email) {
      return false;
    }
    return await PermisosModel.verificarSuperSu(email);
  }
} 