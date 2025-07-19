// src/models/authModel.ts
import { supabase } from '@/services/supabase/supaConf';

export const authModel = {
  login: async (usuario: string, password: string) => {
    const { data, error } = await supabase
      .from('usuariosum')
      .select('*')
      .ilike('nombreusuario', usuario)
      .limit(1);

    if (error) {
      throw new Error(`Error SP: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error(`Usuario no encontrado`);
    }

    const user = data[0];
    if (!user.password || user.password !== password) {
      throw new Error(`Usuario o contraseña incorrectos`);
    }

    // Mapea los campos al formato esperado por el AuthContext
    const mappedUser = {
      id: user.idusuario || user.id || '',
      name: user.nombre || user.nombreusuario || '',
      email: user.correoinstitucional || user.email || '',
      avatarUrl: user.avatarUrl || '',
    };

    return { session: mappedUser };
  },
};