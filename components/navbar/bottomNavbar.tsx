import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { navbarStyles } from '../../style/navbar';

export default function BottomNavbar() {
  return (
    <View style={navbarStyles.bottomContainer}>
      <Text style={navbarStyles.menuItem}>Inicio</Text>
      <Text style={navbarStyles.menuItem}>Clientes</Text>
      <Text style={navbarStyles.menuItem}>Registros</Text>
      <Text style={navbarStyles.menuItem}>Usuarios</Text>
      <Text style={navbarStyles.menuItem}>Perfil</Text>
    </View>
  );
}
