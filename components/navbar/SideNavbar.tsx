import React from 'react';
import { Image, Text, View } from 'react-native';
import { navbarStyles } from '../../style/navbar';

export default function SideNavbar() {
  return (
    <View style={navbarStyles.sideContainer}>
      <View style={navbarStyles.userSection}>
        <Image
          style={navbarStyles.avatar}
          source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDH32...' }}
        />
<Text style={navbarStyles.title}>Universidad</Text>
      </View>

      <View style={navbarStyles.menu}>
        <Text style={navbarStyles.menuItem}>Inicio</Text>
        <Text style={navbarStyles.menuItem}>Clientes</Text>
        <Text style={navbarStyles.menuItem}>Registros</Text>
        <Text style={navbarStyles.menuItem}>Usuarios</Text>
        <Text style={navbarStyles.menuItem}>Perfil</Text>
      </View>

      <Text style={navbarStyles.footer}>Ayuda y Feedback</Text>
    </View>
  );
}
