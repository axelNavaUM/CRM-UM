import { Platform } from 'react-native';

export const usePlatform = () => {
  const isWeb = Platform.OS === 'web';
  const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';
  
  console.log('🔍 usePlatform: Platform.OS:', Platform.OS, 'isWeb:', isWeb, 'isMobile:', isMobile);
  
  return {
    isWeb,
    isMobile,
    platform: Platform.OS
  };
}; 