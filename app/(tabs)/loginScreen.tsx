import GoogleButton from '@/components/ui/GoogleButton';
import { Input } from '@/components/ui/Input';
import Logo from '@/components/ui/Logo';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { useGoogleLoginHandler } from '@/hooks/auth/useGoogleLogin';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { styles } from '../../style/loginScreen';

export default function LoginScreen() {
  const { promptAsync } = useGoogleLoginHandler();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Logo />
        <Text style={styles.brand}>UniverMilenium</Text>
      </View>

      <Text style={styles.title}>Inicio de Sesión</Text>

      <Input placeholder="Usuario" />
      <Input placeholder="Contraseña" secureTextEntry />

      <Pressable>
        <Text style={styles.forgot}>¿Olvidaste tu contraseña?</Text>
      </Pressable>

      <PrimaryButton label="Log in" onPress={() => {}} />

      <Text style={styles.or}>ó</Text>

      <GoogleButton onPress={() => promptAsync()} />

      <Pressable style={styles.ghostButton}>
        <Text style={styles.ghostText}>Ingreso Temporal</Text>
      </Pressable>
    </ScrollView>
  );
}
