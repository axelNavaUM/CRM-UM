import RadixIcons from '@/components/ui/RadixIcons';
import React, { useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface NavItem {
  id: string;
  label: string;
  icon: keyof typeof RadixIcons;
  route: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Inicio', icon: 'Home', route: '/home' },
  { id: 'students', label: 'Alumnos', icon: 'Students', route: '/students' },
  { id: 'users', label: 'Usuarios', icon: 'Users', route: '/users' },
  { id: 'reports', label: 'Reportes', icon: 'Reports', route: '/reports' },
  { id: 'settings', label: 'Config', icon: 'Settings', route: '/settings' },
];

interface ModernNavbarProps {
  activeTab?: string;
  onTabPress?: (tabId: string) => void;
}

const ModernNavbar: React.FC<ModernNavbarProps> = ({ 
  activeTab = 'home', 
  onTabPress 
}) => {
  const [scaleAnim] = useState(new Animated.Value(1));

  const handleTabPress = (tabId: string) => {
    // Animación de escala al presionar
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onTabPress?.(tabId);
  };

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        {NAV_ITEMS.map((item) => {
          const IconComponent = RadixIcons[item.icon];
          const isActive = activeTab === item.id;
          
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.navItem, isActive && styles.activeNavItem]}
              onPress={() => handleTabPress(item.id)}
              activeOpacity={0.7}
            >
              <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
                <IconComponent
                  size={24}
                  color={isActive ? '#3B82F6' : '#6B7280'}
                />
              </Animated.View>
              <Text style={[styles.navLabel, isActive && styles.activeNavLabel]}>
                {item.label}
              </Text>
              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: 20,
    paddingTop: 10,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    position: 'relative',
    minWidth: 60,
  },
  activeNavItem: {
    backgroundColor: '#F0F9FF',
  },
  navLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '500',
  },
  activeNavLabel: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3B82F6',
  },
});

export default ModernNavbar; 