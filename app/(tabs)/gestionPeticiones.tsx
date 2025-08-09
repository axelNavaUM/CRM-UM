import { GestionPeticiones } from '@/components/cambioCarrera/GestionPeticiones';
import { ThemedView } from '@/components/ThemedView';
import MobileNativeHeaderActions from '@/components/ui/MobileNativeHeaderActions';
import { ScreenAccessControl } from '@/components/ui/ScreenAccessControl';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { useWindowDimensions } from 'react-native';

const GestionPeticionesContent = () => {
  return (
    <ThemedView style={{ flex: 1 }}>
      <GestionPeticiones />
    </ThemedView>
  );
};

const GestionPeticionesScreen = () => {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const RightActions = () => <MobileNativeHeaderActions />;
  const isMobile = width < 768;

  return (
    <>
      {isMobile && (
        <Stack.Screen options={{ headerShown: false }} />
      )}
      <ScreenAccessControl requiredScreen="gestionPeticiones" fallbackScreen="/(tabs)/notificaciones">
        <GestionPeticionesContent />
      </ScreenAccessControl>
    </>
  );
};

export default GestionPeticionesScreen; 