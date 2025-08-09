import RadixIcons from '@/components/ui/RadixIcons';
import { useAuth } from '@/context/AuthContext';
import { useSearch } from '@/context/SearchContext';
import { useLogout } from '@/hooks/auth/useLogout';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

const getInitials = (email?: string) => {
  if (!email) return 'U';
  const userPart = email.split('@')[0];
  const parts = userPart.split('.');
  if (parts.length >= 2) return `${parts[0][0]?.toUpperCase() || ''}${parts[1][0]?.toUpperCase() || ''}`;
  return userPart[0]?.toUpperCase() || 'U';
};

export const MobileNativeHeaderActions: React.FC = () => {
  const router = useRouter();
  const { openSearch } = useSearch();
  const { user } = useAuth();
  const { logout } = useLogout();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <TouchableOpacity onPress={openSearch} style={{ paddingHorizontal: 8 }}>
        <RadixIcons.Search size={20} color="#111827" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/(tabs)/notificaciones' as any)} style={{ paddingHorizontal: 8 }}>
        <RadixIcons.Bell size={20} color="#111827" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setMenuOpen(true)} style={{ paddingHorizontal: 8 }}>
        <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>{getInitials(user?.email)}</Text>
        </View>
      </TouchableOpacity>

      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setMenuOpen(false)}>
          <View style={{ position: 'absolute', top: 56, right: 12, backgroundColor: '#fff', borderRadius: 8, padding: 8, elevation: 5, borderWidth: 1, borderColor: '#E5E7EB' }}>
            <Text style={{ fontWeight: '600', marginBottom: 8 }}>{user?.email || 'Usuario'}</Text>
            <TouchableOpacity onPress={async () => { setMenuOpen(false); await logout(); router.replace('/loginScreen' as any); }} style={{ paddingVertical: 8 }}>
              <Text style={{ color: '#EF4444', fontWeight: '600' }}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default MobileNativeHeaderActions;

