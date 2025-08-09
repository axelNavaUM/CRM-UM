import * as LocalAuthentication from 'expo-local-authentication';
import { useState } from 'react';
import { Alert } from 'react-native';

export const useBiometricAuth = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('');

  const checkBiometricAvailability = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

      if (hasHardware && isEnrolled) {
        setIsAvailable(true);
        
        // Determinar el tipo de biometría disponible
        if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('Face ID');
        } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType('Touch ID');
        } else {
          setBiometricType('Biometría');
        }
      } else {
        setIsAvailable(false);
      }
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      setIsAvailable(false);
    }
  };

  const authenticateWithBiometrics = async (): Promise<boolean> => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Autentícate para firmar',
        fallbackLabel: 'Usar contraseña',
        cancelLabel: 'Cancelar',
        disableDeviceFallback: false,
      });

      return result.success;
    } catch (error) {
      console.error('Error during biometric authentication:', error);
      Alert.alert('Error', 'No se pudo autenticar con biometría');
      return false;
    }
  };

  const authenticateWithPassword = async (password: string): Promise<boolean> => {
    // Aquí iría la lógica de autenticación con contraseña
    // Por ahora simulamos una validación básica
    return password.length >= 6;
  };

  return {
    isAvailable,
    biometricType,
    checkBiometricAvailability,
    authenticateWithBiometrics,
    authenticateWithPassword,
  };
}; 