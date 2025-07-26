import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';

interface AsidePanelProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
}

const AsidePanel: React.FC<AsidePanelProps> = ({ open, onClose, children, width = 400 }) => {
  const translateX = useRef(new Animated.Value(width)).current;

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: open ? 0 : width,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [open, width]);

  if (!open) return null;

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <Animated.View style={[styles.panel, { width, transform: [{ translateX }] }]}> 
        {children}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  panel: {
    backgroundColor: '#fff',
    height: '100%',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
});

export default AsidePanel; 