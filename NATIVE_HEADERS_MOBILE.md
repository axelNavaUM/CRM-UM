# Headers Nativos para Dispositivos Móviles

## Resumen de la Implementación

Se han implementado headers nativos usando `Stack.Screen` de Expo Router, que solo aparecen en dispositivos móviles (ancho < 768px). En dispositivos web/desktop, se mantiene el header personalizado existente.

## Estructura Implementada

### Pantallas con Headers Nativos

1. **Explore** (`app/(tabs)/explore.tsx`)
   - Título: "Explorar"
   - Header nativo solo en móviles

2. **Alta de Alumno** (`app/(tabs)/altaAlumno.tsx`)
   - Título: "Alta de Alumno"
   - Header nativo solo en móviles

3. **Gestión de Usuarios** (`app/(tabs)/altaUsuario.tsx`)
   - Título: "Gestión de Usuarios"
   - Header nativo solo en móviles

4. **Gestión de Peticiones** (`app/(tabs)/gestionPeticiones.tsx`)
   - Título: "Gestión de Peticiones"
   - Header nativo solo en móviles

5. **Notificaciones** (`app/(tabs)/notificaciones.tsx`)
   - Título: "Notificaciones"
   - Header nativo solo en móviles

## Código de Implementación

### Estructura Básica

```typescript
import { Stack } from 'expo-router';
import { useWindowDimensions } from 'react-native';

const ComponentName = () => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  return (
    <>
      {isMobile && (
        <Stack.Screen 
          options={{ 
            title: 'Título de la Pantalla',
            headerStyle: {
              backgroundColor: '#FFFFFF',
            },
            headerTintColor: '#111827',
            headerTitleStyle: {
              fontWeight: '600',
            },
          }} 
        />
      )}
      <ScreenAccessControl requiredScreen="screenName" fallbackScreen="/">
        <ComponentContent />
      </ScreenAccessControl>
    </>
  );
};
```

### Configuración del Header

```typescript
<Stack.Screen 
  options={{ 
    title: 'Título de la Pantalla',
    headerStyle: {
      backgroundColor: '#FFFFFF', // Fondo blanco
    },
    headerTintColor: '#111827', // Color del texto y botones
    headerTitleStyle: {
      fontWeight: '600', // Peso de la fuente del título
    },
  }} 
/>
```

## Ventajas de la Implementación

### ✅ Experiencia Nativa en Móvil
- Headers nativos que respetan la plataforma (iOS/Android)
- Comportamiento consistente con otras apps nativas
- Animaciones y gestos nativos

### ✅ Responsive Design
- Headers nativos solo en móviles (< 768px)
- Headers personalizados en web/desktop
- Adaptación automática según el dispositivo

### ✅ Consistencia Visual
- Mismo estilo en todas las pantallas
- Colores y tipografía consistentes
- Integración perfecta con el diseño existente

### ✅ Mantenibilidad
- Código limpio y reutilizable
- Fácil modificación de estilos
- Separación clara entre móvil y web

## Comportamiento por Dispositivo

### 📱 Dispositivos Móviles (< 768px)
- **Header**: Nativo usando `Stack.Screen`
- **Posicionamiento**: Parte superior de la pantalla
- **Estilo**: Blanco con texto oscuro
- **Comportamiento**: Nativo de la plataforma

### 💻 Web/Desktop (≥ 768px)
- **Header**: Personalizado usando `MobileHeader`
- **Posicionamiento**: Dentro del layout principal
- **Estilo**: Consistente con el diseño web
- **Comportamiento**: Responsive y adaptativo

## Estructura de Archivos Modificados

```
app/(tabs)/
├── explore.tsx              ✅ Header nativo
├── altaAlumno.tsx           ✅ Header nativo
├── altaUsuario.tsx          ✅ Header nativo
├── gestionPeticiones.tsx    ✅ Header nativo
└── notificaciones.tsx       ✅ Header nativo
```

## Imports Necesarios

```typescript
import { Stack } from 'expo-router';
import { useWindowDimensions } from 'react-native';
```

## Detección de Dispositivo

```typescript
const { width } = useWindowDimensions();
const isMobile = width < 768;
```

## Estilos del Header

- **Background**: `#FFFFFF` (blanco)
- **Text Color**: `#111827` (gris oscuro)
- **Font Weight**: `600` (semi-bold)
- **Platform**: Nativo (iOS/Android)

## Consideraciones Técnicas

### Performance
- Headers nativos son más eficientes en móviles
- No afecta el rendimiento en web
- Carga condicional según el dispositivo

### Accesibilidad
- Headers nativos incluyen accesibilidad automática
- Compatible con lectores de pantalla
- Navegación por teclado en web

### Compatibilidad
- Funciona en iOS y Android
- Compatible con Expo Router
- No afecta la navegación existente

## Próximos Pasos

1. **Testing**: Verificar en dispositivos reales
2. **Optimización**: Ajustar estilos según feedback
3. **Extensión**: Aplicar a otras pantallas si es necesario
4. **Documentación**: Mantener actualizada la documentación

## Comandos de Testing

```bash
# Probar en iOS Simulator
npx expo run:ios

# Probar en Android Emulator
npx expo run:android

# Probar en web
npx expo start --web
``` 