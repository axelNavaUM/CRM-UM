import { supabase } from '@/services/supabase/supaConf';

export type User = {
  email: string;
  name?: string;
  avatarUrl?: string;
};

export class userModel {
  static async upsert(user: User) {
    const { data, error } = await supabase
      .from('users')
      .upsert(user, { onConflict: ['email'] });

    if (error) throw error;
    return data[0]; // devuelve solo el usuario
  }
}
