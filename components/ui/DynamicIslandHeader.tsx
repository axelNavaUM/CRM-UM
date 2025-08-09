import RadixIcons from '@/components/ui/RadixIcons';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

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

interface DynamicIslandHeaderProps {
  notifications?: Notification[];
  onNotificationPress?: (notification: Notification) => void;
}

const DynamicIslandHeader: React.FC<DynamicIslandHeaderProps> = ({
  notifications = [],
  onNotificationPress,
}) => {
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  const slideAnim = useRef(new Animated.Value(-200)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (notifications.length > 0 && !currentNotification) {
      showNotification(notifications[0]);
    }
  }, [notifications]);

  const showNotification = (notification: Notification) => {
    setCurrentNotification(notification);
    setIsVisible(true);

    // Animación de entrada
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-hide después de 4 segundos
    setTimeout(() => {
      hideNotification();
    }, 4000);
  };

  const hideNotification = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -200,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
      setCurrentNotification(null);
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return 'Check';
      case 'warning':
        return 'Warning';
      case 'error':
        return 'Error';
      default:
        return 'Info';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return '#10B981';
      case 'warning':
        return '#F59E0B';
      case 'error':
        return '#EF4444';
      default:
        return '#3B82F6';
    }
  };

  if (!isVisible || !currentNotification) {
    return null;
  }

  const IconComponent = RadixIcons[getNotificationIcon(currentNotification.type) as keyof typeof RadixIcons];
  const notificationColor = getNotificationColor(currentNotification.type);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.dynamicIsland,
          {
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim },
            ],
            opacity: opacityAnim,
          },
        ]}
      >
        <View style={styles.notificationContent}>
          {/* Icono del tipo de notificación */}
          <View style={[styles.iconContainer, { backgroundColor: notificationColor }]}>
            <IconComponent size={16} color="#FFFFFF" />
          </View>

          {/* Contenido de la notificación */}
          <View style={styles.textContainer}>
            {/* Header con avatar/nombre del remitente */}
            <View style={styles.notificationHeader}>
              {currentNotification.sender?.avatar ? (
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>
                    {currentNotification.sender.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              ) : (
                <View style={styles.avatarContainer}>
                  <RadixIcons.User size={14} color="#FFFFFF" />
                </View>
              )}
              
              <Text style={styles.senderName}>
                {currentNotification.sender?.name || currentNotification.area || 'Sistema'}
              </Text>
              
              <Text style={styles.timestamp}>
                {currentNotification.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
            </View>

            {/* Título de la notificación */}
            <Text style={styles.notificationTitle} numberOfLines={1}>
              {currentNotification.title}
            </Text>

            {/* Mensaje de la notificación */}
            <Text style={styles.notificationMessage} numberOfLines={2}>
              {currentNotification.message}
            </Text>
          </View>

          {/* Botón de cerrar */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={hideNotification}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <RadixIcons.Close size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Indicador de progreso */}
        <View style={styles.progressContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              { backgroundColor: notificationColor },
            ]}
          />
        </View>
      </Animated.View>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    right: 20,
    zIndex: 9999,
  },
  dynamicIsland: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    gap: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  avatarContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  timestamp: {
    fontSize: 10,
    color: '#6B7280',
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  notificationMessage: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  closeButton: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  progressContainer: {
    height: 2,
    backgroundColor: '#F3F4F6',
  },
  progressBar: {
    height: '100%',
    width: '100%',
  },
});

export default DynamicIslandHeader; 