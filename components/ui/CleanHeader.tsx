import RadixIcons from '@/components/ui/RadixIcons';
import { useAuth } from '@/context/AuthContext';
import { useSearch } from '@/context/SearchContext';
import React, { useState } from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native';

interface CleanHeaderProps {
  title?: string;
  showSearch?: boolean;
  showNotifications?: boolean;
  showProfile?: boolean;
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
}

const CleanHeader: React.FC<CleanHeaderProps> = ({
  title = 'CRM UM',
  showSearch = true,
  showNotifications = true,
  showProfile = true,
  onSearchPress,
  onNotificationPress,
  onProfilePress,
}) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;
  const { isSearchVisible, openSearch } = useSearch();
  const { user } = useAuth();
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);

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

  const handleSearchPress = () => {
    if (onSearchPress) {
      onSearchPress();
    } else {
      openSearch();
    }
  };

  const handleNotificationPress = () => {
    if (onNotificationPress) {
      onNotificationPress();
    }
  };

  const handleProfilePress = () => {
    if (onProfilePress) {
      onProfilePress();
    } else {
      setProfileMenuVisible(!profileMenuVisible);
    }
  };

  return (
    <View style={[styles.container, isMobile && styles.containerMobile]}>
      {/* Logo y título */}
      <View style={styles.leftSection}>
        <View style={styles.logoContainer}>
          <RadixIcons.CRM size={24} color="#3B82F6" />
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>

      {/* Acciones del lado derecho */}
      <View style={styles.rightSection}>
        {/* Botón de búsqueda */}
        {showSearch && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleSearchPress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <RadixIcons.Search size={20} color="#6B7280" />
          </TouchableOpacity>
        )}

        {/* Botón de notificaciones */}
        {showNotifications && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleNotificationPress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <RadixIcons.Bell size={20} color="#6B7280" />
            {/* Badge de notificaciones */}
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Avatar del usuario */}
        {showProfile && (
          <TouchableOpacity
            style={styles.profileButton}
            onPress={handleProfilePress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getUserInitials()}</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Menú del perfil */}
      {profileMenuVisible && (
        <View style={styles.profileMenu}>
          <TouchableOpacity style={styles.profileMenuItem}>
            <RadixIcons.Profile size={16} color="#374151" />
            <Text style={styles.profileMenuItemText}>Mi Perfil</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.profileMenuItem}>
            <RadixIcons.Settings size={16} color="#374151" />
            <Text style={styles.profileMenuItemText}>Configuración</Text>
          </TouchableOpacity>
          
          <View style={styles.profileMenuDivider} />
          
          <TouchableOpacity style={styles.profileMenuItem}>
            <RadixIcons.Logout size={16} color="#EF4444" />
            <Text style={[styles.profileMenuItemText, styles.logoutText]}>
              Cerrar Sesión
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  containerMobile: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 16,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionButton: {
    position: 'relative',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  profileMenu: {
    position: 'absolute',
    top: 70,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 160,
    zIndex: 1000,
  },
  profileMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 10,
  },
  profileMenuItemText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  profileMenuDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  logoutText: {
    color: '#EF4444',
  },
});

export default CleanHeader; 