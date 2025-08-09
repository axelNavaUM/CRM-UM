import { useAuth } from '@/context/AuthContext';
import { Notificacion, useNotifications } from '@/hooks/notifications/useNotifications';
import { SearchResult, SearchService } from '@/services/searchService';
import { supabase } from '@/services/supabase/supaConf';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsidePanel from './AsidePanel';
import BottomSheet from './BottomSheet';
import RadixIcons from './RadixIcons';

const { width: screenWidth } = Dimensions.get('window');

const DynamicHeader: React.FC = () => {
  const [mode, setMode] = useState<'normal' | 'search' | 'notifications'>('normal');
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SearchResult | Notificacion | null>(null);
  const [showSheet, setShowSheet] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [alumnoData, setAlumnoData] = useState<any>(null);
  const [cambioCarreraData, setCambioCarreraData] = useState<any>(null);
  const [consultType, setConsultType] = useState<'alumno' | 'peticion' | null>(null);
  const [peticionInfo, setPeticionInfo] = useState<any>(null);
  
  const { user } = useAuth();
  const { notificaciones, loading: notificationsLoading, getUnreadCount } = useNotifications();
  const router = useRouter();
  const insets = { top: 0 }; // Valor fijo en lugar de useSafeAreaInsets()

  // Animaciones
  const expandAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Detectar Escape key (solo en web)
  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          handleClose();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, []);

  // Debug useEffect para monitorear cambios de estado
  useEffect(() => {
    console.log('🔍 DynamicHeader: State changed - showSheet:', showSheet, 'selectedItem:', selectedItem);
  }, [showSheet, selectedItem]);

  // Debug useEffect para monitorear cambios de modo
  useEffect(() => {
    console.log('🔍 DynamicHeader: Mode changed to:', mode);
  }, [mode]);

  // Función para obtener las iniciales del usuario - memoizada
  const getUserInitials = () => {
    if (!user?.email) return 'U';
    const emailParts = user.email.split('@')[0];
    const nameParts = emailParts.split('.');
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0).toUpperCase()}${nameParts[1].charAt(0).toUpperCase()}`;
    }
    return emailParts.charAt(0).toUpperCase();
  };

  // Función para obtener el nombre del usuario - memoizada
  const getUserName = () => {
    if (!user?.email) return 'Usuario';
    const emailParts = user.email.split('@')[0];
    const nameParts = emailParts.split('.');
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0).toUpperCase()}${nameParts[0].slice(1)} ${nameParts[1].charAt(0).toUpperCase()}${nameParts[1].slice(1)}`;
    }
    return emailParts.charAt(0).toUpperCase() + emailParts.slice(1);
  };

  const handleSearchPress = () => {
    setMode('search');
    
    // Animación de expansión
    Animated.parallel([
      Animated.timing(expandAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleSearchTextChange = async (text: string) => {
    setSearchText(text);
    
    if (text.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await SearchService.globalSearch(text);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleNotificationPress = () => {
    setMode('notifications');
    
    // Animación de expansión
    Animated.parallel([
      Animated.timing(expandAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleClose = () => {
    setMode('normal');
    setSearchText('');
    setSearchResults([]);
    setSelectedItem(null);
    setShowSheet(false);
    
    // Animación de contracción
    Animated.parallel([
      Animated.timing(expandAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  };

  // Funciones para cargar datos adicionales
  const fetchAlumnoData = async (alumnoId: number) => {
    try {
      console.log('🔍 DynamicHeader: Fetching alumno data for ID:', alumnoId);
      
      const { data: alumno, error: alumnoError } = await supabase
        .from('alumnos')
        .select(`
          *,
          carreras(nombre),
          ciclos(nombre)
        `)
        .eq('id', alumnoId)
        .single();

      if (alumnoError) {
        console.error('Error fetching alumno:', alumnoError);
        return null;
      }

      console.log('🔍 DynamicHeader: Alumno data fetched:', alumno);
      return alumno;
    } catch (error) {
      console.error('Error fetching alumno data:', error);
      return null;
    }
  };

  const fetchCambioCarreraData = async (peticionId: number) => {
    try {
      console.log('🔍 DynamicHeader: Fetching cambio carrera data for ID:', peticionId);
      
      const { data: peticion, error: peticionError } = await supabase
        .from('peticiones_cambio_carrera')
        .select(`
          *,
          alumnos(nombre, apellidos, matricula, email)
        `)
        .eq('id', peticionId)
        .single();

      if (peticionError) {
        console.error('Error fetching cambio carrera:', peticionError);
        return null;
      }

      // Obtener nombres de carreras y ciclos
      if (peticion) {
        const carrerasIds = [peticion.carrera_actual_id, peticion.carrera_nueva_id].filter(Boolean);
        const ciclosIds = [peticion.ciclo_actual_id, peticion.ciclo_nuevo_id].filter(Boolean);

        if (carrerasIds.length > 0) {
          const { data: carreras } = await supabase
            .from('carreras')
            .select('id, nombre')
            .in('id', carrerasIds);
          
          if (carreras) {
            peticion.carreras = carreras;
          }
        }

        if (ciclosIds.length > 0) {
          const { data: ciclos } = await supabase
            .from('ciclos')
            .select('id, nombre')
            .in('id', ciclosIds);
          
          if (ciclos) {
            peticion.ciclos = ciclos;
          }
        }
      }

      console.log('🔍 DynamicHeader: Cambio carrera data fetched:', peticion);
      return peticion;
    } catch (error) {
      console.error('Error fetching cambio carrera data:', error);
      return null;
    }
  };

  const handleItemPress = async (item: SearchResult | Notificacion) => {
    console.log('🔍 DynamicHeader: handleItemPress called with item:', item);
    setLoadingDetail(true);
    setSelectedItem(item);
    setShowSheet(true);
    
    // Limpiar datos anteriores
    setAlumnoData(null);
    setCambioCarreraData(null);
    setConsultType(null);

    try {
      if ('type' in item) {
        // Es un resultado de búsqueda (alumno o usuario)
        const result = item as SearchResult;
        console.log('🔍 DynamicHeader: Loading data for search result:', result);
        
        if (result.type === 'alumno' && result.data?.id) {
          const alumnoData = await fetchAlumnoData(result.data.id);
          setAlumnoData(alumnoData);
          setConsultType('alumno');
        }
      } else {
        // Es una notificación
        const notification = item as Notificacion;
        console.log('🔍 DynamicHeader: Loading data for notification:', notification);
        
        const isCambioCarrera = notification.tipo === 'cambio_carrera' || 
          /cambio de carrera/i.test(notification.titulo || '') ||
          /cambio de carrera/i.test(notification.mensaje || '');

        if (isCambioCarrera) {
          // Para notificaciones de cambio de carrera
          const alumnoId = notification.datos_adicionales?.alumno_id;
          const peticionId = notification.datos_adicionales?.peticion_id;
          setConsultType('peticion');
          
          // Preparar información de la petición
          if (alumnoData) {
            setPeticionInfo({
              id: peticionId || 0,
              alumno_nombre: alumnoData.nombre || '',
              alumno_apellidos: alumnoData.apellidos || '',
              carrera_actual_nombre: alumnoData.carreras?.nombre || 'No especificada',
              carrera_nueva_nombre: 'Carrera Nueva', // Esto se obtendría de la petición
              fecha_creacion: new Date().toISOString(),
            });
          }

          if (alumnoId) {
            const alumnoData = await fetchAlumnoData(alumnoId);
            setAlumnoData(alumnoData);
          }

          if (peticionId) {
            const cambioCarreraData = await fetchCambioCarreraData(peticionId);
            setCambioCarreraData(cambioCarreraData);
          }
        } else {
          // Para otras notificaciones, buscar datos del alumno si existe alumno_id
          const alumnoId = notification.datos_adicionales?.alumno_id;
          if (alumnoId) {
            const alumnoData = await fetchAlumnoData(alumnoId);
            setAlumnoData(alumnoData);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching item details:', error);
      Alert.alert('Error', 'No se pudo cargar la información detallada');
    } finally {
      setLoadingDetail(false);
    }
    
    console.log('🔍 DynamicHeader: showSheet set to true, selectedItem:', item);
  };

  const handleSheetClose = () => {
    console.log('🔍 DynamicHeader: handleSheetClose called');
    setShowSheet(false);
    setSelectedItem(null);
    setAlumnoData(null);
    setCambioCarreraData(null);
    setLoadingDetail(false);
  };

  const handleApprove = () => {
    console.log('✅ Aprobando petición...');
    // Aquí iría la lógica para aprobar la petición
    // Por ejemplo, actualizar el estado en la base de datos
  };

  const handleReject = () => {
    console.log('❌ Rechazando petición...');
    // Aquí iría la lógica para rechazar la petición
    // Por ejemplo, actualizar el estado en la base de datos
  };

  const handleComment = (comment: string) => {
    console.log('💬 Comentario agregado:', comment);
    // Aquí iría la lógica para guardar el comentario
    // Por ejemplo, insertar en la tabla de comentarios
  };

  const handleSign = (signature: string) => {
    console.log('✍️ Firma agregada:', signature);
    // Aquí iría la lógica para guardar la firma
    // Por ejemplo, actualizar el campo de firma en la petición
  };

  const getResultColor = (type: string) => {
    switch (type) {
      case 'alumno': return '#3B82F6';
      case 'usuario': return '#10B981';
      case 'configuracion': return '#F59E0B';
      case 'alta': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'alumno': return 'Students';
      case 'usuario': return 'Users';
      case 'configuracion': return 'Settings';
      case 'alta': return 'Plus';
      default: return 'Search';
    }
  };

  const getNotificationColor = (tipo: string) => {
    switch (tipo) {
      case 'success': return '#10B981';
      case 'warning': return '#F59E0B';
      case 'error': return '#EF4444';
      default: return '#3B82F6';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} h`;
    return `${Math.floor(diffInMinutes / 1440)} d`;
  };

  const getUnreadNotificationsCount = () => {
    return getUnreadCount();
  };

  const isMobile = screenWidth < 768;

  const renderItemDetails = () => {
    console.log('🔍 DynamicHeader: renderItemDetails called, selectedItem:', selectedItem);
    
    if (!selectedItem) {
      console.log('🔍 DynamicHeader: No selectedItem, returning null');
      return null;
    }

    if (loadingDetail) {
      return (
        <View style={styles.loadingContainer}>
          <RadixIcons.Loading size={24} color="#6B7280" />
          <Text style={styles.loadingText}>Cargando información...</Text>
        </View>
      );
    }

    if ('type' in selectedItem) {
      // Es un resultado de búsqueda
      const result = selectedItem as SearchResult;
      console.log('🔍 DynamicHeader: Rendering search result:', result);
      
      return (
        <View style={styles.detailContent}>
          <View style={styles.detailHeader}>
            <View style={[styles.detailIcon, { backgroundColor: getResultColor(result.type) + '20' }]}>
              {React.createElement(RadixIcons[getResultIcon(result.type) as keyof typeof RadixIcons], { 
                size: 24, 
                color: getResultColor(result.type) 
              })}
            </View>
            <View style={styles.detailInfo}>
              <Text style={styles.detailTitle}>{result.title}</Text>
              <Text style={styles.detailSubtitle}>{result.subtitle}</Text>
            </View>
          </View>
          
          {/* Información del Alumno - Solo para consultas de alumno */}
          {consultType === 'alumno' && alumnoData && (
          <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Información del Alumno</Text>
              <View style={styles.detailData}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Nombre:</Text>
                  <Text style={styles.detailValue}>{alumnoData.nombre} {alumnoData.apellidos}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Matrícula:</Text>
                  <Text style={styles.detailValue}>{alumnoData.matricula}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Email:</Text>
                  <Text style={styles.detailValue}>{alumnoData.email}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Carrera:</Text>
                  <Text style={styles.detailValue}>
                    {alumnoData.carreras?.nombre || 'No especificada'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Ciclo:</Text>
                  <Text style={styles.detailValue}>
                    {alumnoData.ciclos?.nombre || 'No especificado'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Estado:</Text>
                  <Text style={[styles.detailValue, { 
                    color: alumnoData.status === 'activo' ? '#10B981' : 
                           alumnoData.status === 'pendiente' ? '#F59E0B' : '#EF4444'
                  }]}>
                    {alumnoData.status || 'Pendiente'}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Trámites Pendientes - Solo para consultas de alumno */}
          {consultType === 'alumno' && alumnoData && (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Trámites Pendientes</Text>
              <View style={styles.detailData}>
                {/* Aquí se mostrarían los trámites pendientes del alumno */}
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Cambios de Carrera:</Text>
                  <Text style={styles.detailValue}>0 pendientes</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Firmas Pendientes:</Text>
                  <Text style={styles.detailValue}>0 pendientes</Text>
                </View>
              </View>
            </View>
          )}

          {/* Información del Usuario si está disponible */}
          {result.type === 'usuario' && result.data && (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Información del Usuario</Text>
              <View style={styles.detailData}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Nombre:</Text>
                  <Text style={styles.detailValue}>{result.data.nombreusuario} {result.data.apellido}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Email:</Text>
                  <Text style={styles.detailValue}>{result.data.correoinstitucional}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Rol:</Text>
                  <Text style={styles.detailValue}>{result.data.rolarea || 'Sin rol'}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Información básica del resultado */}
          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>Información Básica</Text>
            {result.data && (
              <View style={styles.detailData}>
                {Object.entries(result.data).map(([key, value]) => (
                  <View key={key} style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{key}:</Text>
                    <Text style={styles.detailValue}>{String(value)}</Text>
                  </View>
                ))}
              </View>
            )}
            {!result.data && (
              <View style={styles.detailData}>
                <Text style={styles.detailValue}>No hay información adicional disponible</Text>
              </View>
            )}
          </View>
        </View>
      );
    } else {
      // Es una notificación
      const notification = selectedItem as Notificacion;
      console.log('🔍 DynamicHeader: Rendering notification:', notification);
      
      // Verificar si es una notificación de cambio de carrera
      const isCambioCarrera = notification.tipo === 'cambio_carrera' || 
      (notification.titulo || '').toLowerCase().includes('cambio de carrera') ||
      (notification.mensaje || '').toLowerCase().includes('cambio de carrera');
      
      if (isCambioCarrera) {
        return (
          <View style={styles.detailContent}>
            <View style={styles.detailHeader}>
              <View style={[styles.detailIcon, { backgroundColor: getNotificationColor(notification.tipo) + '20' }]}>
                <RadixIcons.Bell size={24} color={getNotificationColor(notification.tipo)} />
              </View>
              <View style={styles.detailInfo}>
                <Text style={styles.detailTitle}>{notification.titulo}</Text>
                <Text style={styles.detailSubtitle}>Cambio de Carrera</Text>
              </View>
            </View>
            
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Mensaje</Text>
              <Text style={styles.detailMessage}>{notification.mensaje}</Text>
            </View>

            {/* Información del Alumno */}
            {alumnoData && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Información del Alumno</Text>
                <View style={styles.detailData}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Nombre:</Text>
                    <Text style={styles.detailValue}>{alumnoData.nombre} {alumnoData.apellidos}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Email:</Text>
                    <Text style={styles.detailValue}>{alumnoData.email}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Estado:</Text>
                    <Text style={[styles.detailValue, { color: '#F59E0B' }]}>Pendiente</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Información de Cambio de Carrera */}
            {cambioCarreraData && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Detalles de la Solicitud</Text>
                <View style={styles.detailData}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Carrera Actual:</Text>
                    <Text style={styles.detailValue}>
                      {cambioCarreraData.carreras?.find((c: any) => c.id === cambioCarreraData.carrera_actual_id)?.nombre || 'No especificada'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Carrera Nueva:</Text>
                    <Text style={styles.detailValue}>
                      {cambioCarreraData.carreras?.find((c: any) => c.id === cambioCarreraData.carrera_nueva_id)?.nombre || 'No especificada'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Ciclo Actual:</Text>
                    <Text style={styles.detailValue}>
                      {cambioCarreraData.ciclos?.find((c: any) => c.id === cambioCarreraData.ciclo_actual_id)?.nombre || 'No especificado'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Ciclo Nuevo:</Text>
                    <Text style={styles.detailValue}>
                      {cambioCarreraData.ciclos?.find((c: any) => c.id === cambioCarreraData.ciclo_nuevo_id)?.nombre || 'No especificado'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Grupo Actual:</Text>
                    <Text style={styles.detailValue}>
                      {cambioCarreraData.grupo_actual || 'No especificado'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Grupo Nuevo:</Text>
                    <Text style={styles.detailValue}>
                      {cambioCarreraData.grupo_nuevo || 'No especificado'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Motivo:</Text>
                    <Text style={styles.detailValue}>
                      {cambioCarreraData.motivo || 'No especificado'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Fecha de Solicitud:</Text>
                    <Text style={styles.detailValue}>
                      {new Date(cambioCarreraData.fecha_solicitud).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Estado:</Text>
                    <Text style={[styles.detailValue, { 
                      color: cambioCarreraData.estado === 'pendiente' ? '#F59E0B' : 
                             cambioCarreraData.estado === 'aprobado' ? '#10B981' : '#EF4444'
                    }]}>
                      {cambioCarreraData.estado || 'Pendiente'}
                    </Text>
                  </View>
                </View>
              </View>
            )}
            
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Acciones</Text>
              <View style={styles.actionsContainer}>
                <TouchableOpacity style={styles.actionButton}>
                  <RadixIcons.Eye size={16} color="#3B82F6" />
                  <Text style={styles.actionText}>Ver Datos del Alumno</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.actionButton}>
                  <RadixIcons.Edit size={16} color="#10B981" />
                  <Text style={styles.actionText}>Ingresar Firma</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={[styles.actionButton, styles.approveButton]}>
                  <RadixIcons.Check size={16} color="#FFFFFF" />
                  <Text style={[styles.actionText, styles.approveText]}>Aprobar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={[styles.actionButton, styles.rejectButton]}>
                  <RadixIcons.Close size={16} color="#FFFFFF" />
                  <Text style={[styles.actionText, styles.rejectText]}>Rechazar</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Comentario</Text>
              <TextInput
                style={styles.commentInput}
                placeholder="Agregar comentario (opcional)..."
                multiline
                numberOfLines={3}
                placeholderTextColor="#9CA3AF"
              />
            </View>
            
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Información</Text>
              <View style={styles.detailData}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Estado:</Text>
                  <Text style={[styles.detailValue, { color: notification.leida ? '#10B981' : '#F59E0B' }]}>
                    {notification.leida ? 'Leída' : 'No leída'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Fecha:</Text>
                  <Text style={styles.detailValue}>{formatTimestamp(notification.created_at)}</Text>
                </View>
              </View>
            </View>
          </View>
        );
      } else {
        // Notificación normal
        return (
          <View style={styles.detailContent}>
            <View style={styles.detailHeader}>
              <View style={[styles.detailIcon, { backgroundColor: getNotificationColor(notification.tipo) + '20' }]}>
                <RadixIcons.Bell size={24} color={getNotificationColor(notification.tipo)} />
              </View>
              <View style={styles.detailInfo}>
                <Text style={styles.detailTitle}>{notification.titulo}</Text>
                <Text style={styles.detailSubtitle}>{notification.tipo}</Text>
              </View>
            </View>
            
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Mensaje</Text>
              <Text style={styles.detailMessage}>{notification.mensaje}</Text>
            </View>

            {/* Información del Alumno si está disponible */}
            {alumnoData && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Información del Alumno</Text>
                <View style={styles.detailData}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Nombre:</Text>
                    <Text style={styles.detailValue}>{alumnoData.nombre} {alumnoData.apellidos}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Email:</Text>
                    <Text style={styles.detailValue}>{alumnoData.email}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Estado:</Text>
                    <Text style={[styles.detailValue, { color: '#F59E0B' }]}>Pendiente</Text>
                  </View>
                </View>
              </View>
            )}
            
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Información</Text>
              <View style={styles.detailData}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Estado:</Text>
                  <Text style={[styles.detailValue, { color: notification.leida ? '#10B981' : '#F59E0B' }]}>
                    {notification.leida ? 'Leída' : 'No leída'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Fecha:</Text>
                  <Text style={styles.detailValue}>{formatTimestamp(notification.created_at)}</Text>
                </View>
                {notification.datos_adicionales && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Datos adicionales:</Text>
                    <Text style={styles.detailValue}>{JSON.stringify(notification.datos_adicionales)}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        );
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Normal - Compacto */}
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: mode === 'normal' ? opacityAnim : 0,
            display: mode === 'normal' ? 'flex' : 'none',
            paddingTop: insets.top + 8, // Respeta la barra de notificaciones + padding
          },
        ]}
      >
        {/* Contenedor izquierdo - Botones */}
        <View style={styles.headerLeft}>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearchPress}
        >
          <RadixIcons.Search size={18} color="#374151" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => {
            console.log('🔍 DynamicHeader: Notification button pressed');
            handleNotificationPress();
          }}
        >
          <RadixIcons.Bell size={18} color="#374151" />
          {getUnreadNotificationsCount() > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>{getUnreadNotificationsCount()}</Text>
            </View>
          )}
        </TouchableOpacity>
        </View>

        {/* Perfil del usuario - Compacto */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getUserInitials()}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{getUserName()}</Text>
            <Text style={styles.profileEmail}>{user?.email || 'usuario@um.edu.mx'}</Text>
          </View>
        </View>
      </Animated.View>

      {/* Modo Búsqueda - Compacto */}
      {mode === 'search' && (
        <Animated.View
          style={[
            styles.searchMode,
            {
              transform: [
                {
                  scaleX: expandAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.searchHeader}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <RadixIcons.Close size={16} color="#6B7280" />
            </TouchableOpacity>
            
            <View style={styles.searchInputContainer}>
              <RadixIcons.Search size={14} color="#6B7280" />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar alumnos, usuarios, documentos..."
                value={searchText}
                onChangeText={handleSearchTextChange}
                autoFocus={true}
                placeholderTextColor="#9CA3AF"
                returnKeyType="search"
                onSubmitEditing={() => {
                  if (searchResults.length > 0) {
                    handleItemPress(searchResults[0]);
                  }
                }}
              />
              {isSearching && (
                <RadixIcons.Loading size={14} color="#6B7280" />
              )}
            </View>
          </View>

          <ScrollView 
            style={styles.searchResults} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            {searchResults.length > 0 ? (
              searchResults.map((result) => {
                const IconComponent = RadixIcons[getResultIcon(result.type) as keyof typeof RadixIcons];
                const color = getResultColor(result.type);
                
                return (
                  <TouchableOpacity 
                    key={result.id} 
                    style={styles.resultCard}
                    onPress={() => {
                      console.log('🔍 DynamicHeader: Search result pressed:', result);
                      handleItemPress(result);
                    }}
                  >
                    <View style={[styles.resultIcon, { backgroundColor: color + '20' }]}>
                      <IconComponent size={18} color={color} />
                    </View>
                    <View style={styles.resultContent}>
                      <Text style={styles.resultTitle}>{result.title}</Text>
                      <Text style={styles.resultSubtitle}>{result.subtitle}</Text>
                    </View>
                    <RadixIcons.ChevronRight size={14} color="#6B7280" />
                  </TouchableOpacity>
                );
              })
            ) : searchText.length > 2 ? (
              <View style={styles.noResults}>
                <RadixIcons.Search size={20} color="#9CA3AF" />
                <Text style={styles.noResultsText}>No se encontraron resultados</Text>
              </View>
            ) : null}
          </ScrollView>
        </Animated.View>
      )}

      {/* Modo Notificaciones - Compacto */}
      {mode === 'notifications' && (
        <Animated.View
          style={[
            styles.notificationMode,
            {
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-150, 0],
                  }),
                },
                {
                  scale: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.notificationHeader}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <RadixIcons.Close size={14} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.notificationTitle}>Notificaciones</Text>
          </View>

          <ScrollView 
            style={styles.notificationList} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            {notificationsLoading ? (
              <View style={styles.loadingContainer}>
                <RadixIcons.Loading size={20} color="#6B7280" />
                <Text style={styles.loadingText}>Cargando notificaciones...</Text>
              </View>
            ) : notificaciones.length > 0 ? (
              notificaciones.map((notificacion) => {
                const color = getNotificationColor(notificacion.tipo);
                
                return (
                  <TouchableOpacity
                    key={notificacion.id}
                    style={[
                      styles.notificationCard,
                      !notificacion.leida && styles.unreadNotification
                    ]}
                    onPress={() => {
                      console.log('🔍 DynamicHeader: Notification item pressed:', notificacion);
                      handleItemPress(notificacion);
                    }}
                  >
                    <View style={[styles.notificationIcon, { backgroundColor: color + '20' }]}>
                      <RadixIcons.Bell size={14} color={color} />
                    </View>
                    <View style={styles.notificationContent}>
                      <Text style={styles.notificationTitle}>{notificacion.titulo}</Text>
                      <Text style={styles.notificationMessage}>{notificacion.mensaje}</Text>
                      <View style={styles.notificationMeta}>
                        <Text style={styles.notificationSender}>{notificacion.tipo}</Text>
                        <Text style={styles.notificationTime}>{formatTimestamp(notificacion.created_at)}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={styles.noNotifications}>
                <RadixIcons.Bell size={20} color="#9CA3AF" />
                <Text style={styles.noNotificationsText}>No hay notificaciones</Text>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      )}

      {/* Bottom Sheet para móvil */}
      {isMobile && showSheet && (
        <BottomSheet open={showSheet} onClose={handleSheetClose}>
          <View style={styles.sheetContent}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>
                {selectedItem && 'type' in selectedItem ? 'Detalles del Resultado' : 'Notificación'}
              </Text>
              <TouchableOpacity onPress={handleSheetClose} style={styles.sheetCloseButton}>
                <RadixIcons.Close size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.sheetBody} showsVerticalScrollIndicator={false}>
              {renderItemDetails()}
            </ScrollView>
          </View>
        </BottomSheet>
      )}

            {/* Aside Panel para desktop - Posición fija */}
      {!isMobile && showSheet && selectedItem && (
        <AsidePanel 
          open={showSheet} 
          onClose={handleSheetClose}
          onApprove={handleApprove}
          onReject={handleReject}
          onComment={handleComment}
          onSign={handleSign}
          showApprovalActions={consultType === 'peticion'}
          peticionInfo={peticionInfo}
        >
          {renderItemDetails()}
        </AsidePanel>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 99999, // Aumentar z-index para asegurar que esté por encima
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    elevation: 2,
    zIndex: 9999,
    minHeight: 60,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  notificationButton: {
    position: 'relative',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 0,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 'auto',
    justifyContent: 'flex-end',
    paddingLeft: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  profileInfo: {
    flex: 1,
    maxWidth: 120, // Limitar ancho para evitar desbordamiento
  },
  profileName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 1,
  },
  profileEmail: {
    fontSize: 10,
    color: '#6B7280',
  },
  searchMode: {
    position: 'absolute',
    top: 60, // Empezar debajo del header
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 8,
    zIndex: 10000,
    maxHeight: Dimensions.get('window').height * 0.5, // Reducir altura
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F8FAFC',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    paddingVertical: 4,
  },
  searchResults: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 16,
    maxHeight: Dimensions.get('window').height * 0.5, // 50% para el contenido scrollable
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    marginBottom: 8,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  resultIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  resultSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  noResultsText: {
    fontSize: 15,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  notificationMode: {
    position: 'absolute',
    top: 60, // Empezar debajo del header
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 8,
    zIndex: 10000,
    maxHeight: Dimensions.get('window').height * 0.5, // Reducir altura
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F8FAFC',
  },
  notificationTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },
  notificationList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 16,
    maxHeight: Dimensions.get('window').height * 0.5, // 50% para el contenido scrollable
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    marginBottom: 6,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  unreadNotification: {
    backgroundColor: '#F0F9FF',
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  notificationIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 3,
    lineHeight: 18,
  },
  notificationMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  notificationSender: {
    fontSize: 11,
    color: '#3B82F6',
    fontWeight: '500',
  },
  notificationTime: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  noNotifications: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  noNotificationsText: {
    fontSize: 15,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  // Estilos para Bottom Sheet
  sheetContent: {
    flex: 1,
    padding: 24,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  sheetCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetBody: {
    flex: 1,
  },
  // Estilos para Aside Panel
  asideContent: {
    flex: 1,
    padding: 24,
    paddingBottom: 100,
  },
  asideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  asideTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  asideCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  asideBody: {
    flex: 1,
  },
  // Estilos para detalles del contenido
  detailContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingBottom: 100,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  detailIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
  },
  detailInfo: {
    flex: 1,
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  detailSubtitle: {
    fontSize: 15,
    color: '#6B7280',
  },
  detailSection: {
    marginBottom: 28,
  },
  detailSectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 14,
  },
  detailMessage: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailData: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  detailLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
  },

  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionText: {
    fontSize: 13,
    color: '#3B82F6',
    marginLeft: 8,
  },
  approveButton: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  approveText: {
    color: '#FFFFFF',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  rejectText: {
    color: '#FFFFFF',
  },
  commentInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    fontSize: 14,
    color: '#111827',
    minHeight: 80,
    textAlignVertical: 'top',
  },
});

export default DynamicHeader; 