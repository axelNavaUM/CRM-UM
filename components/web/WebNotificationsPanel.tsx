import RadixIcons from '@/components/ui/RadixIcons';
import { useNotifications } from '@/hooks/notifications/useNotifications';
import { usePlatform } from '@/hooks/usePlatform';
import { useSheet } from '@/hooks/useSheet';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface WebNotificationsPanelProps {
  visible: boolean;
  onClose: () => void;
  onNotificationPress?: (notification: any) => void;
}

const WebNotificationsPanel: React.FC<WebNotificationsPanelProps> = ({
  visible,
  onClose,
  onNotificationPress,
}) => {
  const { isWeb } = usePlatform();
  const { notificaciones, loading, markAsRead, refreshNotifications } = useNotifications();
  const { showSheet, hideSheet } = useSheet();
  const [selectedNotification, setSelectedNotification] = useState<any>(null);

  // Cargar notificaciones cuando el panel se abre
  useEffect(() => {
    if (visible && isWeb) {
      console.log('🔍 WebNotificationsPanel: Panel abierto, cargando notificaciones...');
      refreshNotifications();
    }
  }, [visible, isWeb, refreshNotifications]);

  // Solo renderizar en web
  if (!isWeb) {
    console.log('🔍 WebNotificationsPanel: No es web, no renderizando');
    return null;
  }

  console.log('🔍 WebNotificationsPanel: Renderizando en web, visible:', visible);
  console.log('🔍 WebNotificationsPanel: Notificaciones:', notificaciones);
  console.log('🔍 WebNotificationsPanel: Loading:', loading);
  console.log('🔍 WebNotificationsPanel: Cantidad de notificaciones:', notificaciones?.length || 0);

  // Verificar si las notificaciones están vacías o undefined
  if (!notificaciones || notificaciones.length === 0) {
    console.log('🔍 WebNotificationsPanel: No hay notificaciones disponibles');
  } else {
    console.log('🔍 WebNotificationsPanel: Primera notificación:', notificaciones[0]);
  }

  // Log adicional para verificar la visibilidad
  console.log('🔍 WebNotificationsPanel: Panel visible:', visible, 'isWeb:', isWeb);

  // Solo renderizar en web
  if (!isWeb) {
    console.log('🔍 WebNotificationsPanel: No es web, no renderizando');
    return null;
  }

  console.log('🔍 WebNotificationsPanel: Renderizando componente en web');

  // Obtener color de notificación
  const getNotificationColor = (tipo: string) => {
    switch (tipo) {
      case 'success': return '#10B981';
      case 'warning': return '#F59E0B';
      case 'error': return '#EF4444';
      case 'cambio_carrera': return '#3B82F6';
      default: return '#3B82F6';
    }
  };

  // Formatear timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} h`;
    return `${Math.floor(diffInMinutes / 1440)} d`;
  };

  // Manejar selección de notificación
  const handleNotificationPress = async (notification: any) => {
    console.log('🔍 WebNotificationsPanel: Notificación presionada:', notification);
    setSelectedNotification(notification);
    
    // Marcar como leída si no lo está
    if (!notification.leida) {
      await markAsRead(notification.id);
    }
    
    onNotificationPress?.(notification);
  };

  // Volver a la lista de notificaciones
  const handleBackToList = () => {
    setSelectedNotification(null);
  };

  // Componente para mostrar detalles de la notificación
  const NotificationDetailView: React.FC<{ notification: any }> = ({ notification }) => {
    const color = getNotificationColor(notification.tipo);
    
    return (
      <View style={styles.detailContainer}>
        <View style={styles.detailHeader}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBackToList}
            activeOpacity={0.7}
          >
            <RadixIcons.ArrowLeft size={20} color="#6B7280" />
          </TouchableOpacity>
          <View style={styles.detailHeaderContent}>
            <View style={[styles.detailIcon, { backgroundColor: color + '20' }]}>
              <RadixIcons.Bell size={24} color={color} />
            </View>
            <View style={styles.detailInfo}>
              <Text style={styles.detailTitle}>{notification.titulo}</Text>
              <Text style={styles.detailType}>
                {notification.tipo.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <RadixIcons.Close size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.detailContent} showsVerticalScrollIndicator={false}>
          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>Mensaje</Text>
            <View style={styles.detailDescriptionContainer}>
              <Text style={styles.detailDescription}>{notification.mensaje}</Text>
            </View>
          </View>

          {notification.datos_adicionales && (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Información Adicional</Text>
              <View style={styles.detailDataContainer}>
                {Object.entries(notification.datos_adicionales).map(([key, value]) => (
                  <View key={key} style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{key}:</Text>
                    <Text style={styles.detailValue}>{String(value)}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>Fecha</Text>
            <Text style={styles.detailTime}>
              {formatTimestamp(notification.created_at)}
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  };

  // Renderizar item de notificación
  const renderNotificationItem = ({ item }: { item: any }) => {
    const color = getNotificationColor(item.tipo);
    
    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          !item.leida && styles.unreadNotification
        ]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.notificationIcon, { backgroundColor: color + '20' }]}>
          <RadixIcons.Bell size={18} color={color} />
        </View>
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle} numberOfLines={1}>
            {item.titulo}
          </Text>
          <Text style={styles.notificationMessage} numberOfLines={2}>
            {item.mensaje}
          </Text>
          <View style={styles.notificationMeta}>
            <Text style={styles.notificationType}>
              {item.tipo.replace('_', ' ').toUpperCase()}
            </Text>
            <Text style={styles.notificationTime}>
              {formatTimestamp(item.created_at)}
            </Text>
          </View>
        </View>
        <RadixIcons.ChevronRight size={16} color="#9CA3AF" />
      </TouchableOpacity>
    );
  };

  console.log('🔍 WebNotificationsPanel: Visible:', visible);

  // Log para verificar si el panel se está mostrando
  if (visible) {
    console.log('🔍 WebNotificationsPanel: Panel debería estar visible');
  } else {
    console.log('🔍 WebNotificationsPanel: Panel debería estar oculto');
  }

  return (
    <View style={[styles.container, { display: visible ? 'flex' : 'none' }]}>
      {/* Backdrop */}
      <TouchableOpacity 
        style={styles.backdrop} 
        activeOpacity={1} 
        onPress={onClose} 
      />
      
      {/* Panel de notificaciones */}
      <View style={styles.panel}>
        {selectedNotification ? (
          // Vista de detalles de notificación
          <NotificationDetailView notification={selectedNotification} />
        ) : (
          // Vista de lista de notificaciones
          <>
            <View style={styles.header}>
              <Text style={styles.title}>Notificaciones</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <RadixIcons.Close size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.contentContainer}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <RadixIcons.Loading size={24} color="#3B82F6" />
                  <Text style={styles.loadingText}>Cargando notificaciones...</Text>
                </View>
              ) : (
                <FlatList
                  data={notificaciones}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={renderNotificationItem}
                  contentContainerStyle={styles.notificationsList}
                  showsVerticalScrollIndicator={true}
                  ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                      <RadixIcons.Bell size={48} color="#9CA3AF" />
                      <Text style={styles.emptyTitle}>No hay notificaciones</Text>
                      <Text style={styles.emptySubtitle}>
                        Cuando recibas notificaciones aparecerán aquí
                      </Text>
                    </View>
                  }
                />
              )}
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999999,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  panel: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 400,
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 1,
    borderLeftColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: -4,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    minHeight: 80,
    flexShrink: 0,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  },
  notificationsList: {
    padding: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  unreadNotification: {
    backgroundColor: '#F0F9FF',
    borderColor: '#3B82F6',
  },
  notificationIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  notificationMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationType: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  notificationTime: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  detailContainer: {
    flex: 1,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    minHeight: 80,
    flexShrink: 0,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 16,
  },
  detailIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  detailInfo: {
    flex: 1,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  detailType: {
    fontSize: 14,
    color: '#6B7280',
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  detailContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  detailDescriptionContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailDescription: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  detailDataContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  detailTime: {
    fontSize: 14,
    color: '#6B7280',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
});

export default WebNotificationsPanel; 