// ===========================================
// 2. hooks/auth/usePasswordReset.ts (Ejemplo adicional)
// ===========================================
import { useState } from 'react';
import { Alert } from 'react-native';
import { passwordResetController } from '@/controller/auth/authController';

export const usePasswordReset = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordReset = async (email: string) => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email.');
      return;
    }

    setIsLoading(true);
    try {
      await passwordResetController(email); // Llama al controller
      Alert.alert('Success', 'Password reset email sent!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handlePasswordReset,
    isLoading,
  };
};