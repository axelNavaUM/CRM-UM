import AlumnoDetail from '@/components/alumnos/AlumnoDetail';
import { useAsidePanel } from '@/context/AsidePanelContext';
import { useAuth } from '@/context/AuthContext';
import { useCambioCarrera } from '@/hooks/cambioCarrera/useCambioCarrera';
import { Alumno } from '@/models/registroAlumnoModel';
import { SearchResult } from '@/services/searchService';
import { supabase } from '@/services/supabase/supaConf';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import RadixIcons from './RadixIcons';

interface SearchAsideContentProps {
  result: SearchResult;
  onClose: () => void;
  onBack: () => void;
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



const SearchAsideContent: React.FC<SearchAsideContentProps> = ({
  result,
  onClose,
  onBack
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const { handleCrearPeticion } = useCambioCarrera(user);
  const { openAsidePanel } = useAsidePanel();
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



  // Cargar datos del alumno si es de tipo alumno
  useEffect(() => {
    const loadAlumnoData = async () => {
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

    loadAlumnoData();
  }, [result]);

  // Cargar ciclos cuando se selecciona una nueva carrera
  useEffect(() => {
    const loadCiclos = async () => {
      if (form.carrera_nueva_id) {
        const { data: ciclosData } = await supabase
          .from('ciclos')
          .select('*')
          .eq('carrera_id', parseInt(form.carrera_nueva_id));
        setCiclos(ciclosData || []);
      }
    };

    loadCiclos();
  }, [form.carrera_nueva_id]);

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
      const resultCreate = await handleCrearPeticion({
        alumno_id: result.data.id,
        carrera_actual_id: carreraActual.id,
        carrera_nueva_id: parseInt(form.carrera_nueva_id),
        ciclo_actual_id: cicloActual.id,
        ciclo_nuevo_id: parseInt(form.ciclo_nuevo_id),
        grupo_actual: 'A',
        grupo_nuevo: form.grupo_nuevo,
        motivo: form.motivo.trim()
      });

      if (resultCreate?.success) {
        alert('Petición de cambio de carrera creada exitosamente');
        setShowFormulario(false);
      } else {
        alert('No se pudo crear la petición: ' + (resultCreate?.error || 'Error desconocido'));
      }
    } catch (error: any) {
      console.error('Error al crear petición desde aside:', error);
      alert('Error al crear la petición: ' + (error?.message || 'Error desconocido'));
    }
  };

  // Abrir el flujo completo reutilizando AlumnoDetail (mismo comportamiento que panel del asesor)
  const openAlumnoDetailForChange = () => {
    try {
      const alumnoData: Alumno = {
        id: result.data.id,
        nombre: result.data.nombre,
        apellidos: result.data.apellidos,
        email: result.data.email,
        carrera_id: Number(result.data.carrera_id || 0),
        ciclo_id: Number(result.data.ciclo_id || 0),
        status: result.data.status || 'pendiente',
      } as any;

      // Cerrar buscador y abrir Aside global con AlumnoDetail
      onClose();
      openAsidePanel(
        <AlumnoDetail alumno={alumnoData} onClose={() => {}} user={user} />,
        'Detalle del Alumno'
      );
    } catch (e) {
      console.error('Error al abrir detalle de alumno desde buscador:', e);
    }
  };

  // Verificación de seguridad para el resultado
  if (!result) {
    return (
      <View style={styles.container}>
        <Text>Error: No hay resultado para mostrar</Text>
      </View>
    );
  }

  const getResultColor = (type: string) => {
    switch (type) {
      case 'alumno': return '#3B82F6';
      case 'usuario': return '#10B981';
      case 'peticion': return '#F59E0B';
      case 'carrera': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'alumno': return RadixIcons.User;
      case 'usuario': return RadixIcons.Users;
      case 'peticion': return RadixIcons.FileText;
      case 'carrera': return RadixIcons.Graduation;
      default: return RadixIcons.Search;
    }
  };

  const handleNavigate = () => {
    onClose();
    if (result.route && typeof result.route === 'string') {
      router.push(result.route as any);
    }
  };

  const color = getResultColor(result.type);
  const IconComponent = getResultIcon(result.type);

  // Verificación de seguridad
  if (!IconComponent || !RadixIcons.ArrowLeft || !RadixIcons.Close || !RadixIcons.ArrowRight) {
    return (
      <View style={styles.container}>
        <Text>Error: Iconos no disponibles</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header con botón de volver y cerrar */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={onBack}
          activeOpacity={0.7}
        >
          <RadixIcons.ArrowLeft size={20} color="#6B7280" />
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={onClose}
          activeOpacity={0.7}
        >
          <RadixIcons.Close size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Contenido del resultado */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header del resultado */}
        <View style={styles.resultHeader}>
          <View style={[styles.resultIcon, { backgroundColor: color + '20' }]}>
            <IconComponent size={24} color={color} />
          </View>
          <View style={styles.resultInfo}>
            <Text style={styles.resultTitle}>{result.title}</Text>
            <Text style={styles.resultType}>
              {result.type.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Si es un alumno, mostrar información detallada */}
        {result.type === 'alumno' && result.data ? (
          <>
            {/* Información del alumno */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Información del Alumno</Text>
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
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Información Actual</Text>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Carrera:</Text>
                <Text style={styles.value}>
                  {isLoading ? 'Cargando...' : (carreraActual?.nombre || (result.data.carrera || 'No disponible'))}
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
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Estado de Trámites</Text>
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
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Documentos Faltantes</Text>
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
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Solicitar Cambio de Carrera</Text>
                
                    {!showFormulario ? (
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity 
                      style={[styles.navigateButton, { backgroundColor: color }]} 
                      onPress={() => setShowFormulario(true)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.navigateButtonText}>Nueva Solicitud de Cambio</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.navigateButton, { backgroundColor: '#111827' }]} 
                      onPress={openAlumnoDetailForChange}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.navigateButtonText}>Abrir flujo completo</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <View style={styles.formGroup}>
                      <Text style={styles.label}>Nueva Carrera *</Text>
                      <View style={styles.pickerContainer}>
                        <Picker
                          selectedValue={form.carrera_nueva_id}
                          onValueChange={(value) => handleInputChange('carrera_nueva_id', String(value))}
                        >
                          <Picker.Item label="Selecciona una carrera" value="" />
                          {carreras.map(c => (
                            <Picker.Item key={c.id} label={c.nombre} value={String(c.id)} />
                          ))}
                        </Picker>
                      </View>
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={styles.label}>Nuevo Ciclo *</Text>
                      <View style={styles.pickerContainer}>
                        <Picker
                          enabled={!!form.carrera_nueva_id}
                          selectedValue={form.ciclo_nuevo_id}
                          onValueChange={(value) => handleInputChange('ciclo_nuevo_id', String(value))}
                        >
                          <Picker.Item label="Selecciona un ciclo" value="" />
                          {ciclos.map(c => (
                            <Picker.Item key={c.id} label={c.nombre} value={String(c.id)} />
                          ))}
                        </Picker>
                      </View>
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={styles.label}>Motivo del Cambio *</Text>
                      <View style={styles.textAreaContainer}>
                        <TextInput
                          value={form.motivo}
                          onChangeText={(v) => handleInputChange('motivo', v)}
                          placeholder="Explica el motivo del cambio de carrera..."
                          multiline
                          numberOfLines={4}
                          style={{ minHeight: 100 }}
                        />
                      </View>
                    </View>

                    <View style={styles.buttonContainer}>
                      <TouchableOpacity
                        style={[styles.navigateButton, { backgroundColor: color }]}
                        onPress={handleCrearPeticionCambio}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.navigateButtonText}>Solicitar Cambio</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.navigateButton, { backgroundColor: '#6B7280' }]}
                        onPress={() => setShowFormulario(false)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.navigateButtonText}>Cancelar</Text>
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
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Información</Text>
              <View style={styles.descriptionContainer}>
                <Text style={styles.description}>{result.subtitle}</Text>
              </View>
            </View>

            {/* Información adicional - solo para tipos que no sean alumno */}
            {result.data && result.type !== 'alumno' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Información Adicional</Text>
                <View style={styles.metadataContainer}>
                  {Object.entries(result.data).map(([key, value]) => (
                    <View key={key} style={styles.metadataRow}>
                      <Text style={styles.metadataLabel}>{key}:</Text>
                      <Text style={styles.metadataValue}>{String(value)}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Botón de navegación */}
            <View style={styles.section}>
              <TouchableOpacity 
                style={[styles.navigateButton, { backgroundColor: color }]} 
                onPress={handleNavigate}
                activeOpacity={0.8}
              >
                <RadixIcons.ArrowRight size={16} color="#FFFFFF" />
                <Text style={styles.navigateButtonText}>Ver Detalles</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  backButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  resultIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  resultType: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  descriptionContainer: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
  },
  metadataContainer: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  metadataLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  metadataValue: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
    textAlign: 'right',
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 8,
  },
  navigateButtonText: {
    marginLeft: 8,
    fontSize: 14,
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

export default SearchAsideContent; 