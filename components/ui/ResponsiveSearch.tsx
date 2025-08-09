import React from 'react';
import { Platform } from 'react-native';
import MobileSearch from './MobileSearch';
import WebSearch from './WebSearch';

interface ResponsiveSearchProps {
  visible: boolean;
  onClose: () => void;
  onResultPress?: (result: any) => void;
}

const ResponsiveSearch: React.FC<ResponsiveSearchProps> = (props) => {
  // En web, usar el componente de aside
  if (Platform.OS === 'web') {
    return <WebSearch {...props} />;
  }
  
  // En móvil, usar el componente modal
  return <MobileSearch {...props} />;
};

export default ResponsiveSearch; 