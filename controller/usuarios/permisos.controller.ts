import { getPermisos } from '@/services/permisos/permisosService';

export async function obtenerPermisosUsuario(idUsuario: number){
    try {
        const permisos = await getPermisos(idUsuario);
        return permisos;
    } catch (error) {
        const err = error instanceof Error ? error.message : 'Erros Permisos desconocido';
        throw new Error(err);
    }
}