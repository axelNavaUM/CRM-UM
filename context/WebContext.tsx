import { usePlatform } from '@/hooks/usePlatform';
import React, { createContext, ReactNode, useContext, useState } from 'react';

interface WebContextType {
  isNotificationsVisible: boolean;
  isSearchVisible: boolean;
  openNotifications: () => void;
  closeNotifications: () => void;
  openSearch: () => void;
  closeSearch: () => void;
}

const WebContext = createContext<WebContextType | undefined>(undefined);

interface WebProviderProps {
  children: ReactNode;
}

export const WebProvider: React.FC<WebProviderProps> = ({ children }) => {
  const { isWeb } = usePlatform();
  const [isNotificationsVisible, setIsNotificationsVisible] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  console.log('🔍 WebProvider: isWeb:', isWeb, 'isNotificationsVisible:', isNotificationsVisible, 'isSearchVisible:', isSearchVisible);

  const openNotifications = () => {
    if (isWeb) {
      console.log('🔍 WebContext: Opening notifications');
      setIsNotificationsVisible(true);
    } else {
      console.log('🔍 WebContext: No es web, no abriendo notificaciones');
    }
  };

  const closeNotifications = () => {
    if (isWeb) {
      console.log('🔍 WebContext: Closing notifications');
      setIsNotificationsVisible(false);
    } else {
      console.log('🔍 WebContext: No es web, no cerrando notificaciones');
    }
  };

  const openSearch = () => {
    if (isWeb) {
      console.log('🔍 WebContext: Opening search');
      setIsSearchVisible(true);
    } else {
      console.log('🔍 WebContext: No es web, no abriendo búsqueda');
    }
  };

  const closeSearch = () => {
    if (isWeb) {
      console.log('🔍 WebContext: Closing search');
      setIsSearchVisible(false);
    } else {
      console.log('🔍 WebContext: No es web, no cerrando búsqueda');
    }
  };

  return (
    <WebContext.Provider value={{
      isNotificationsVisible,
      isSearchVisible,
      openNotifications,
      closeNotifications,
      openSearch,
      closeSearch,
    }}>
      {children}
    </WebContext.Provider>
  );
};

export const useWeb = (): WebContextType => {
  const context = useContext(WebContext);
  if (context === undefined) {
    throw new Error('useWeb must be used within a WebProvider');
  }
  return context;
}; 