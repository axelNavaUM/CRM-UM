import { Portal } from '@gorhom/portal';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Platform,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import {
    GestureHandlerRootView,
    PanGestureHandler,
    PanGestureHandlerGestureEvent,
    State
} from 'react-native-gesture-handler';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  height?: number | string;
  enableGestures?: boolean;
  snapPoints?: number[];
}

const { height: screenHeight } = Dimensions.get('window');

const BottomSheet: React.FC<BottomSheetProps> = ({ 
  open, 
  onClose, 
  children, 
  height = '95%',
  enableGestures = true,
  snapPoints = [0, screenHeight * 0.5, screenHeight]
}) => {
  const translateY = useRef(new Animated.Value(screenHeight)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const panGestureRef = useRef(null);

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
          toValue: screenHeight,
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

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: true }
  ) as unknown as (event: PanGestureHandlerGestureEvent) => void;

  const onHandlerStateChange = (event: PanGestureHandlerGestureEvent) => {
    if (event.nativeEvent.state === State.END) {
      const { translationY, velocityY } = event.nativeEvent;
      
      // Determinar si debe cerrarse basado en la velocidad y distancia
      const shouldClose = translationY > screenHeight * 0.2 || velocityY > 800;
      
      if (shouldClose) {
        onClose();
      } else {
        // Animar de vuelta a la posición original
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();
      }
    }
  };

  const handleBackdropPress = () => {
    onClose();
  };

  if (!open) return null;

  const sheetHeight = typeof height === 'number' ? height : height === '100%' ? screenHeight : screenHeight * 0.95;

  return (
    <Portal>
      <GestureHandlerRootView style={styles.overlay}>
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
            onPress={handleBackdropPress} 
          />
        </Animated.View>
        
        {/* Bottom Sheet */}
        <Animated.View 
          style={[
            styles.bottomSheet,
            { 
              transform: [{ translateY }],
              height: sheetHeight
            }
          ]}
        >
          {/* Drag Handle (gesture only on handle, not entire content) */}
          {enableGestures ? (
            <PanGestureHandler
              ref={panGestureRef}
              onGestureEvent={onGestureEvent}
              onHandlerStateChange={onHandlerStateChange}
              activeOffsetY={[-10, 10]}
              failOffsetX={[-20, 20]}
              shouldCancelWhenOutside={true}
            >
              <View style={styles.handleContainer}>
                <View style={styles.handle} />
              </View>
            </PanGestureHandler>
          ) : (
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>
          )}

          {/* Content */}
          <View style={styles.content}>
            {children}
          </View>
        </Animated.View>
      </GestureHandlerRootView>
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
    zIndex: 99999,
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -8,
    },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 24,
    width: Dimensions.get('window').width,
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
    // permitir scroll de hijos (ScrollView internos) y gestos simultáneos
    overflow: 'visible',
  },
});

export default BottomSheet; 