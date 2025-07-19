import React, { useState } from 'react';
import {
  Image,
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

const Header = ({ darkMode, notificationCount }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const { width } = useWindowDimensions();
  const isMobile = width < 600;

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
        <TouchableOpacity style={styles.iconButton}>
          <Icon name="bell" size={24} color="#fff" />
          {notificationCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>{notificationCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Avatar */}
        <TouchableOpacity>
          <Image
            source={{ uri: 'https://example.com/profile.jpg' }}
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const NavTab = ({ icon, label, active }) => (
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
    backgroundColor: 'red',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
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
    borderWidth: 1,
    borderColor: '#444',
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
});

export default Header;
