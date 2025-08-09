import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    View
} from 'react-native';
import ModernNavbar from '../navbar/ModernNavbar';
import CleanHeader from './CleanHeader';
import DynamicIslandHeader from './DynamicIslandHeader';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  sender?: {
    name: string;
    avatar?: string;
  };
  area?: string;
  timestamp: Date;
}

interface ModernAppLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  onTabPress?: (tabId: string) => void;
  showHeader?: boolean;
  showNavbar?: boolean;
  showDynamicIsland?: boolean;
  headerTitle?: string;
}

const ModernAppLayout: React.FC<ModernAppLayoutProps> = ({
  children,
  activeTab = 'home',
  onTabPress,
  showHeader = true,
  showNavbar = true,
  showDynamicIsland = true,
  headerTitle = 'CRM UM',
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Simular notificaciones entrantes
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        title: 'Nueva solicitud de cambio de carrera',
        message: 'El alumno Juan Pérez ha solicitado un cambio de carrera',
        type: 'info',
        sender: {
          name: 'Sistema Académico',
        },
        area: 'Control Escolar',
        timestamp: new Date(),
      },
      {
        id: '2',
        title: 'Documento aprobado',
        message: 'El documento de identificación ha sido aprobado',
        type: 'success',
        sender: {
          name: 'María González',
        },
        area: 'Admisiones',
        timestamp: new Date(),
      },
      {
        id: '3',
        title: 'Documento rechazado',
        message: 'El certificado de estudios no cumple con los requisitos',
        type: 'error',
        sender: {
          name: 'Carlos Rodríguez',
        },
        area: 'Control Escolar',
        timestamp: new Date(),
      },
    ];

    // Simular notificaciones entrantes cada 10 segundos
    const interval = setInterval(() => {
      const randomNotification = mockNotifications[Math.floor(Math.random() * mockNotifications.length)];
      setNotifications(prev => [...prev, { ...randomNotification, id: Date.now().toString() }]);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleNotificationPress = (notification: Notification) => {
    console.log('Notificación presionada:', notification);
    // Aquí puedes manejar la navegación o mostrar detalles
  };

  const handleSearchPress = () => {
    console.log('Búsqueda presionada');
  };

  const handleNotificationButtonPress = () => {
    console.log('Botón de notificaciones presionado');
  };

  const handleProfilePress = () => {
    console.log('Perfil presionado');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Dynamic Island para notificaciones */}
      {showDynamicIsland && (
        <DynamicIslandHeader
          notifications={notifications}
          onNotificationPress={handleNotificationPress}
        />
      )}

      {/* Header limpio */}
      {showHeader && (
        <CleanHeader
          title={headerTitle}
          onSearchPress={handleSearchPress}
          onNotificationPress={handleNotificationButtonPress}
          onProfilePress={handleProfilePress}
        />
      )}

      {/* Contenido principal */}
      <View style={styles.content}>
        {children}
      </View>

      {/* Navbar moderno */}
      {showNavbar && (
        <ModernNavbar
          activeTab={activeTab}
          onTabPress={onTabPress}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
});

export default ModernAppLayout; 