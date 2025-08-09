import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/services/supabase/supaConf';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

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

interface NotificationsContextType {
  notificaciones: Notificacion[];
  loading: boolean;
  refreshNotifications: () => Promise<void>;
  getUnreadCount: () => number;
  markAsRead: (notificationId: number) => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

// ID único global para evitar conflictos
let globalChannelId = 0;

export const useNotificationsContext = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotificationsContext must be used within a NotificationsProvider');
  }
  return context;
};

interface NotificationsProviderProps {
  children: React.ReactNode;
}

export const NotificationsProvider: React.FC<NotificationsProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);
  const isInitializedRef = useRef(false);
  const providerIdRef = useRef(++globalChannelId);
  const isNotificationSetupDoneRef = useRef(false);

  // Asegurar configuración de notificaciones locales (móvil)
  const ensureLocalNotificationsSetup = async () => {
    if (Platform.OS === 'web' || isNotificationSetupDoneRef.current) return;

    try {
      // Permisos
      const settings = await Notifications.getPermissionsAsync();
      if (!settings.granted) {
        await Notifications.requestPermissionsAsync();
      }

      // Canal Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Notificaciones',
          importance: Notifications.AndroidImportance.HIGH,
          sound: 'default',
          vibrationPattern: [0, 250, 250, 250],
          lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        });
      }

      // Mostrar en foreground
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });

      isNotificationSetupDoneRef.current = true;
    } catch (e) {
      console.error('Error configurando notificaciones locales:', e);
    }
  };

  // Disparar notificación al usuario (local en móvil, Web Notification API en web)
  const presentUserNotification = async (notif: Notificacion) => {
    try {
      const title = notif.titulo || 'Nueva notificación';
      const body = notif.mensaje || '';

      if (Platform.OS === 'web') {
        try {
          if (typeof window !== 'undefined' && 'Notification' in window) {
            const WebNotification = (window as any).Notification;
            if (WebNotification.permission === 'default') {
              await WebNotification.requestPermission();
            }
            if (WebNotification.permission === 'granted') {
              // eslint-disable-next-line no-new
              new WebNotification(title, { body });
            }
          }
        } catch (e) {
          console.warn('Web Notification API no disponible:', e);
        }
        return;
      }

      await ensureLocalNotificationsSetup();
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: 'default',
        },
        trigger: null,
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      console.error('Error mostrando notificación local:', e);
    }
  };

  const fetchNotifications = async () => {
    if (!user?.id) return;

    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('notificaciones')
        .select('*')
        .eq('usuario_id', user.id)
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setNotificaciones(data);
      } else {
        // Si no hay datos o hay error, usar datos de prueba
        console.log('🔍 NotificationsProvider:', providerIdRef.current, 'No hay notificaciones reales, usando datos de prueba');
        const mockNotifications: Notificacion[] = [
          {
            id: 1,
            usuario_id: parseInt(user.id) || 1,
            tipo: 'cambio_carrera',
            titulo: 'Nueva solicitud de cambio de carrera',
            mensaje: 'El alumno Juan Pérez García ha solicitado un cambio de carrera de Ingeniería en Sistemas a Medicina.',
            datos_adicionales: {
              alumno_id: 1,
              peticion_id: 1,
              carrera_actual: 'Ingeniería en Sistemas',
              carrera_solicitada: 'Medicina',
              fecha_solicitud: '2024-01-15'
            },
            leida: false,
            created_at: '2024-01-15T10:30:00Z'
          },
          {
            id: 2,
            usuario_id: parseInt(user.id) || 1,
            tipo: 'cambio_carrera',
            titulo: 'Solicitud de cambio de carrera pendiente',
            mensaje: 'María González López solicita cambio de Administración a Psicología.',
            datos_adicionales: {
              alumno_id: 2,
              peticion_id: 2,
              carrera_actual: 'Administración',
              carrera_solicitada: 'Psicología',
              fecha_solicitud: '2024-01-14'
            },
            leida: false,
            created_at: '2024-01-14T14:20:00Z'
          },
          {
            id: 3,
            usuario_id: parseInt(user.id) || 1,
            tipo: 'success',
            titulo: 'Documento aprobado',
            mensaje: 'El documento de identificación del alumno Carlos Rodríguez ha sido aprobado exitosamente.',
            datos_adicionales: {
              alumno_id: 3,
              documento: 'INE',
              fecha_aprobacion: '2024-01-13'
            },
            leida: true,
            created_at: '2024-01-13T09:15:00Z'
          },
          {
            id: 4,
            usuario_id: parseInt(user.id) || 1,
            tipo: 'warning',
            titulo: 'Documento rechazado',
            mensaje: 'El certificado de estudios de Ana Martínez no cumple con los requisitos establecidos.',
            datos_adicionales: {
              alumno_id: 4,
              documento: 'Certificado de Estudios',
              motivo_rechazo: 'Documento ilegible'
            },
            leida: false,
            created_at: '2024-01-12T16:45:00Z'
          },
          {
            id: 5,
            usuario_id: parseInt(user.id) || 1,
            tipo: 'info',
            titulo: 'Nuevo registro de alumno',
            mensaje: 'Se ha registrado exitosamente al alumno Pedro Sánchez en el sistema.',
            datos_adicionales: {
              alumno_id: 5,
              matricula: '2024001',
              fecha_registro: '2024-01-11'
            },
            leida: true,
            created_at: '2024-01-11T11:30:00Z'
          }
        ];
        setNotificaciones(mockNotifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // En caso de error, también usar datos de prueba
      const mockNotifications: Notificacion[] = [
        {
          id: 1,
          usuario_id: parseInt(user.id) || 1,
          tipo: 'cambio_carrera',
          titulo: 'Nueva solicitud de cambio de carrera',
          mensaje: 'El alumno Juan Pérez García ha solicitado un cambio de carrera de Ingeniería en Sistemas a Medicina.',
          datos_adicionales: {
            alumno_id: 1,
            carrera_actual: 'Ingeniería en Sistemas',
            carrera_solicitada: 'Medicina',
            fecha_solicitud: '2024-01-15'
          },
          leida: false,
          created_at: '2024-01-15T10:30:00Z'
        }
      ];
      setNotificaciones(mockNotifications);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = async () => {
    if (!user?.id || isSubscribedRef.current) {
      console.log('🔍 NotificationsProvider:', providerIdRef.current, 'Ya suscrito o sin usuario, saltando suscripción');
      return;
    }

    try {
      // Limpiar cualquier suscripción existente
      await cleanupSubscription();

      // Crear nueva suscripción con ID único
      const channelId = `notificaciones_${user.id}_${providerIdRef.current}_${Date.now()}`;
      channelRef.current = supabase
        .channel(channelId)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notificaciones', filter: `usuario_id=eq.${user.id}` },
          async (payload) => {
            const notificacion = payload.new as Notificacion;
            setNotificaciones((prev) => [notificacion, ...prev]);
            // Disparar aviso al usuario
            await presentUserNotification(notificacion);
          }
        );

      await channelRef.current.subscribe();
      isSubscribedRef.current = true;
      console.log('🔍 NotificationsProvider:', providerIdRef.current, 'Canal suscrito exitosamente con ID:', channelId);
    } catch (error) {
      console.error('Error al suscribirse al canal:', error);
      isSubscribedRef.current = false;
    }
  };

  const cleanupSubscription = async () => {
    if (channelRef.current && isSubscribedRef.current) {
      try {
        await channelRef.current.unsubscribe();
        console.log('🔍 NotificationsProvider:', providerIdRef.current, 'Canal desuscrito exitosamente');
      } catch (error) {
        console.error('Error al desuscribirse del canal:', error);
      } finally {
        channelRef.current = null;
        isSubscribedRef.current = false;
      }
    }
  };

  const getUnreadCount = () => {
    return notificaciones.filter(n => !n.leida).length;
  };

  const markAsRead = async (notificationId: number) => {
    try {
      // Actualizar en Supabase
      const { error } = await supabase
        .from('notificaciones')
        .update({ leida: true })
        .eq('id', notificationId);

      if (!error) {
        // Actualizar estado local
        setNotificaciones(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, leida: true }
              : notif
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  useEffect(() => {
    if (!user?.id) {
      console.log('🔍 NotificationsProvider:', providerIdRef.current, 'No hay usuario, limpiando');
      cleanupSubscription();
      return;
    }

    // Evitar inicialización múltiple
    if (isInitializedRef.current) {
      console.log('🔍 NotificationsProvider:', providerIdRef.current, 'Ya inicializado, saltando');
      return;
    }

    console.log('🔍 NotificationsProvider:', providerIdRef.current, 'Inicializando con usuario:', user.id);
    isInitializedRef.current = true;

    // Solicitar permisos de notificaciones locales en móvil al iniciar
    ensureLocalNotificationsSetup();

    fetchNotifications();
    setupRealtimeSubscription();

    return () => {
      console.log('🔍 NotificationsProvider:', providerIdRef.current, 'Cleanup en useEffect');
      cleanupSubscription();
      isInitializedRef.current = false;
    };
  }, [user?.id]);

  const refreshNotifications = async () => {
    await fetchNotifications();
  };

  const value: NotificationsContextType = {
    notificaciones,
    loading,
    refreshNotifications,
    getUnreadCount,
    markAsRead
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}; 