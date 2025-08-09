import { PortalProvider } from '@gorhom/portal';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Redirect, Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BasicRoleRedirect } from '@/components/ui/BasicRoleRedirect';
import GlobalAsidePanel from '@/components/ui/GlobalAsidePanel';
import SearchOverlay from '@/components/ui/SearchOverlay';
import SheetsRenderer from '@/components/ui/SheetsRenderer';
import WebSearch from '@/components/ui/WebSearch';

import { AsidePanelProvider } from '@/context/AsidePanelContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { NotificationsProvider } from '@/context/NotificationsContext';
import { SearchProvider } from '@/context/SearchContext';
import { SheetsProvider } from '@/context/SheetsContext';
import { WebProvider, useWeb } from '@/context/WebContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { usePlatform } from '@/hooks/usePlatform';

// Nuevo componente para la lógica de auth/redirección
function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const isLoginScreen = pathname.startsWith('/loginScreen');
  
  if (isLoading) return null;
  
  if (!isAuthenticated && !isLoginScreen) {
    return <Redirect href="/loginScreen" />;
  }
  
  if (isAuthenticated && isLoginScreen) {
    return <Redirect href="/(tabs)/explore" />;
  }
  
  // Si está autenticado y no está en login, aplicar redirección basada en roles
  if (isAuthenticated && !isLoginScreen) {
    return <BasicRoleRedirect>{children}</BasicRoleRedirect>;
  }
  
  return <>{children}</>;
}

// Componente para renderizar componentes específicos de web
function WebComponents() {
  const { isWeb } = usePlatform();
  const { isSearchVisible, closeSearch } = useWeb();
  
  if (!isWeb) {
    return null;
  }

  return (
    <>
      <WebSearch 
        visible={isSearchVisible} 
        onClose={closeSearch} 
      />
      <GlobalAsidePanel />
    </>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  if (!loaded) return null;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PortalProvider>
          <AuthProvider>
            <NotificationsProvider>
              <SheetsProvider>
                <SearchProvider>
                  <WebProvider>
                    <AsidePanelProvider>
                      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                        <AuthGate>
                          <Stack>
                            <Stack.Screen name="loginScreen" options={{ headerShown: false }} />
                            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                            <Stack.Screen name="+not-found" />
                          </Stack>
                          <StatusBar style="auto" />
                          <SheetsRenderer />
                          <SearchOverlay />
                          <WebComponents />
                        </AuthGate>
                      </ThemeProvider>
                    </AsidePanelProvider>
                  </WebProvider>
                </SearchProvider>
              </SheetsProvider>
            </NotificationsProvider>
          </AuthProvider>
        </PortalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  containerMobile: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  containerDesktop: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
  },
  mobileHeader: {
    paddingTop: 0,
    backgroundColor: 'transparent',
    paddingBottom: 0,
    zIndex: 9999,
  },
  mobileContent: {
    flex: 1,
    paddingBottom: 80,
    zIndex: 1,
  },
  desktopHeader: {
    backgroundColor: 'transparent',
    paddingTop: 0,
    paddingBottom: 0,
    zIndex: 9999,
  },
  desktopContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    zIndex: 1,
  },
  desktopSidebar: {
    width: 280,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
});
