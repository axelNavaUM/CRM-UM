import { useNotificationsContext } from '@/context/NotificationsContext';

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
  const { 
    notificaciones, 
    loading, 
    refreshNotifications, 
    getUnreadCount, 
    markAsRead 
  } = useNotificationsContext();
  
  return { 
    notificaciones, 
    loading,
    refreshNotifications,
    getUnreadCount,
    markAsRead
  };
}; 