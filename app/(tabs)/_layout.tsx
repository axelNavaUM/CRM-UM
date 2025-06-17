import { Tabs, usePathname } from 'expo-router'; // Added usePathname
import React from 'react';
import { Platform, View } from 'react-native'; // Added View

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import Navbar from '@/components/ui/Navbar'; // Import Navbar
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

// Function to get a dynamic title based on the current route
function getNavbarTitle(pathname: string): string {
  console.log('[TabLayout] getNavbarTitle - pathname:', pathname);
  if (pathname === '/index' || pathname === '/') return 'Home Dashboard';
  if (pathname === '/newCourse') return 'Create New Course';
  if (pathname === '/explore') return 'Explore';
  const defaultTitle = 'School CRM';
  console.log('[TabLayout] getNavbarTitle - returning default:', defaultTitle);
  return defaultTitle;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();
  const title = getNavbarTitle(pathname);
  console.log(`[TabLayout] Rendering layout for pathname: ${pathname}, title: ${title}`);

  // Do not show Navbar on the loginScreen if it were part of this layout
  // However, loginScreen is typically outside or presented modally
  if (pathname === '/loginScreen') { // This check is more for robustness
    return (
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false, // Ensure header is always false for Tabs themselves
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: {
              position: 'absolute',
            },
            default: {},
          }),
        }}>
        {/* Screens that should NOT have the main Navbar would be defined here,
            or loginScreen should be in a different layout stack altogether.
            For this project, loginScreen is in app/(tabs) but is not meant to show the Navbar.
            The ideal solution is for loginScreen to be in a separate stack (e.g. app/(auth)/loginScreen.tsx)
            or presented as a modal. Given the current structure, we rely on it not being a main tab
            that would get the Navbar via this layout.
            The check `if (pathname === '/loginScreen')` above is mostly illustrative,
            as the Navbar is rendered outside the Tabs for other screens.
         */}
        {/* The loginScreen should ideally not be a Tab here if it's handled by the if condition.
            If loginScreen is truly standalone, it shouldn't be a Tabs.Screen at all in this authenticated layout.
            Assuming loginScreen is handled correctly by being outside this main Tabs rendering if path is /loginScreen.
         */}
        {/* <Tabs.Screen name="loginScreen" options={{ tabBarVisible: false, title: 'Login' }} /> */}
      </Tabs>
    );
  }

  console.log('[TabLayout] Rendering main Navbar and Tabs container');
  return (
    <View style={{ flex: 1 }}>
      <Navbar title={title} />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false, // Crucial: Tabs screens should not show their own headers
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({ // MOVED tabBarStyle inside screenOptions
            ios: {
              // Use a transparent background on iOS to show the blur effect
              position: 'absolute',
            },
            default: {},
          }),
        }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="newCourse" // This should match the file name: newCourse.tsx
        options={{
          title: 'New Course',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="plus.circle.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
