# Solución Centralizada para Notificaciones

## Problema Resuelto

El error `Warning: tried to subscribe multiple times. 'subscribe' can only be called a single time per channel instance` se producía porque múltiples componentes estaban creando suscripciones independientes al canal de notificaciones de Supabase.

## Solución Implementada

### Contexto Global de Notificaciones

Se implementó un **contexto global** (`NotificationsProvider`) que maneja una única suscripción y está disponible en toda la aplicación.

### Arquitectura de la Solución

```
App Layout
├── AuthProvider
├── NotificationsProvider ← ÚNICA SUSCRIPCIÓN
├── SearchProvider
└── Components
    ├── MobileHeader
    ├── DynamicHeader
    ├── MobileNotifications
    ├── NotificationsPanel
    └── notificaciones.tsx
```

### Características Principales

#### **1. Una Única Suscripción**
- Solo se crea una suscripción al canal `'notificaciones'`
- Se maneja en el `NotificationsProvider`
- Todos los componentes comparten la misma conexión

#### **2. Funciones Centralizadas**
```typescript
interface NotificationsContextType {
  notificaciones: Notificacion[];
  loading: boolean;
  refreshNotifications: () => Promise<void>;
  getUnreadCount: () => number;
  markAsRead: (notificationId: number) => Promise<void>;
}
```

#### **3. Gestión Inteligente de Estado**
- Estado centralizado en el contexto
- Actualizaciones automáticas en tiempo real
- Marcado automático como leído

### Componentes Actualizados

#### **MobileHeader.tsx**
```typescript
const { notificaciones, getUnreadCount } = useNotifications();
const unreadCount = getUnreadCount();
```

#### **DynamicHeader.tsx**
```typescript
const { notificaciones, loading: notificationsLoading, getUnreadCount } = useNotifications();
```

#### **MobileNotifications.tsx**
```typescript
const { notificaciones, loading, markAsRead } = useNotifications();

const handleNotificationPress = async (notification: any) => {
  if (!notification.leida) {
    await markAsRead(notification.id);
  }
  // ... resto del código
};
```

#### **NotificationsPanel.tsx**
```typescript
const { notificaciones, loading, markAsRead } = useNotifications();

const handleNotificationPress = async (notification: any) => {
  if (!notification.leida) {
    await markAsRead(notification.id);
  }
  // ... resto del código
};
```

#### **notificaciones.tsx**
```typescript
const { notificaciones, loading, markAsRead } = useNotifications();

const handleNotificationPress = async (notification: any) => {
  if (!notification.leida) {
    await markAsRead(notification.id);
  }
  // ... resto del código
};
```

### Ventajas de la Solución

#### **✅ Rendimiento Optimizado**
- Una sola conexión en tiempo real
- Menos uso de memoria
- Mejor rendimiento de red

#### **✅ Funcionalidad Mejorada**
- Marcado automático como leído
- Contador de no leídas centralizado
- Actualizaciones en tiempo real para todos los componentes

#### **✅ Código Más Limpio**
- Lógica centralizada
- Menos duplicación de código
- Más fácil de mantener

#### **✅ Escalabilidad**
- Fácil agregar nuevas funcionalidades
- Componentes desacoplados
- Arquitectura modular

### Funciones Disponibles

#### **getUnreadCount()**
```typescript
const unreadCount = getUnreadCount();
// Retorna el número de notificaciones no leídas
```

#### **markAsRead(notificationId)**
```typescript
await markAsRead(notification.id);
// Marca una notificación como leída en Supabase y actualiza el estado local
```

#### **refreshNotifications()**
```typescript
await refreshNotifications();
// Recarga las notificaciones desde Supabase
```

### Logs de Debug

La solución incluye logs detallados para monitorear el comportamiento:

- `🔍 NotificationsProvider: Canal suscrito exitosamente`
- `🔍 NotificationsProvider: Canal desuscrito`
- `🔍 NotificationsProvider: No hay notificaciones reales, usando datos de prueba`

### Resultado Final

✅ **Error Eliminado**: No más advertencias de múltiples suscripciones
✅ **Funcionalidad Preservada**: Todas las notificaciones funcionan correctamente
✅ **Mejor UX**: Marcado automático como leído
✅ **Código Limpio**: Arquitectura centralizada y mantenible
✅ **Escalabilidad**: Fácil agregar nuevas funcionalidades

### Uso en Nuevos Componentes

Para agregar notificaciones a un nuevo componente:

```typescript
import { useNotifications } from '@/hooks/notifications/useNotifications';

const MyComponent = () => {
  const { notificaciones, getUnreadCount, markAsRead } = useNotifications();
  
  // Usar las funciones según necesites
  const unreadCount = getUnreadCount();
  
  return (
    // Tu JSX aquí
  );
};
```

La solución es robusta, escalable y elimina completamente el problema de múltiples suscripciones mientras mejora la funcionalidad general del sistema de notificaciones. 