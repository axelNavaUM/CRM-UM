import GoogleButton from '@/components/ui/GoogleButton';
import { Input } from '@/components/ui/Input';
import Logo from '@/components/ui/Logo';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { useAuth } from '@/context/AuthContext';
import { styles } from '@/style/loginScreen';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

export default function LoginScreen() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    console.log('🔐 Intentando login con:', email);
    setError(null);
    try {
      await login(email, password);
      console.log('🔐 Login exitoso, redirección automática');
      // Redirección automática la maneja el layout si la sesión está activa
    } catch (err: any) {
      console.error('🔐 Error en login:', err);
      setError(err.message || 'Error al iniciar sesión');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Logo />
        <Text style={styles.brand}>UniverMilenium</Text>
      </View>
      <Text style={styles.title}>Inicio de Sesión</Text>
      <Input
        placeholder="Usuario"
        value={email}
        onChangeText={setEmail}
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
      {error && <Text style={styles.error}>{error}</Text>}
      <PrimaryButton
        label={isLoading ? 'Iniciando sesión...' : 'Log in'}
        onPress={handleLogin}
        disabled={isLoading}
      />
      <Text style={styles.or}>ó</Text>
      <GoogleButton onPress={() => {}} disabled={isLoading} />
      <Pressable style={styles.ghostButton} disabled={isLoading}>
        <Text style={styles.ghostText}>Ingreso Temporal</Text>
      </Pressable>
    </ScrollView>
  );
}