import { useNotifications } from '@/hooks/notifications/useNotifications';
import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

export const NotificationsPanel: React.FC<{ onClose?: () => void, onNotificationPress?: (notificacion: any) => void }> = ({ onClose, onNotificationPress }) => {
  const { notificaciones, loading, markAsRead } = useNotifications();

  const handleNotificationPress = async (notification: any) => {
    // Marcar como leída si no lo está
    if (!notification.leida) {
      await markAsRead(notification.id);
    }
    
    onNotificationPress?.(notification);
  };

  if (loading) return <Text>Cargando notificaciones...</Text>;

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 20 }}>Notificaciones</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
            <Text style={{ fontSize: 20 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={notificaciones}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleNotificationPress(item)}
            style={{
              backgroundColor: item.leida ? '#f1f1f1' : '#e0f7fa',
              borderRadius: 8,
              padding: 12,
              marginBottom: 8
            }}>
            <Text style={{ fontWeight: 'bold' }}>{item.titulo}</Text>
            <Text>{item.mensaje}</Text>
            <Text style={{ fontSize: 12, color: '#888' }}>{new Date(item.created_at).toLocaleString()}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}; 