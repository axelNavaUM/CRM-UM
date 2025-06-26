import React from 'react';
import { useWindowDimensions } from 'react-native';
import SideNavbar from './SideNavbar';
import BottomNavbar from './bottomNavbar';

export default function ResponsiveNavbar() {
  const { width, height } = useWindowDimensions();
  const isTablet = width > 768 || width > height; // Landscape o tablet

  return isTablet ? <SideNavbar /> : <BottomNavbar />;
}
