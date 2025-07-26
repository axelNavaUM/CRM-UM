import { Portal } from '@gorhom/portal';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  height?: number | string;
}

const BottomSheet: React.FC<BottomSheetProps> = ({ open, onClose, children, height = '95%' }) => {
  const translateY = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (open) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: Dimensions.get('window').height,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [open]);

  if (!open) return null;

  return (
    <Portal>
      <View style={styles.overlay}>
        {/* Backdrop */}
        <Animated.View 
          style={[
            styles.backdrop,
            { opacity: backdropOpacity }
          ]}
        >
          <TouchableOpacity 
            style={styles.backdropTouch} 
            activeOpacity={1} 
            onPress={onClose} 
          />
        </Animated.View>
        
        {/* Bottom Sheet */}
        <Animated.View 
          style={[
            styles.bottomSheet,
            { 
              transform: [{ translateY }],
              height: typeof height === 'number' ? height : height === '100%' ? '100%' : '95%'
            }
          ]}
        >
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>
          
          {/* Content */}
          <View style={styles.content}>
            {children}
          </View>
        </Animated.View>
      </View>
    </Portal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  backdropTouch: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    // Material 3 elevation
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -8,
    },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 24,
    // Usar todo el ancho de la pantalla sin márgenes
    width: Dimensions.get('window').width,
    // Asegurar que esté anclado al fondo
    alignSelf: 'stretch',
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 32,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
});

export default BottomSheet; 