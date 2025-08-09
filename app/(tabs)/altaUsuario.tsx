import { ScreenAccessControl } from '@/components/ui/ScreenAccessControl';
import TabNavigation, { TabItem } from '@/components/ui/TabNavigation';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import AreasManager from '../altaUsuariosUM/areasManager/AreasManager';
import PermisosManager from '../altaUsuariosUM/permisosManager/PermisosManager';
import UsuariosManager from '../altaUsuariosUM/usuariosManager/UsuariosManager';

const tabs: TabItem[] = [
  {
    id: 'empleados',
    label: 'Empleados',
    icon: '👥'
  },
  {
    id: 'puestos',
    label: 'Puestos',
    icon: '💼'
  },
  {
    id: 'permisos',
    label: 'Roles y Permisos',
    icon: '🛡️'
  }
];

const AltaUsuarioContent = () => {
  const [activeTab, setActiveTab] = useState('empleados');

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'empleados':
        return <UsuariosManager />;
      case 'puestos':
        return <AreasManager />;
      case 'permisos':
        return <PermisosManager />;
      default:
        return <UsuariosManager />;
    }
  };

  return (
    <View style={styles.container}>
       {renderActiveComponent()}
      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
     
    </View>
  );
};

const AltaUsuario = () => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  return (
    <>
      {isMobile && (
        <Stack.Screen options={{ headerShown: false }} />
      )}
      <ScreenAccessControl requiredScreen="altaUsuario" fallbackScreen="/">
        <AltaUsuarioContent />
      </ScreenAccessControl>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});

export default AltaUsuario;