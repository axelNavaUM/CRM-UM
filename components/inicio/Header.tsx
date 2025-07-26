import { NotificationsPanel } from '@/components/notifications/NotificationsPanel';
import { useAuth } from '@/context/AuthContext';
import { useLogout } from '@/hooks/auth/useLogout';
import { useCambioCarrera } from '@/hooks/cambioCarrera/useCambioCarrera';
import { useUsuarioStore } from '@/store/usuario/usuario';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const NAV_ITEMS = [
  { icon: 'view-grid', label: 'Inicio' },
  { icon: 'fire', label: 'Actividades' },
  { icon: 'heart', label: 'Alta' },
  { icon: 'calendar', label: 'Cambio de Carrera' },
];

interface HeaderProps {
  darkMode: boolean;
}

interface NavTabProps {
  icon: string;
  label: string;
  active: boolean;
}

const Header: React.FC<HeaderProps> = ({ darkMode }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const { width } = useWindowDimensions();
  const isMobile = width < 600;
  const { user } = useAuth();
  const { notificacionesNoLeidas } = useCambioCarrera(user);
  const { setUsuario } = useUsuarioStore();
  const { logout } = useLogout();

  // Función para obtener las iniciales del usuario
  const getUserInitials = () => {
    if (!user?.email) return 'U';
    
    // Buscar el usuario en la base de datos para obtener nombre y apellido
    // Por ahora usamos el email como fallback
    const emailParts = user.email.split('@')[0];
    const nameParts = emailParts.split('.');
    
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0).toUpperCase()}${nameParts[1].charAt(0).toUpperCase()}`;
    }
    
    return emailParts.charAt(0).toUpperCase();
  };

  // Función para manejar la configuración
  const handleConfig = () => {
    Alert.alert('Configuración', 'Función de configuración en desarrollo');
    setProfileMenuVisible(false);
  };

  return (
    <View style={[styles.container, isMobile && styles.containerMobile]}>
      {/* NAVIGATION TABS O MENÚ */}
      {isMobile ? (
        <>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setMenuVisible(true)}
          >
            <Icon name="menu" size={20} color="#fff" />
            <Text style={styles.menuButtonText}>Menú</Text>
          </TouchableOpacity>

          <Modal
            transparent
            animationType="fade"
            visible={menuVisible}
            onRequestClose={() => setMenuVisible(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPressOut={() => setMenuVisible(false)}
            >
              <View style={styles.modalMenu}>
                {NAV_ITEMS.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.modalItem}
                    onPress={() => {
                      setMenuVisible(false);
                      // manejar navegación aquí si usas react-navigation
                    }}
                  >
                    <Icon name={item.icon} size={18} color="#fff" />
                    <Text style={styles.modalItemText}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Modal>
        </>
      ) : (
        <View style={styles.tabsContainer}>
          {NAV_ITEMS.map((item, index) => (
            <NavTab
              key={index}
              icon={item.icon}
              label={item.label}
              active={index === 0}
            />
          ))}
        </View>
      )}

      {/* RIGHT SIDE */}
      <View style={styles.rightContainer}>
        {/* Toggle */}
        <View style={styles.themeToggle}>
          <Icon name="white-balance-sunny" size={16} color="#fff" />
          <View style={styles.toggleCircle}>
            <Icon
              name={darkMode ? 'moon-waning-crescent' : 'white-balance-sunny'}
              size={16}
              color="#000"
            />
          </View>
        </View>

        {/* Notification */}
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => setNotificationsVisible(true)}
        >
          <Icon name="bell" size={24} color="#000000" />
          {notificacionesNoLeidas > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>
                {notificacionesNoLeidas > 99 ? '99+' : notificacionesNoLeidas}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Avatar con iniciales */}
        <View style={styles.profileContainer}>
          <TouchableOpacity 
            onPress={() => {
              setProfileMenuVisible(!profileMenuVisible);
            }}
            style={styles.avatarButton}
            activeOpacity={0.5}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getUserInitials()}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal del menú del perfil */}
      <Modal
        visible={profileMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setProfileMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.profileModalOverlay}
          activeOpacity={1}
          onPress={() => setProfileMenuVisible(false)}
        >
          <View style={styles.profileMenuModal}>
            <TouchableOpacity 
              style={styles.profileMenuItem}
              onPress={handleConfig}
            >
              <Icon name="cog" size={16} color="#374151" />
              <Text style={styles.profileMenuItemText}>Config</Text>
            </TouchableOpacity>
            
            <View style={styles.profileMenuDivider} />
            
            <TouchableOpacity 
              style={styles.profileMenuItem}
              onPress={async () => {
                console.log('🔘 Botón Logout presionado');
                setIsLoggingOut(true);
                setProfileMenuVisible(false);
                try {
                  await logout();
                } catch (error) {
                  console.error('Error durante logout:', error);
                  setIsLoggingOut(false);
                }
              }}
              disabled={isLoggingOut}
            >
              <Icon name="logout" size={16} color="#EF4444" />
              <Text style={[styles.profileMenuItemText, styles.logoutText]}>
                {isLoggingOut ? 'Cerrando...' : 'Logout'}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal de Notificaciones */}
      <Modal
        visible={notificationsVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setNotificationsVisible(false)}
      >
        <NotificationsPanel
          onClose={() => setNotificationsVisible(false)}
          onNotificationPress={(notificacion) => setSelectedNotification(notificacion)}
        />
      </Modal>

      {/* Modal para detalle de notificación */}
      <Modal
        visible={!!selectedNotification}
        animationType="slide"
        onRequestClose={() => setSelectedNotification(null)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 22 }}>{selectedNotification?.titulo}</Text>
          <Text style={{ marginVertical: 12 }}>{selectedNotification?.mensaje}</Text>
          {/* Mostrar detalles adicionales si existen */}
          {selectedNotification?.datos_adicionales && (
            <Text style={{ fontSize: 14, color: '#555', marginBottom: 12 }}>
              {JSON.stringify(selectedNotification.datos_adicionales, null, 2)}
            </Text>
          )}
          <TouchableOpacity onPress={() => setSelectedNotification(null)} style={{ marginTop: 24 }}>
            <Text style={{ color: '#007AFF', fontSize: 18 }}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const NavTab: React.FC<NavTabProps> = ({ icon, label, active }) => (
  <TouchableOpacity style={[styles.tab, active && styles.activeTab]}>
    <Icon name={icon} size={16} color={active ? '#000' : '#fff'} />
    <Text style={[styles.tabLabel, active && styles.activeLabel]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent', // blur o transparente
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  containerMobile: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30, // Espacio para la barra de notificaciones
    paddingBottom: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e7edf3',
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#fff',
  },
  tabLabel: {
    color: '#fff',
    marginLeft: 6,
    fontSize: 13,
  },
  activeLabel: {
    color: '#000',
    fontWeight: 'bold',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
  },
  toggleCircle: {
    backgroundColor: '#fff',
    padding: 4,
    borderRadius: 12,
  },
  iconButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  profileContainer: {
    position: 'relative',
    zIndex: 1000, // Asegurar que esté por encima de otros elementos
  },
  profileMenu: {
    position: 'absolute',
    top: 50,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 120,
    zIndex: 9999,
    borderWidth: 2,
    borderColor: '#EF4444', // Borde rojo temporal para debug
  },
  profileMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  profileMenuItemText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#374151',
  },
  profileMenuDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  logoutText: {
    color: '#EF4444',
  },
  profileMenuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  menuButtonText: {
    color: '#fff',
    marginLeft: 6,
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  modalMenu: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 10,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
  },
  modalItemText: {
    color: '#fff',
    fontSize: 14,
  },
  avatarButton: {
    // Estilos para hacer el área de toque más visible
    padding: 8,
    borderRadius: 20,
  },
  profileModalOverlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    backgroundColor: 'transparent', // Quitar el fondo oscuro
    paddingTop: 80,
    paddingRight: 20,
  },
  profileMenuModal: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 120,
    zIndex: 9999,
    // Quitar el borde rojo
  },
});

export default Header;
