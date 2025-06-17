import GoogleButton from '@/components/ui/GoogleButton';
import { Input } from '@/components/ui/Input';
import Logo from '@/components/ui/Logo';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { useGoogleLoginHandler } from '@/hooks/auth/useGoogleLogin';
import { supabase } from '@/services/supabase/supaConf';
import { useSessionStore } from '@/store/session/sessionStore';
import { User as SupabaseUser } from '@supabase/supabase-js'; // Assuming User type might be needed
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { styles } from '../../style/loginScreen';

// Define a type for our user profile data
type UserProfile = {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
};

export default function LoginScreen() {
  const { promptAsync } = useGoogleLoginHandler();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const setSession = useSessionStore(state => state.setSession);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, email, name, avatarUrl')
          .limit(10); // Limiting to 10 profiles for now

        if (error) {
          console.error('Error fetching profiles:', error.message);
          // Don't show an alert, just log, as it's not critical for login if it fails
          return;
        }
        if (data) {
          setProfiles(data as UserProfile[]);
          console.log('Profiles fetched:', data);
        }
      } catch (err: any) {
        console.error('Exception fetching profiles:', err.message);
      }
    };

    fetchProfiles();
  }, []);

  const handleProfileSelect = (profile: UserProfile) => {
    setEmail(profile.email);
    setSelectedProfile(profile);
    setPassword(''); // Clear password when a new profile is selected
    console.log('Profile selected:', profile.email);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor ingresa tu correo y contraseña.');
      return;
    }

    console.log('Attempting login with:', email); // Test log

    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.trim().toLowerCase());

      if (error) {
        console.error('Error fetching user:', error.message);
        Alert.alert('Error', 'Ocurrió un error al intentar iniciar sesión.');
        return;
      }

      if (!users || users.length === 0) {
        console.log('Login failed: Email not found', email); // Test log
        Alert.alert('Error', 'Correo o contraseña incorrectos.');
        return;
      }

      const user = users[0];

      // IMPORTANT: Direct password comparison (temporary for this step)
      // In a real app, passwords MUST be hashed and compared using a secure method.
      if (user.password !== password) {
        console.log('Login failed: Incorrect password for email', email); // Test log
        Alert.alert('Error', 'Correo o contraseña incorrectos.');
        return;
      }

      console.log('Login successful for:', email); // Test log
      // Assuming user object from Supabase has email, name, avatarUrl
      setSession({
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl
      });

      // TODO: Navigate to the main app screen
      Alert.alert('Éxito', 'Inicio de sesión exitoso!'); // Placeholder for navigation

    } catch (err: any) {
      console.error('Login exception:', err.message);
      Alert.alert('Error', 'Ocurrió un error inesperado.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Logo />
        <Text style={styles.brand}>UniverMilenium</Text>
      </View>

      {profiles.length > 0 && (
        <View style={localStyles.profilesContainer}>
          <Text style={localStyles.profilesTitle}>O inicia sesión como:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={localStyles.profilesScroll}>
            {profiles.map((profile) => (
              <TouchableOpacity
                key={profile.id}
                style={[
                  localStyles.profileCard,
                  selectedProfile?.id === profile.id && localStyles.selectedProfileCard,
                ]}
                onPress={() => handleProfileSelect(profile)}
              >
                <Image source={{ uri: profile.avatarUrl || undefined }} style={localStyles.profileAvatar} />
                <Text style={localStyles.profileName}>{profile.name || profile.email.split('@')[0]}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <Text style={styles.title}>Inicio de Sesión</Text>

      <Input
        placeholder="Correo Electrónico"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (selectedProfile && text !== selectedProfile.email) {
            setSelectedProfile(null); // Deselect profile if email is manually changed
          }
        }}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Input
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Pressable>
        <Text style={styles.forgot}>¿Olvidaste tu contraseña?</Text>
      </Pressable>

      <PrimaryButton label="Log in" onPress={handleLogin} />

      <Text style={styles.or}>ó</Text>

      <GoogleButton onPress={() => promptAsync()} />

      <Pressable style={styles.ghostButton}>
        <Text style={styles.ghostText}>Ingreso Temporal</Text>
      </Pressable>
    </ScrollView>
  );
}

const localStyles = StyleSheet.create({
  profilesContainer: {
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  profilesTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  profilesScroll: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  profileCard: {
    alignItems: 'center',
    marginHorizontal: 10,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    width: 100, // Fixed width for each card
  },
  selectedProfileCard: {
    borderColor: '#007bff', // Highlight color for selected profile
    backgroundColor: '#e7f3ff',
  },
  profileAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 8,
    backgroundColor: '#eee', // Placeholder background
  },
  profileName: {
    fontSize: 12,
    textAlign: 'center',
    color: '#333',
  },
});
