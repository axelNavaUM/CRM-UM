// src/models/authModel.ts
import { supabase } from '@/services/supabase/supaConf';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@auth_user';

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
    let fullName = '';
    if (user.nombreusuario && user.apellido) {
      fullName = `${user.nombreusuario} ${user.apellido}`.trim();
    } else if (user.nombre) {
      fullName = user.nombre;
    } else if (user.nombreusuario) {
      fullName = user.nombreusuario;
    }

    const mappedUser = {
      id: user.idusuario || user.id || '',
      name: fullName,
      email: user.correoinstitucional || user.email || '',
      avatarUrl: user.avatarUrl || '',
      // Agregar información crucial para roles
      idarea: user.idarea,
      nombreusuario: user.nombreusuario,
      apellido: user.apellido,
      correoinstitucional: user.correoinstitucional,
    };

    return { session: mappedUser };
  },
  logout: async () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY);
    }
  },
};