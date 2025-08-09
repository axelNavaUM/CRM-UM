import AlumnoDetail from '@/components/alumnos/AlumnoDetail';
import { useAuth } from '@/context/AuthContext';
import { useSheetsContext } from '@/context/SheetsContext';
import { useSheet } from '@/hooks/useSheet';
import { SearchResult, SearchService } from '@/services/searchService';
import { supabase } from '@/services/supabase/supaConf';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Keyboard,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import BottomSheet from './BottomSheet';
import RadixIcons from './RadixIcons';

const { width: screenWidth } = Dimensions.get('window');

interface MobileSearchProps {
  visible: boolean;
  onClose: () => void;
  onResultPress?: (result: SearchResult) => void;
}

interface Carrera {
  id: number;
  nombre: string;
  duracion_anios: number;
}

interface Ciclo {
  id: number;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  carrera_id: number;
}

const MobileSearch: React.FC<MobileSearchProps> = ({
  visible,
  onClose,
  onResultPress,
}) => {
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [carreraActual, setCarreraActual] = useState<Carrera | null>(null);
  const [cicloActual, setCicloActual] = useState<Ciclo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tramitesPendientes, setTramitesPendientes] = useState<any>(null);
  const [documentosFaltantes, setDocumentosFaltantes] = useState<any>(null);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [ciclos, setCiclos] = useState<Ciclo[]>([]);
  const [showFormulario, setShowFormulario] = useState(false);
  const [form, setForm] = useState({
    carrera_nueva_id: '',
    ciclo_nuevo_id: '',
    grupo_nuevo: 'A',
    motivo: ''
  });
  const { showSheet, hideSheet } = useSheet();
  const { addSheet, removeSheet } = useSheetsContext();
  const { user } = useAuth();
  
  const router = useRouter();
  const searchInputRef = useRef<TextInput>(null);

  // Animación de entrada
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 100);
      });
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  // Búsqueda en tiempo real
  useEffect(() => {
    if (searchText.length > 2) {
      performSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchText]);

  const performSearch = async () => {
    setIsSearching(true);
    try {
      const results = await SearchService.globalSearch(searchText);
      setSearchResults(results);
    } catch (error) {
      console.error('Error en búsqueda:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Manejar cierre de búsqueda
  const handleClose = () => {
    Keyboard.dismiss();
    setSearchText('');
    setSearchResults([]);
    onClose();
  };

  // Abrir flujo completo (Bottom Sheet) reutilizando AlumnoDetail como en Explore
  const openAlumnoDetailForChange = (result: SearchResult) => {
    if (result.type !== 'alumno' || !result.data?.id) return;
    const sheetId = `alumno-${result.data.id}`;
    const alumnoData: any = {
      id: result.data.id,
      nombre: result.data.nombre,
      apellidos: result.data.apellidos,
      email: result.data.email,
      carrera_id: Number(result.data.carrera_id || 0),
      ciclo_id: Number(result.data.ciclo_id || 0),
      status: result.data.status || 'pendiente',
    };
    addSheet(sheetId, (
      <BottomSheet open={true} onClose={() => removeSheet(sheetId)}>
        <AlumnoDetail alumno={alumnoData} onClose={() => removeSheet(sheetId)} user={user} />
      </BottomSheet>
    ));
  };

  // Cargar datos del alumno si es de tipo alumno
  const loadAlumnoData = async (result: SearchResult) => {
    if (result.type === 'alumno' && result.data?.id) {
      setIsLoading(true);
      try {
        // Cargar carrera actual del alumno
        if (result.data.carrera_id) {
          const { data: carreraData } = await supabase
            .from('carreras')
            .select('*')
            .eq('id', result.data.carrera_id)
            .single();
          setCarreraActual(carreraData);
        }

        // Cargar ciclo actual del alumno
        if (result.data.ciclo_id) {
          const { data: cicloData } = await supabase
            .from('ciclos')
            .select('*')
            .eq('id', result.data.ciclo_id)
            .single();
          setCicloActual(cicloData);
        }

        // Cargar todas las carreras para el formulario
        const { data: carrerasData } = await supabase.from('carreras').select('*');
        setCarreras(carrerasData || []);

        // Verificar trámites pendientes
        await verificarTramitesPendientes(result.data.id);

        // Verificar documentos faltantes
        await verificarDocumentosFaltantes(result.data.id);

      } catch (error) {
        console.error('Error al cargar datos del alumno:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Cargar ciclos cuando se selecciona una nueva carrera
  const loadCiclos = async (carreraId: string) => {
    if (carreraId) {
      const { data: ciclosData } = await supabase
        .from('ciclos')
        .select('*')
        .eq('carrera_id', parseInt(carreraId));
      setCiclos(ciclosData || []);
    }
  };

  const verificarTramitesPendientes = async (alumnoId: number) => {
    try {
      const tramitesPendientes = [];

      // 1. Verificar si el alumno está pendiente
      const { data: alumno } = await supabase
        .from('alumnos')
        .select('status, carrera_id, ciclo_id')
        .eq('id', alumnoId)
        .single();

      if (alumno?.status === 'pendiente') {
        tramitesPendientes.push('Registro de alumno pendiente');
      }

      // 2. Verificar si no tiene carrera asignada
      if (!alumno?.carrera_id) {
        tramitesPendientes.push('Carrera no asignada');
      }

      // 3. Verificar si no tiene ciclo asignado
      if (!alumno?.ciclo_id) {
        tramitesPendientes.push('Ciclo no asignado');
      }

      // 4. Verificar documentos faltantes
      const { data: documentos } = await supabase
        .from('documentos_alumno')
        .select('tipo_documento')
        .eq('alumno_id', alumnoId);

      const documentosRequeridos = ['acta', 'certificado_prepa', 'formato_pago'];
      const documentosSubidos = documentos?.map(d => d.tipo_documento) || [];
      
      const documentosFaltantes = documentosRequeridos.filter(doc => !documentosSubidos.includes(doc));
      
      if (documentosFaltantes.length > 0) {
        tramitesPendientes.push('Documentos faltantes');
      }

      // 5. Verificar si tiene peticiones de cambio de carrera pendientes
      const { data: peticionesPendientes } = await supabase
        .from('peticiones_cambio_carrera')
        .select('estado')
        .eq('alumno_id', alumnoId)
        .eq('estado', 'pendiente');

      if (peticionesPendientes && peticionesPendientes.length > 0) {
        tramitesPendientes.push('Petición de cambio de carrera pendiente');
      }

      // 6. Verificar si tiene deudas o pagos pendientes
      const { data: pagosPendientes } = await supabase
        .from('pagos')
        .select('status')
        .eq('alumno_id', alumnoId)
        .eq('status', 'pendiente');

      if (pagosPendientes && pagosPendientes.length > 0) {
        tramitesPendientes.push('Pagos pendientes');
      }

      // 7. Verificar si tiene sanciones activas
      const { data: sanciones } = await supabase
        .from('sanciones')
        .select('status')
        .eq('alumno_id', alumnoId)
        .eq('status', 'activa');

      if (sanciones && sanciones.length > 0) {
        tramitesPendientes.push('Sanciones activas');
      }

      // 8. Verificar si tiene materias reprobadas sin resolver
      const { data: materiasReprobadas } = await supabase
        .from('calificaciones')
        .select('calificacion')
        .eq('alumno_id', alumnoId)
        .lt('calificacion', 6);

      if (materiasReprobadas && materiasReprobadas.length > 0) {
        tramitesPendientes.push('Materias reprobadas pendientes');
      }

      // 9. Verificar si tiene inasistencias excesivas
      const { data: inasistencias } = await supabase
        .from('asistencias')
        .select('tipo')
        .eq('alumno_id', alumnoId)
        .eq('tipo', 'inasistencia');

      if (inasistencias && inasistencias.length > 10) {
        tramitesPendientes.push('Inasistencias excesivas');
      }

      // 10. Verificar si tiene requisitos de titulación pendientes
      const { data: requisitosTitulacion } = await supabase
        .from('requisitos_titulacion')
        .select('status')
        .eq('alumno_id', alumnoId)
        .eq('status', 'pendiente');

      if (requisitosTitulacion && requisitosTitulacion.length > 0) {
        tramitesPendientes.push('Requisitos de titulación pendientes');
      }

      if (tramitesPendientes.length > 0) {
        setTramitesPendientes({
          tieneTramitesPendientes: true,
          tramitesPendientes: tramitesPendientes
        });
      } else {
        setTramitesPendientes({
          tieneTramitesPendientes: false,
          tramitesPendientes: []
        });
      }
    } catch (error) {
      console.error('Error al verificar trámites pendientes:', error);
      // En caso de error, asumir que hay trámites pendientes por seguridad
      setTramitesPendientes({
        tieneTramitesPendientes: true,
        tramitesPendientes: ['Error al verificar trámites']
      });
    }
  };

  const verificarDocumentosFaltantes = async (alumnoId: number) => {
    try {
      const { data: documentos } = await supabase
        .from('documentos_alumno')
        .select('*')
        .eq('alumno_id', alumnoId);

      const documentosFaltantes = [];
      if (!documentos || documentos.length === 0) {
        documentosFaltantes.push('Acta de nacimiento', 'Certificado de preparatoria', 'Comprobante de pago');
      } else {
        const documentosSubidos = documentos.map(d => d.tipo_documento);
        if (!documentosSubidos.includes('acta')) documentosFaltantes.push('Acta de nacimiento');
        if (!documentosSubidos.includes('certificado_prepa')) documentosFaltantes.push('Certificado de preparatoria');
        if (!documentosSubidos.includes('formato_pago')) documentosFaltantes.push('Comprobante de pago');
      }

      setDocumentosFaltantes({
        documentosFaltantes
      });
    } catch (error) {
      console.error('Error al verificar documentos faltantes:', error);
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (key === 'carrera_nueva_id') {
      loadCiclos(value);
    }
  };

  const handleCrearPeticionCambio = async () => {
    if (!form.carrera_nueva_id || !form.ciclo_nuevo_id || !form.motivo.trim()) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    if (!carreraActual || !cicloActual) {
      alert('No se pudo obtener la información actual del alumno');
      return;
    }

    try {
      // Aquí iría la lógica para crear la petición de cambio de carrera
      console.log('Creando petición de cambio de carrera...');
      alert('Petición de cambio de carrera creada exitosamente');
      setShowFormulario(false);
    } catch (error) {
      console.error('Error al crear petición:', error);
      alert('Error al crear la petición');
    }
  };

  // Manejar selección de resultado
  const handleResultPress = (result: SearchResult) => {
    // Cargar datos del alumno si es necesario
    if (result.type === 'alumno') {
      loadAlumnoData(result);
    }

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
            if (result.route) {
              router.push(result.route as any);
            }
          }}
        />
      </BottomSheet>
    ));
    
    onResultPress?.(result);
  };

  // Componente para el sheet de detalles
  const SearchDetailSheet: React.FC<{
    result: SearchResult;
    onClose: () => void;
    onNavigate: () => void;
  }> = ({ result, onClose, onNavigate }) => {
    const color = getResultColor(result.type);
    const IconComponent = RadixIcons[getResultIcon(result.type) as keyof typeof RadixIcons];

    return (
      <View style={styles.detailContainer}>
        <View style={styles.detailHeader}>
          <View style={[styles.detailIcon, { backgroundColor: color + '20' }]}>
            <IconComponent size={24} color={color} />
          </View>
          <View style={styles.detailInfo}>
            <Text style={styles.detailTitle}>{result.title}</Text>
            <Text style={styles.detailType}>
              {result.type.toUpperCase()}
            </Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <RadixIcons.Close size={20} color="#666666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.detailContent} showsVerticalScrollIndicator={false}>
          {/* Si es un alumno, mostrar información detallada */}
          {result.type === 'alumno' && result.data ? (
            <>
              {/* Información del alumno */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Información del Alumno</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Nombre:</Text>
                  <Text style={styles.value}>
                    {result.data.nombre} {result.data.apellidos}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Email:</Text>
                  <Text style={styles.value}>{result.data.email}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Estado:</Text>
                  <Text style={[styles.value, { color: result.data.status === 'pendiente' ? '#ffc107' : '#28a745' }]}>
                    {result.data.status || 'Activo'}
                  </Text>
                </View>
              </View>

              {/* Información actual */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Información Actual</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Carrera:</Text>
                  <Text style={styles.value}>
                    {isLoading ? 'Cargando...' : (carreraActual?.nombre || 'No disponible')}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Ciclo:</Text>
                  <Text style={styles.value}>
                    {isLoading ? 'Cargando...' : (cicloActual?.nombre || 'No disponible')}
                  </Text>
                </View>
              </View>

              {/* Estado de trámites pendientes */}
              {tramitesPendientes && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Estado de Trámites</Text>
                  {tramitesPendientes.tieneTramitesPendientes ? (
                    <View style={styles.warningContainer}>
                      <Text style={styles.warningIcon}>⚠️</Text>
                      <Text style={styles.warningTitle}>Trámites Pendientes</Text>
                      <Text style={styles.warningText}>
                        El alumno tiene los siguientes trámites pendientes:
                      </Text>
                      {tramitesPendientes.tramitesPendientes.map((tramite: string, index: number) => (
                        <Text key={index} style={styles.tramiteItem}>• {tramite}</Text>
                      ))}
                      <Text style={styles.warningNote}>
                        No se pueden crear nuevas peticiones hasta que se resuelvan estos trámites.
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.successContainer}>
                      <Text style={styles.successIcon}>✅</Text>
                      <Text style={styles.successTitle}>Sin Trámites Pendientes</Text>
                      <Text style={styles.successText}>
                        El alumno no tiene trámites pendientes y puede solicitar cambios de carrera.
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Documentos faltantes */}
              {documentosFaltantes && documentosFaltantes.documentosFaltantes.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Documentos Faltantes</Text>
                  <View style={styles.warningContainer}>
                    <Text style={styles.warningIcon}>📄</Text>
                    <Text style={styles.warningTitle}>Documentos Pendientes</Text>
                    <Text style={styles.warningText}>
                      El alumno tiene los siguientes documentos faltantes:
                    </Text>
                    {documentosFaltantes.documentosFaltantes.map((documento: string, index: number) => (
                      <Text key={index} style={styles.tramiteItem}>• {documento}</Text>
                    ))}
                  </View>
                </View>
              )}

          {/* Formulario de cambio de carrera */}
          {!tramitesPendientes?.tieneTramitesPendientes && (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Solicitar Cambio de Carrera</Text>
              
              {!showFormulario ? (
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: color }]}
                    onPress={() => setShowFormulario(true)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.actionButtonText}>Nueva Solicitud de Cambio</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#111827' }]}
                    onPress={() => openAlumnoDetailForChange(result)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.actionButtonText}>Abrir flujo completo</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                    <>
                      <View style={styles.formGroup}>
                        <Text style={styles.label}>Nueva Carrera *</Text>
                        <View style={styles.pickerContainer}>
                          <Text style={styles.pickerText}>
                            {form.carrera_nueva_id ? 
                              carreras.find(c => c.id.toString() === form.carrera_nueva_id)?.nombre || 'Selecciona una carrera' :
                              'Selecciona una carrera'
                            }
                          </Text>
                        </View>
                      </View>

                      <View style={styles.formGroup}>
                        <Text style={styles.label}>Nuevo Ciclo *</Text>
                        <View style={styles.pickerContainer}>
                          <Text style={styles.pickerText}>
                            {form.ciclo_nuevo_id ? 
                              ciclos.find(c => c.id.toString() === form.ciclo_nuevo_id)?.nombre || 'Selecciona un ciclo' :
                              'Selecciona un ciclo'
                            }
                          </Text>
                        </View>
                      </View>

                      <View style={styles.formGroup}>
                        <Text style={styles.label}>Motivo del Cambio *</Text>
                        <View style={styles.textAreaContainer}>
                          <Text style={styles.textAreaText}>
                            {form.motivo || 'Explica el motivo del cambio de carrera...'}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.buttonContainer}>
                        <TouchableOpacity
                          style={[styles.actionButton, { backgroundColor: color }]}
                          onPress={handleCrearPeticionCambio}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.actionButtonText}>Solicitar Cambio</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionButton, { backgroundColor: '#6B7280' }]}
                          onPress={() => setShowFormulario(false)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.actionButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </View>
              )}
            </>
          ) : (
            <>
              {/* Para otros tipos de resultados, mostrar información básica */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Descripción</Text>
                <View style={styles.detailDescriptionContainer}>
                  <Text style={styles.detailDescription}>{result.subtitle}</Text>
                </View>
              </View>

              {result.data && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Información</Text>
                  <View style={styles.detailDataContainer}>
                    {Object.entries(result.data).map(([key, value]) => (
                      <View key={key} style={styles.detailRow}>
                        <Text style={styles.detailLabel}>{key}:</Text>
                        <Text style={styles.detailValue}>{String(value)}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <View style={styles.detailActions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: color }]}
                  onPress={onNavigate}
                  activeOpacity={0.8}
                >
                  <RadixIcons.ArrowRight size={16} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Ver Detalles</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    );
  };

  // Obtener color del resultado
  const getResultColor = (type: string) => {
    switch (type) {
      case 'alumno': return '#3B82F6';
      case 'usuario': return '#10B981';
      case 'documento': return '#F59E0B';
      case 'peticion': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  // Obtener icono del resultado
  const getResultIcon = (type: string) => {
    switch (type) {
      case 'alumno': return 'Account';
      case 'usuario': return 'AccountCog';
      case 'documento': return 'FileText';
      case 'peticion': return 'ClipboardList';
      default: return 'Search';
    }
  };

  // Renderizar item de resultado
  const renderResultItem = (result: SearchResult) => {
    const IconComponent = RadixIcons[getResultIcon(result.type) as keyof typeof RadixIcons];
    const color = getResultColor(result.type);
    
    return (
      <TouchableOpacity
        style={styles.resultItem}
        onPress={() => handleResultPress(result)}
        activeOpacity={0.7}
      >
        <View style={[styles.resultIcon, { backgroundColor: color + '20' }]}>
          <IconComponent size={20} color={color} />
        </View>
        <View style={styles.resultContent}>
          <Text style={styles.resultTitle} numberOfLines={1}>
            {result.title}
          </Text>
          <Text style={styles.resultSubtitle} numberOfLines={2}>
            {result.subtitle}
          </Text>
          <View style={styles.resultMeta}>
            <Text style={styles.resultType}>
              {result.type.toUpperCase()}
            </Text>
            {result.data && (
              <Text style={styles.resultData}>
                ID: {result.id}
              </Text>
            )}
          </View>
        </View>
        <RadixIcons.ChevronRight size={16} color="#9CA3AF" />
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <RadixIcons.Close size={20} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Buscar</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <RadixIcons.Search size={18} color="#9CA3AF" />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Buscar alumnos, usuarios, documentos..."
              placeholderTextColor="#9CA3AF"
              value={searchText}
              onChangeText={setSearchText}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              onSubmitEditing={() => {
                if (searchResults.length > 0) {
                  handleResultPress(searchResults[0]);
                }
              }}
            />
            {isSearching && (
              <RadixIcons.Loading size={18} color="#6B7280" />
            )}
            {searchText.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchText('')}
                style={styles.clearButton}
                activeOpacity={0.7}
              >
                <RadixIcons.Close size={16} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView 
          style={styles.resultsContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {searchResults.length > 0 ? (
            searchResults.map((result) => (
              <View key={result.id} style={styles.resultWrapper}>
                {renderResultItem(result)}
              </View>
            ))
          ) : searchText.length > 2 ? (
            <View style={styles.emptyContainer}>
              <RadixIcons.Search size={48} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No se encontraron resultados</Text>
              <Text style={styles.emptySubtitle}>
                Intenta con otros términos de búsqueda
              </Text>
            </View>
          ) : searchText.length > 0 ? (
            <View style={styles.emptyContainer}>
              <RadixIcons.Loading size={48} color="#6B7280" />
              <Text style={styles.emptyTitle}>Buscando...</Text>
              <Text style={styles.emptySubtitle}>
                Buscando resultados para "{searchText}"
              </Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <RadixIcons.Search size={48} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>Buscar en el sistema</Text>
              <Text style={styles.emptySubtitle}>
                Escribe para buscar alumnos, usuarios, documentos y más
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 4,
  },
  clearButton: {
    padding: 4,
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  resultWrapper: {
    marginBottom: 8,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  resultIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  resultSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  resultMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultType: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  resultData: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  detailContainer: {
    flex: 1,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  detailIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  detailInfo: {
    flex: 1,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  detailType: {
    fontSize: 14,
    color: '#6B7280',
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  detailContent: {
    flex: 1,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  detailDescriptionContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailDescription: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  detailDataContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  detailActions: {
    marginTop: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    width: 80,
  },
  value: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  warningContainer: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 8,
    padding: 16,
  },
  warningIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#92400E',
    marginBottom: 8,
  },
  tramiteItem: {
    fontSize: 14,
    color: '#92400E',
    marginLeft: 8,
    marginBottom: 4,
  },
  warningNote: {
    fontSize: 12,
    color: '#92400E',
    fontStyle: 'italic',
    marginTop: 8,
  },
  successContainer: {
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 8,
    padding: 16,
  },
  successIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 8,
  },
  successText: {
    fontSize: 14,
    color: '#065F46',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    marginTop: 4,
    padding: 12,
  },
  pickerText: {
    fontSize: 14,
    color: '#111827',
  },
  textAreaContainer: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    marginTop: 4,
    padding: 12,
    minHeight: 100,
  },
  textAreaText: {
    fontSize: 14,
    color: '#111827',
    lineHeight: 20,
  },
});

export default MobileSearch; 