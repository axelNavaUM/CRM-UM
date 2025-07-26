import { userModel } from '@/models/usuarios/usuarios';
import type { Usuariosum } from '@/store/usuario/usuario';

export class UsuariosController{
    static async getAll(): Promise<Usuariosum[]> {

        //Validaciones o transformaciones adicionales pueden ir aquí
        return userModel.getAll();
    }

    static async getById(idusuario: number): Promise<Usuariosum | null> {
        return userModel.getById(idusuario);
    }

    static async create(usuariosum: Omit<Usuariosum, 'idusuario'>): Promise<Usuariosum> {
        return userModel.create(usuariosum);
    }

    static async update(idusuarios: number, updates: Partial<Omit<Usuariosum, 'idusuario'>>): Promise<void> {
        return userModel.update(idusuarios, updates);
    }
}