import { GestionPeticiones } from '@/components/cambioCarrera/GestionPeticiones';
import { ThemedView } from '@/components/ThemedView';
import React from 'react';

export default function GestionPeticionesScreen() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <GestionPeticiones />
    </ThemedView>
  );
} 