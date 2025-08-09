import React from 'react';
import { Platform } from 'react-native';
import MobileNotifications from './MobileNotifications';

interface ResponsiveNotificationsProps {
  visible: boolean;
  onClose: () => void;
  onNotificationPress?: (notification: any) => void;
}

const ResponsiveNotifications: React.FC<ResponsiveNotificationsProps> = (props) => {
  // En web, las notificaciones se manejan con AsidePanel, no renderizar nada aquí
  if (Platform.OS === 'web') {
    return null;
  }
  
  // En móvil, usar el componente modal
  return <MobileNotifications {...props} />;
};

export default ResponsiveNotifications; 