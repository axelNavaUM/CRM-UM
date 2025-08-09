# Sheets Apilados y Gestos Nativos

## Mejoras Implementadas

### 🎯 **Problema Resuelto**

- **Sheets se superponían**: Los sheets se abrían uno encima del otro sin orden
- **Gestos limitados**: No había gestos nativos para cerrar sheets
- **UX pobre**: Experiencia de usuario no fluida

### ✅ **Solución Implementada**

#### **1. Sistema de Sheets Apilados**

```typescript
// Contexto para manejar múltiples sheets
interface SheetsContextType {
  sheets: Sheet[];
  addSheet: (id: string, component: React.ReactNode) => void;
  removeSheet: (id: string) => void;
  closeAllSheets: () => void;
  getTopSheet: () => Sheet | null;
}
```

#### **2. Gestos Nativos**

```typescript
// BottomSheet con gestos nativos
<PanGestureHandler
  onGestureEvent={onGestureEvent}
  onHandlerStateChange={onHandlerStateChange}
  activeOffsetY={[-10, 10]}
>
  <Animated.View>
    {/* Contenido del sheet */}
  </Animated.View>
</PanGestureHandler>
```

### 🏗️ **Arquitectura de la Solución**

#### **SheetsProvider**
- Maneja el estado de todos los sheets
- Asigna z-index incremental
- Permite apilar sheets como pestañas

#### **SheetsRenderer**
- Renderiza todos los sheets apilados
- Maneja el orden de superposición
- Gestiona eventos de toque

#### **useSheet Hook**
```typescript
const { showSheet, hideSheet, hideAllSheets } = useSheet();

// Mostrar un sheet
showSheet('notification-detail', <Component />);

// Ocultar un sheet
hideSheet('notification-detail');

// Ocultar todos los sheets
hideAllSheets();
```

### 🎨 **Características de los Gestos**

#### **Gestos de Deslizamiento**
- **Deslizar hacia abajo**: Cierra el sheet
- **Deslizar hacia arriba**: Mantiene el sheet abierto
- **Velocidad**: Cierre automático si la velocidad es alta
- **Distancia**: Cierre si se desliza más del 30% de la pantalla

#### **Animaciones Suaves**
```typescript
const onHandlerStateChange = (event: PanGestureHandlerGestureEvent) => {
  if (event.nativeEvent.state === State.END) {
    const { translationY, velocityY } = event.nativeEvent;
    
    // Determinar si debe cerrarse
    const shouldClose = translationY > screenHeight * 0.3 || velocityY > 500;
    
    if (shouldClose) {
      onClose();
    } else {
      // Animar de vuelta a la posición original
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  }
};
```

### 📱 **Uso en Componentes**

#### **MobileNotifications**
```typescript
const handleNotificationPress = async (notification: any) => {
  // Mostrar sheet de detalles
  showSheet('notification-detail', (
    <BottomSheet
      open={true}
      onClose={() => hideSheet('notification-detail')}
      enableGestures={true}
    >
      <NotificationDetailSheet
        notification={notification}
        onClose={() => hideSheet('notification-detail')}
      />
    </BottomSheet>
  ));
};
```

#### **MobileSearch**
```typescript
const handleResultPress = (result: SearchResult) => {
  // Mostrar sheet de detalles
  showSheet('search-detail', (
    <BottomSheet
      open={true}
      onClose={() => hideSheet('search-detail')}
      enableGestures={true}
    >
      <SearchDetailSheet
        result={result}
        onClose={() => hideSheet('search-detail')}
        onNavigate={() => {
          hideSheet('search-detail');
          handleClose();
          router.push(result.route);
        }}
      />
    </BottomSheet>
  ));
};
```

### 🎯 **Beneficios Obtenidos**

#### **✅ Experiencia de Usuario Mejorada**
- Sheets se apilan como pestañas nativas
- Gestos intuitivos para cerrar
- Animaciones suaves y fluidas
- Comportamiento nativo en iOS y Android

#### **✅ Funcionalidad Avanzada**
- Múltiples sheets simultáneos
- Gestos de deslizamiento nativos
- Cierre automático por velocidad/distancia
- Z-index automático para superposición

#### **✅ Código Limpio**
- Hook personalizado `useSheet`
- Contexto centralizado para sheets
- Componentes reutilizables
- Fácil integración en nuevos componentes

### 🔧 **Configuración de Gestos**

#### **Parámetros Configurables**
```typescript
interface BottomSheetProps {
  enableGestures?: boolean;     // Habilitar/deshabilitar gestos
  snapPoints?: number[];        // Puntos de anclaje
  height?: number | string;     // Altura del sheet
}
```

#### **Gestos Disponibles**
- **Deslizar hacia abajo**: Cerrar sheet
- **Deslizar hacia arriba**: Mantener abierto
- **Toque en backdrop**: Cerrar sheet
- **Botón de cerrar**: Cerrar sheet

### 📊 **Rendimiento Optimizado**

#### **Gestión de Memoria**
- Sheets se eliminan automáticamente al cerrar
- Z-index incremental para evitar conflictos
- Animaciones con `useNativeDriver: true`

#### **Eventos Optimizados**
- Gestos nativos de React Native Gesture Handler
- Animaciones de 60fps
- Sin bloqueos en el hilo principal

### 🎉 **Resultado Final**

✅ **Sheets apilados como pestañas**: Múltiples sheets simultáneos
✅ **Gestos nativos**: Deslizar para cerrar como en apps nativas
✅ **UX fluida**: Animaciones suaves y comportamiento intuitivo
✅ **Código limpio**: Hook reutilizable y contexto centralizado
✅ **Rendimiento optimizado**: Gestos nativos y animaciones fluidas

### 🚀 **Uso en Nuevos Componentes**

Para agregar sheets a un nuevo componente:

```typescript
import { useSheet } from '@/hooks/useSheet';

const MyComponent = () => {
  const { showSheet, hideSheet } = useSheet();
  
  const handleShowDetail = () => {
    showSheet('my-detail', (
      <BottomSheet
        open={true}
        onClose={() => hideSheet('my-detail')}
        enableGestures={true}
      >
        <MyDetailComponent />
      </BottomSheet>
    ));
  };
  
  return (
    // Tu JSX aquí
  );
};
```

La solución proporciona una experiencia de usuario nativa y profesional con sheets apilados y gestos intuitivos. 