import { useNotifications } from '@/hooks/notifications/useNotifications';
import React, { useState } from 'react';
import {
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import RadixIcons from './RadixIcons';

interface NotificationsAsideContentProps {
  onClose: () => void;
}

const NotificationsAsideContent: React.FC<NotificationsAsideContentProps> = ({ onClose }) => {
  const { notificaciones, loading, markAsRead } = useNotifications();
  const [selectedNotification, setSelectedNotification] = useState<any>(null);

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
    setSelectedNotification(notification);
    
    // Marcar como leída si no lo está
    if (!notification.leida) {
      await markAsRead(notification.id);
    }
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

  if (selectedNotification) {
    return <NotificationDetailView notification={selectedNotification} />;
  }

  return (
    <View style={styles.container}>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  notificationsList: {
    padding: 16,
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
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  detailHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
});

export default NotificationsAsideContent; 