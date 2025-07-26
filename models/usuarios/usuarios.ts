import { supabase } from '@/services/supabase/supaConf';

import { Usuariosum } from '@/store/usuario/usuario';

export class userModel {
    static async getAll(): Promise<any[]> { 
        try {
            // Obtener usuarios
            const { data: usuarios, error: usuariosError } = await supabase
                .from('usuariosum')
                .select('*');
            
            if (usuariosError) {
                throw new Error(`Error al obtener usuarios: ${usuariosError.message}`);
            }

            // Obtener áreas
            const { data: areas, error: areasError } = await supabase
                .from('areas')
                .select('idarea, nombrearea, rolarea');
            
            if (areasError) {
                throw new Error(`Error al obtener áreas: ${areasError.message}`);
            }

            // Combinar datos
            const usuariosConAreas = usuarios?.map(usuario => {
                const area = areas?.find(a => a.idarea === usuario.idarea);
                const jefe = usuarios?.find(u => u.idusuario === usuario.reporta_a);
                
                return {
                    ...usuario,
                    areas: area || null,
                    jefe: jefe ? { idusuario: jefe.idusuario, nombreusuario: jefe.nombreusuario, apellido: jefe.apellido } : null
                };
            });

            return usuariosConAreas || [];
        } catch (error) {
            throw new Error(`Error al obtener usuarios: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    }
    static async getById(idusuario: number): Promise<Usuariosum | null> { 
        const { data, error } = await supabase
            .from('usuariosum')
            .select('*')
            .eq('idusuario', idusuario)
            .single();

            if (error) {
                throw new Error(`Error al obtener usuario: ${error.message}`);
            }
            
            return data as Usuariosum | null;
    }

    static async getAllAreas(): Promise<any[]> {
        const { data, error } = await supabase
            .from('areas')
            .select('*');
        if (error) {
            throw new Error(`Error al obtener áreas: ${error.message}`);
        }
        return data;
    }

    // Metodos para insertar, actuaizar

    static async create( usuariosum: Omit<Usuariosum, 'idusuario'>): Promise<Usuariosum>{
       const { data, error } = await supabase
            .from('usuariosum')
            .insert(usuariosum)
            .select()
            .single();

            if (error) {
                throw new Error(`Error al insertar datos: ${error.message}`);
            }
            
            return data as Usuariosum;
    }

    static async update( idusuarios: number,updates: Partial<Omit<Usuariosum, 'idusuario'>>): Promise<void>{
       const { error } = await supabase
            .from('usuariosum')
            .update(updates)
            .eq('idusuario', idusuarios);

            if (error) {
                throw new Error(`Error al actualizar datos: ${error.message}`);
            }
    }

    static async delete(idusuario: number): Promise<void> {
        const { error } = await supabase
            .from('usuariosum')
            .delete()
            .eq('idusuario', idusuario);
        if (error) {
            throw new Error(`Error al eliminar usuario: ${error.message}`);
        }
    }

    // Registro de usuario en Supabase Auth y en usuariosum
    static async registerWithAuth({ email, password, ...userData }: { email: string, password: string, [key: string]: any }) {
        // 1. Crear usuario en Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        });
        if (authError) {
            throw new Error(`Error al registrar en Auth: ${authError.message}`);
        }
        const auth_uid = authData.user?.id;
        if (!auth_uid) throw new Error('No se pudo obtener el UUID del usuario autenticado');
        // 2. Crear usuario en usuariosum
        const { data, error } = await supabase
            .from('usuariosum')
            .insert({ ...userData, correoinstitucional: email, auth_uid })
            .select()
            .single();
        if (error) {
            throw new Error(`Error al registrar usuario: ${error.message}`);
        }
        return data;
    }

    // Login y obtención de datos de negocio
    static async loginWithAuth({ email, password }: { email: string, password: string }) {
        // 1. Login en Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (authError) {
            throw new Error(`Error al iniciar sesión: ${authError.message}`);
        }
        const auth_uid = authData.user?.id;
        if (!auth_uid) throw new Error('No se pudo obtener el UUID del usuario autenticado');
        // 2. Buscar usuario de negocio
        const { data, error } = await supabase
            .from('usuariosum')
            .select('*')
            .eq('auth_uid', auth_uid)
            .single();
        if (error) {
            throw new Error(`Error al obtener datos de usuario: ${error.message}`);
        }
        return { authUser: authData.user, negocioUser: data };
    }

    static async loginByUsuario({ usuario, password }: { usuario: string, password: string }) {
        const { data, error } = await supabase
            .from('usuariosum')
            .select('*')
            .eq('nombreusuario', usuario)
            .eq('password', password)
            .single();
        if (error || !data) {
            throw new Error('Usuario o contraseña incorrectos');
        }
        return data;
    }

    static async getByAuthUid(auth_uid: string): Promise<any> {
        const { data, error } = await supabase
            .from('usuariosum')
            .select('*')
            .eq('auth_uid', auth_uid)
            .single();
        if (error) {
            throw new Error(`Error al obtener usuario por auth_uid: ${error.message}`);
        }
        return data;
    }

    static async createArea(area: any): Promise<any> {
        const { data, error } = await supabase
            .from('areas')
            .insert(area)
            .select()
            .single();
        if (error) {
            throw new Error(`Error al crear área: ${error.message}`);
        }
        return data;
    }

    static async updateArea(idarea: number, updates: any): Promise<void> {
        const { error } = await supabase
            .from('areas')
            .update(updates)
            .eq('idarea', idarea);
        if (error) {
            throw new Error(`Error al actualizar área: ${error.message}`);
        }
    }

    static async deleteArea(idarea: number): Promise<void> {
        const { error } = await supabase
            .from('areas')
            .delete()
            .eq('idarea', idarea);
        if (error) {
            throw new Error(`Error al eliminar área: ${error.message}`);
        }
    }
}