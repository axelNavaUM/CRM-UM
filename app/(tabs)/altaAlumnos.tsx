import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import Header from '@/components/inicio/Header';
import { Input } from '@/components/ui/Input';
import PrimaryButton from '@/components/ui/PrimaryButton';
import RegisterDocument from '@/components/docRT/documento'; // ajusta la ruta si es necesario

const ClientRegisterScreen = () => {
  const { width } = useWindowDimensions(); // ← se obtiene ANTES de usar isMobile
  const isMobile = width < 768;

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={styles.safe}>
      <Header title="Inicio" notificationCount={3} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.container, isMobile && styles.mobile]}>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Registro de Cliente</Text>

            <View style={styles.progressContainer}>
              <Text style={styles.stepText}>Paso 1 de 4</Text>
              <View style={styles.progressBar}>
                <View style={styles.progressFill} />
              </View>
            </View>

            <Input
              placeholder="Nombre"
              value={nombre}
              onChangeText={setNombre}
            />
            <Input
              placeholder="Apellido"
              value={apellido}
              onChangeText={setApellido}
            />
            <Input
              placeholder="Correo electrónico"
              value={correo}
              onChangeText={setCorreo}
              keyboardType="email-address"
            />
            <Input
              placeholder="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <PrimaryButton 
             label={"Siguiente"}
             onPress={() => {}} />
          </View>

          {/* Documento dinámico */}
          {!isMobile && (
            <RegisterDocument
              studentName={nombre}
              studentLastName={apellido}
              email={correo}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scroll: {
    padding: 20,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mobile: {
    flexDirection: 'column',
  },
  formContainer: {
    flex: 1,
    marginRight: 24,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#121417',
  },
  progressContainer: {
    marginBottom: 24,
    width: 280,
  },
  stepText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#121417',
  },
  progressBar: {
    height: 4,
    width: '100%',
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
  },
  progressFill: {
    width: '25%',
    height: 4,
    backgroundColor: '#121417',
    borderRadius: 2,
  },
});

export default ClientRegisterScreen;
