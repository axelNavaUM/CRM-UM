import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/hooks/notifications/useNotifications';
import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import RadixIcons from './RadixIcons';
import ResponsiveNotifications from './ResponsiveNotifications';
import ResponsiveSearch from './ResponsiveSearch';

const MobileHeader: React.FC = () => {
  const [searchVisible, setSearchVisible] = useState(false);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  
  const { user } = useAuth();
  const { notificaciones, getUnreadCount } = useNotifications();

  // Función para obtener las iniciales del usuario
  const getUserInitials = () => {
    if (!user?.email) return 'U';
    const emailParts = user.email.split('@')[0];
    const nameParts = emailParts.split('.');
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0).toUpperCase()}${nameParts[1].charAt(0).toUpperCase()}`;
    }
    return emailParts.charAt(0).toUpperCase();
  };

  // Función para obtener el nombre del usuario
  const getUserName = () => {
    if (!user?.email) return 'Usuario';
    const emailParts = user.email.split('@')[0];
    const nameParts = emailParts.split('.');
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0).toUpperCase()}${nameParts[0].slice(1)} ${nameParts[1].charAt(0).toUpperCase()}${nameParts[1].slice(1)}`;
    }
    return emailParts.charAt(0).toUpperCase() + emailParts.slice(1);
  };

  // Obtener notificaciones no leídas
  const unreadCount = getUnreadCount();

  return (
    <View style={styles.container}>
      {/* Header Principal */}
      <View style={styles.header}>
        {/* Botones de acción */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setSearchVisible(true)}
            activeOpacity={0.7}
          >
            <RadixIcons.Search size={20} color="#374151" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setNotificationsVisible(true)}
            activeOpacity={0.7}
          >
            <RadixIcons.Bell size={20} color="#374151" />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Perfil del usuario */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getUserInitials()}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName} numberOfLines={1}>
              {getUserName()}
            </Text>
            <Text style={styles.profileEmail} numberOfLines={1}>
              {user?.email || 'usuario@um.edu.mx'}
            </Text>
          </View>
        </View>
      </View>

      {/* Componente de Búsqueda */}
      <ResponsiveSearch
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
      />

      {/* Componente de Notificaciones */}
      <ResponsiveNotifications
        visible={notificationsVisible}
        onClose={() => setNotificationsVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 44,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  profileInfo: {
    flex: 1,
    maxWidth: 150,
  },
  profileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 11,
    color: '#6B7280',
  },
});

export default MobileHeader; 