import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import GoogleButton from '@/components/ui/GoogleButton';
import { Input } from '@/components/ui/Input';
import Logo from '@/components/ui/Logo';
import PrimaryButton from '@/components/ui/PrimaryButton';

import { useAuthLogin } from '@/hooks/auth/authLogin';
import { useGoogleLoginHandler } from '@/hooks/auth/useGoogleLogin';

import { styles } from '../../style/loginScreen';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Hook que maneja toda la lógica de React (estado, navegación, etc.)
  const { handleLogin, isLoading } = useAuthLogin();
  const { promptAsync } = useGoogleLoginHandler();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Logo />
        <Text style={styles.brand}>UniverMilenium</Text>
      </View>

      <Text style={styles.title}>Inicio de Sesión</Text>

      <Input 
        placeholder="Usuario" 
        value={username} 
        onChangeText={setUsername}
        editable={!isLoading}
      />
      <Input 
        placeholder="Contraseña" 
        value={password} 
        onChangeText={setPassword} 
        secureTextEntry
        editable={!isLoading}
      />

      <Pressable>
        <Text style={styles.forgot}>¿Olvidaste tu contraseña?</Text>
      </Pressable>

      <PrimaryButton 
        label={isLoading ? "Iniciando sesión..." : "Log in"}
        onPress={() => handleLogin(username, password)}
        disabled={isLoading}
      />

      <Text style={styles.or}>ó</Text>

      <GoogleButton 
        onPress={() => promptAsync()} 
        disabled={isLoading}
      />

      <Pressable style={styles.ghostButton} disabled={isLoading}>
        <Text style={styles.ghostText}>Ingreso Temporal</Text>
      </Pressable>
    </ScrollView>
  );
}