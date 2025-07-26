import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/services/supabase/supaConf';
import { useEffect, useState } from 'react';

export interface Notificacion {
  id: number;
  usuario_id: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  datos_adicionales: any;
  leida: boolean;
  created_at: string;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetchNotifications = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('notificaciones')
        .select('*')
        .eq('usuario_id', user.id)
        .order('created_at', { ascending: false });
      if (!error) setNotificaciones(data || []);
      setLoading(false);
    };

    fetchNotifications();

    // Suscripción en tiempo real
    const channel = supabase
      .channel('notificaciones')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notificaciones', filter: `usuario_id=eq.${user.id}` },
        (payload) => {
          setNotificaciones((prev) => [payload.new as Notificacion, ...prev]);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user?.id]);

  return { notificaciones, loading };
}; 