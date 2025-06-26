// src/models/authModel.ts
import { supabase } from '@/services/supabase/supaConf';

export const authModel = {
  login: async (usuario: string, password: string) => {
    console.log(password);
    const { data, error } = await supabase
    .from('usuariosum')
    .select('*')
    .ilike('nombreusuario', usuario)
    .limit(1);

    if (error) {
      throw new Error(`Error SP: ${error.message}`);
    }

    // Check if data is returned
    if (!data || data.length === 0) {
      throw new Error(`Usuario no encontrado`);
    }

    // Validate password for the first user found
    const user = data[0];
    if (!user.password || user.password !== password) {
      throw new Error(`Usuario o contraseña incorrectos`);
    }else{
      console.log('Bienvenido')
    }
    return { session: user }; // Simulación de una "session"
  },
};