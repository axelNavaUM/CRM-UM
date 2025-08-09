import AsidePanel from '@/components/ui/AsidePanel';
import BottomSheet from '@/components/ui/BottomSheet';
import RadixIcons from '@/components/ui/RadixIcons';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/hooks/notifications/useNotifications';
import { supabase } from '@/services/supabase/supaConf';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export default function NotificacionesScreen() {
  const { notificaciones, loading, markAsRead } = useNotifications();
  const { user } = useAuth();
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [alumnoData, setAlumnoData] = useState<any>(null);
  const [cambioCarreraData, setCambioCarreraData] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isMobileForPanel = width < 768;

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} h`;
    return `${Math.floor(diffInMinutes / 1440)} d`;
  };

  const getNotificationColor = (tipo: string) => {
    switch (tipo) {
      case 'success': return '#10B981';
      case 'warning': return '#F59E0B';
      case 'error': return '#EF4444';
      case 'cambio_carrera': return '#3B82F6';
      default: return '#3B82F6';
    }
  };

  const fetchAlumnoData = async (alumnoId: number) => {
    try {
      console.log('🔍 NotificacionesScreen: Fetching alumno data for ID:', alumnoId);
      
      const { data: alumno, error: alumnoError } = await supabase
        .from('alumnos')
        .select(`
          *,
          carreras(nombre)
        `)
        .eq('id', alumnoId)
        .single();

      if (alumnoError) {
        console.error('Error fetching alumno:', alumnoError);
        return null;
      }

      console.log('🔍 NotificacionesScreen: Alumno data fetched:', alumno);
      return alumno;
    } catch (error) {
      console.error('Error fetching alumno data:', error);
      return null;
    }
  };

  const fetchCambioCarreraData = async (peticionId: number) => {
    try {
      console.log('🔍 NotificacionesScreen: Fetching cambio carrera data for ID:', peticionId);
      
      const { data: peticion, error: peticionError } = await supabase
        .from('peticiones_cambio_carrera')
        .select(`
          *,
          alumno:alumnos(nombre, apellidos, matricula, email),
          carrera_actual:carreras!carrera_actual_id(nombre),
          carrera_nueva:carreras!carrera_nueva_id(nombre)
        `)
        .eq('id', peticionId)
        .single();

      if (peticionError) {
        console.error('Error fetching cambio carrera:', peticionError);
        return null;
      }

      console.log('🔍 NotificacionesScreen: Cambio carrera data fetched:', peticion);
      return peticion;
    } catch (error) {
      console.error('Error fetching cambio carrera data:', error);
      return null;
    }
  };

  const handleNotificationPress = async (notification: any) => {
    setSelectedNotification(notification);
    setShowDetail(true);
    setLoadingDetail(true);
    
    // Marcar como leída si no lo está
    if (!notification.leida) {
      await markAsRead(notification.id);
    }

    try {
      // Cargar datos adicionales según el tipo de notificación
      if (notification.tipo === 'cambio_carrera' && notification.datos_adicionales?.alumno_id) {
        const alumnoData = await fetchAlumnoData(notification.datos_adicionales.alumno_id);
        setAlumnoData(alumnoData);
      }

      if (notification.tipo === 'cambio_carrera' && notification.datos_adicionales?.peticion_id) {
        const cambioCarreraData = await fetchCambioCarreraData(notification.datos_adicionales.peticion_id);
        setCambioCarreraData(cambioCarreraData);
      }
    } catch (error) {
      console.error('Error loading notification details:', error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedNotification(null);
    setAlumnoData(null);
    setCambioCarreraData(null);
  };

  const renderNotificationItem = ({ item }: { item: any }) => {
    const color = getNotificationColor(item.tipo);
    const isCambioCarrera = item.tipo === 'cambio_carrera' || 
                            /cambio de carrera/i.test(item.titulo || '') ||
                            /cambio de carrera/i.test(item.mensaje || '');

    return (
      <TouchableOpacity
        style={[
          styles.notificationCard,
          !item.leida && styles.unreadNotification
        ]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={[styles.notificationIcon, { backgroundColor: color + '20' }]}>
          <RadixIcons.Bell size={16} color={color} />
        </View>
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{item.titulo}</Text>
          <Text style={styles.notificationMessage}>{item.mensaje}</Text>
          {isCambioCarrera && (
            <Text style={styles.firmaLink}>firma_cambio_carrera</Text>
          )}
          <View style={styles.notificationMeta}>
            <Text style={styles.notificationSender}>{item.tipo}</Text>
            <Text style={styles.notificationTime}>{formatTimestamp(item.created_at)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderNotificationDetail = () => {
    if (!selectedNotification) return null;

    if (loadingDetail) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando información...</Text>
        </View>
      );
    }

    const isCambioCarrera = selectedNotification.tipo === 'cambio_carrera' || 
                            /cambio de carrera/i.test(selectedNotification.titulo || '') ||
                            /cambio de carrera/i.test(selectedNotification.mensaje || '');

    if (isCambioCarrera) {
      return (
        <View style={styles.detailContent}>
          <View style={styles.detailHeader}>
            <View style={[styles.detailIcon, { backgroundColor: getNotificationColor(selectedNotification.tipo) + '20' }]}>
              <RadixIcons.Bell size={24} color={getNotificationColor(selectedNotification.tipo)} />
            </View>
            <View style={styles.detailInfo}>
              <Text style={styles.detailTitle}>{selectedNotification.titulo}</Text>
              <Text style={styles.detailSubtitle}>Cambio de Carrera</Text>
            </View>
          </View>
          
          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>Mensaje</Text>
            <Text style={styles.detailMessage}>{selectedNotification.mensaje}</Text>
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
                  <Text style={[styles.detailValue, { color: '#F59E0B' }]}>pendiente</Text>
                </View>
              </View>
            </View>
          )}

          {/* Información Actual */}
          {alumnoData && (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Información Actual</Text>
              <View style={styles.detailData}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Carrera:</Text>
                  <Text style={styles.detailValue}>
                    {alumnoData.carreras?.nombre || 'No especificada'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Ciclo:</Text>
                  <Text style={styles.detailValue}>2025/2025-ECA-1</Text>
                </View>
              </View>
            </View>
          )}

          {/* Estado de Trámites */}
          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>Estado de Trámites</Text>
            <View style={styles.warningContainer}>
              <View style={styles.warningIcon}>
                <RadixIcons.Warning size={24} color="#F59E0B" />
              </View>
              <View style={styles.warningContent}>
                <Text style={styles.warningTitle}>Trámites Pendientes</Text>
                <Text style={styles.warningText}>
                  El alumno tiene los siguientes trámites pendientes:
                </Text>
                <Text style={styles.warningItem}>• Registro de alumno pendiente</Text>
                {cambioCarreraData && (
                  <Text style={styles.warningItem}>• Petición de cambio de carrera pendiente</Text>
                )}
                <Text style={styles.warningNote}>
                  No se pueden crear nuevas peticiones hasta que se resuelvan estos trámites.
                </Text>
              </View>
            </View>
          </View>

          {/* Información de Cambio de Carrera */}
          {cambioCarreraData && (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Detalles de la Solicitud</Text>
              <View style={styles.detailData}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Carrera Actual:</Text>
                  <Text style={styles.detailValue}>
                    {cambioCarreraData.carreras_actuales?.nombre || 'No especificada'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Carrera Solicitada:</Text>
                  <Text style={styles.detailValue}>
                    {cambioCarreraData.carreras_solicitadas?.nombre || 'No especificada'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Fecha de Solicitud:</Text>
                  <Text style={styles.detailValue}>
                    {new Date(cambioCarreraData.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Estado:</Text>
                  <Text style={[styles.detailValue, { 
                    color: cambioCarreraData.status === 'pendiente' ? '#F59E0B' : 
                           cambioCarreraData.status === 'aprobado' ? '#10B981' : '#EF4444'
                  }]}>
                    {cambioCarreraData.status || 'Pendiente'}
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
            <Text style={styles.commentInput}>
              Agregar comentario (opcional)...
            </Text>
          </View>
          
          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>Información</Text>
            <View style={styles.detailData}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Estado:</Text>
                <Text style={[styles.detailValue, { color: selectedNotification.leida ? '#10B981' : '#F59E0B' }]}>
                  {selectedNotification.leida ? 'Leída' : 'No leída'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Fecha:</Text>
                <Text style={styles.detailValue}>{formatTimestamp(selectedNotification.created_at)}</Text>
              </View>
            </View>
          </View>
        </View>
      );
    } else {
      return (
        <View style={styles.detailContent}>
          <View style={styles.detailHeader}>
            <View style={[styles.detailIcon, { backgroundColor: getNotificationColor(selectedNotification.tipo) + '20' }]}>
              <RadixIcons.Bell size={24} color={getNotificationColor(selectedNotification.tipo)} />
            </View>
            <View style={styles.detailInfo}>
              <Text style={styles.detailTitle}>{selectedNotification.titulo}</Text>
              <Text style={styles.detailSubtitle}>{selectedNotification.tipo}</Text>
            </View>
          </View>
          
          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>Mensaje</Text>
            <Text style={styles.detailMessage}>{selectedNotification.mensaje}</Text>
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
                  <Text style={[styles.detailValue, { color: '#F59E0B' }]}>pendiente</Text>
                </View>
              </View>
            </View>
          )}

          {/* Información Actual */}
          {alumnoData && (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Información Actual</Text>
              <View style={styles.detailData}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Carrera:</Text>
                  <Text style={styles.detailValue}>
                    {alumnoData.carreras?.nombre || 'No especificada'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Ciclo:</Text>
                  <Text style={styles.detailValue}>2025/2025-ECA-1</Text>
                </View>
              </View>
            </View>
          )}

          {/* Estado de Trámites */}
          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>Estado de Trámites</Text>
            <View style={styles.warningContainer}>
              <View style={styles.warningIcon}>
                <RadixIcons.Warning size={24} color="#F59E0B" />
              </View>
              <View style={styles.warningContent}>
                <Text style={styles.warningTitle}>Trámites Pendientes</Text>
                <Text style={styles.warningText}>
                  El alumno tiene los siguientes trámites pendientes:
                </Text>
                <Text style={styles.warningItem}>• Registro de alumno pendiente</Text>
                <Text style={styles.warningNote}>
                  No se pueden crear nuevas peticiones hasta que se resuelvan estos trámites.
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>Información</Text>
            <View style={styles.detailData}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Estado:</Text>
                <Text style={[styles.detailValue, { color: selectedNotification.leida ? '#10B981' : '#F59E0B' }]}>
                  {selectedNotification.leida ? 'Leída' : 'No leída'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Fecha:</Text>
                <Text style={styles.detailValue}>{formatTimestamp(selectedNotification.created_at)}</Text>
              </View>
            </View>
          </View>
        </View>
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando notificaciones...</Text>
      </View>
    );
  }

  return (
    <>
      {isMobile && (
        <Stack.Screen options={{ headerShown: false }} />
      )}
      <View style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
      {/* Panel de Notificaciones */}
      <View style={styles.notificationsPanel}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>Notificaciones</Text>
          <TouchableOpacity 
            style={styles.testButton}
            onPress={() => {
              console.log('🔍 Test button pressed');
              if (notificaciones.length > 0) {
                handleNotificationPress(notificaciones[0]);
              }
            }}
          >
            <Text style={styles.testButtonText}>Test Selección</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={notificaciones}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderNotificationItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={isMobile ? { paddingBottom: 120 } : styles.notificationsList}
          style={{ flex: 1 }}
        />
      </View>

      {/* Panel/BottomSheet para detalle de notificación */}
      {selectedNotification && (
        isMobile ? (
          <BottomSheet 
            open={showDetail} 
            onClose={handleCloseDetail}
            height="95%"
          >
            <View style={styles.sheetContent}>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>
                  {selectedNotification && 'type' in selectedNotification ? 'Detalles del Resultado' : 'Notificación'}
                </Text>
                <TouchableOpacity onPress={handleCloseDetail} style={styles.sheetCloseButton}>
                  <RadixIcons.Close size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.sheetBody} showsVerticalScrollIndicator={false}>
                {renderNotificationDetail()}
              </ScrollView>
            </View>
          </BottomSheet>
        ) : (
          <AsidePanel 
            open={showDetail} 
            onClose={handleCloseDetail}
          >
            {renderNotificationDetail()}
          </AsidePanel>
        )
      )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    height: '100%',
  },
  notificationsPanel: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    height: '100%',
  },
  panelHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  panelTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
  },
  notificationsList: {
    padding: 16,
    paddingBottom: 200,
  },
  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  unreadNotification: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  notificationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  firmaLink: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
    marginBottom: 8,
  },
  notificationMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationSender: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  notificationTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },

  noSelectionText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 40,
  },
  debugText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  testButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#3B82F6',
    borderRadius: 6,
    marginLeft: 12,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 40,
  },
  // Estilos para el contenido detallado
  detailContent: {
    flex: 1,
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
    color: '#9CA3AF',
    minHeight: 80,
    textAlignVertical: 'top',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  // Estilos para el contenedor de advertencia
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  warningIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#FEF3C7',
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#991B1B',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 13,
    color: '#991B1B',
    marginBottom: 8,
  },
  warningItem: {
    fontSize: 13,
    color: '#991B1B',
    marginBottom: 4,
  },
  warningNote: {
    fontSize: 12,
    color: '#991B1B',
    marginTop: 8,
  },
});