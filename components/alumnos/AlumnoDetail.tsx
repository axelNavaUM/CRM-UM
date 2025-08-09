import { Input } from '@/components/ui/Input';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { useCambioCarrera } from '@/hooks/cambioCarrera/useCambioCarrera';
import { usePermisos } from '@/hooks/permisos/usePermisos';
import { Alumno } from '@/models/registroAlumnoModel';
import { supabase } from '@/services/supabase/supaConf';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

interface AlumnoDetailProps {
  alumno: Alumno;
  onClose: () => void;
  user?: any;
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

interface PeticionHistorial {
  id: number;
  estado: string;
  fecha_solicitud: string;
  fecha_resolucion?: string;
  motivo: string;
  carrera_actual: { id: number; nombre: string };
  carrera_nueva: { id: number; nombre: string };
  ciclo_actual: { id: number; nombre: string };
  ciclo_nuevo: { id: number; nombre: string };
  asesor: { idusuario: number; nombreusuario: string; apellido: string };
  jefe_aprobador?: { idusuario: number; nombreusuario: string; apellido: string };
  comentarios?: string;
}

export default function AlumnoDetail({ alumno, onClose, user }: AlumnoDetailProps) {
  const {
    peticiones,
    notificaciones,
    notificacionesNoLeidas,
    isLoading,
    error,
    historialPeticiones,
    tramitesPendientes,
    documentosFaltantes,
    esControlEscolar,
    handleCrearPeticion,
    handleAprobarPeticion,
    handleRechazarPeticion,
    handleMarcarNotificacionLeida,
    verificarTramitesPendientes,
    obtenerHistorialPeticiones,
    obtenerPeticionesPendientesAlumno,
    verificarEsControlEscolar,
    obtenerDocumentosFaltantes,
    agregarDocumentoFaltante,
    clearError
  } = useCambioCarrera(user);

  const { verificarPermisoUsuario, verificarSuperSu } = usePermisos();

  const [puedeCrear, setPuedeCrear] = useState(false);
  const [puedeAprobar, setPuedeAprobar] = useState(false);
  const [showFormulario, setShowFormulario] = useState(false);
  const [peticionesPendientes, setPeticionesPendientes] = useState<PeticionHistorial[]>([]);
  const [showDocumentosForm, setShowDocumentosForm] = useState(false);
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState<string>('');
  const [urlDocumento, setUrlDocumento] = useState<string>('');

  // Verificar permisos al cargar el componente
  useEffect(() => {
    const verificarPermisos = async () => {
      if (!user?.email) {
        console.log('❌ No hay usuario autenticado');
        setPuedeCrear(false);
        setPuedeAprobar(false);
        return;
      }

      try {
        console.log('🔍 Verificando permisos para usuario:', user.email);
        
        // Verificar si es superSU (usuario sin área asignada)
        const { data: usuario } = await supabase
          .from('usuariosum')
          .select('idarea')
          .eq('correoinstitucional', user.email)
          .single();

        if (!usuario?.idarea) {
          console.log('🔐 Usuario es superSU (sin área) - todos los permisos');
          setPuedeCrear(true);
          setPuedeAprobar(true);
          return;
        }

        // Obtener permisos del área
        const { data: area } = await supabase
          .from('areas')
          .select('permisos')
          .eq('idarea', usuario.idarea)
          .single();

        if (!area?.permisos) {
          console.log('❌ No se encontraron permisos para el área');
          setPuedeCrear(false);
          setPuedeAprobar(false);
          return;
        }

        const permisos = area.permisos;
        const tienePermisoEditar = permisos.editar === true;
        const tienePermisoActualizar = permisos.actualizar === true;
        const tienePermisoAltaAlumnos = permisos.alta_alumnos === true;
        const tienePermisoUpdate = permisos.update === true;

        const puedeCrearResult = tienePermisoEditar || tienePermisoActualizar || tienePermisoAltaAlumnos;
        const puedeAprobarResult = tienePermisoEditar || tienePermisoActualizar || tienePermisoUpdate;

        setPuedeCrear(puedeCrearResult);
        setPuedeAprobar(puedeAprobarResult);
        
        console.log('🔐 Permisos verificados - Crear:', puedeCrearResult, 'Aprobar:', puedeAprobarResult);
      } catch (error) {
        console.error('Error al verificar permisos:', error);
        setPuedeCrear(false);
        setPuedeAprobar(false);
      }
    };

    verificarPermisos();
  }, [user?.email]);

  // Cargar datos del alumno al montar el componente
  useEffect(() => {
    const cargarDatosAlumno = async () => {
      try {
        // Verificar trámites pendientes
        await verificarTramitesPendientes(alumno.id!);
        
        // Obtener historial de peticiones
        await obtenerHistorialPeticiones(alumno.id!);
        
        // Obtener peticiones pendientes específicas
        const peticionesPend = await obtenerPeticionesPendientesAlumno(alumno.id!);
        setPeticionesPendientes(peticionesPend);

        // Obtener documentos faltantes
        await obtenerDocumentosFaltantes(alumno.id!);

        // Verificar si es Control Escolar
        if (user?.email) {
          await verificarEsControlEscolar(user.email);
        }
      } catch (error) {
        console.error('Error al cargar datos del alumno:', error);
      }
    };

    cargarDatosAlumno();
  }, [alumno.id, verificarTramitesPendientes, obtenerHistorialPeticiones, obtenerPeticionesPendientesAlumno, obtenerDocumentosFaltantes, verificarEsControlEscolar, user?.email]);

  // Estados para el formulario de cambio de carrera
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [ciclos, setCiclos] = useState<Ciclo[]>([]);
  const [carreraActual, setCarreraActual] = useState<Carrera | null>(null);
  const [cicloActual, setCicloActual] = useState<Ciclo | null>(null);
  
  const [form, setForm] = useState({
    carrera_nueva_id: '',
    ciclo_nuevo_id: '',
    grupo_nuevo: 'A',
    motivo: ''
  });

  // Cargar datos del alumno
  useEffect(() => {
    const loadAlumnoData = async () => {
      try {
        // Cargar carreras
        const { data: carrerasData } = await supabase.from('carreras').select('*');
        setCarreras(carrerasData || []);

        // Cargar carrera actual del alumno
        if (alumno.carrera_id) {
          const { data: carreraData } = await supabase
            .from('carreras')
            .select('*')
            .eq('id', alumno.carrera_id)
            .single();
          setCarreraActual(carreraData);
        }

        // Cargar ciclo actual del alumno
        if (alumno.ciclo_id) {
          const { data: cicloData } = await supabase
            .from('ciclos')
            .select('*')
            .eq('id', alumno.ciclo_id)
            .single();
          setCicloActual(cicloData);
        }
      } catch (error) {
        console.error('Error al cargar datos del alumno:', error);
      }
    };

    loadAlumnoData();
  }, [alumno]);

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

  const handleInputChange = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleCrearPeticionCambio = async () => {
    console.log('🔍 Iniciando creación de petición...');
    console.log('📋 Datos del formulario:', form);
    console.log('👤 Usuario:', user);
    console.log('🎓 Alumno:', alumno);
    console.log('📚 Carrera actual:', carreraActual);
    console.log('📚 Ciclo actual:', cicloActual);

    if (!form.carrera_nueva_id || !form.ciclo_nuevo_id || !form.motivo.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    if (!carreraActual || !cicloActual) {
      Alert.alert('Error', 'No se pudo obtener la información actual del alumno');
      return;
    }

    try {
      console.log('🚀 Llamando a handleCrearPeticion...');
      const result = await handleCrearPeticion({
        alumno_id: alumno.id!,
        carrera_actual_id: carreraActual.id,
        carrera_nueva_id: parseInt(form.carrera_nueva_id),
        ciclo_actual_id: cicloActual.id,
        ciclo_nuevo_id: parseInt(form.ciclo_nuevo_id),
        grupo_actual: 'A',
        grupo_nuevo: form.grupo_nuevo,
        motivo: form.motivo.trim()
      });

      console.log('✅ Resultado de la petición:', result);

      if (result.success) {
        Alert.alert(
          'Éxito', 
          'Petición de cambio de carrera creada exitosamente. Será revisada por el jefe de ventas.',
          [{ text: 'OK', onPress: async () => {
            setShowFormulario(false);
            // Recargar datos
            await verificarTramitesPendientes(alumno.id!);
            await obtenerHistorialPeticiones(alumno.id!);
            const peticionesPend = await obtenerPeticionesPendientesAlumno(alumno.id!);
            setPeticionesPendientes(peticionesPend);
          }}]
        );
      } else {
        Alert.alert('Error', result.error || 'Error al crear la petición');
      }
    } catch (error) {
      console.error('❌ Error en handleCrearPeticionCambio:', error);
      Alert.alert('Error', 'Error al procesar la petición: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  const handleAgregarDocumento = async () => {
    if (!documentoSeleccionado || !urlDocumento.trim()) {
      Alert.alert('Error', 'Por favor selecciona un documento y proporciona la URL');
      return;
    }

    try {
      const result = await agregarDocumentoFaltante(
        alumno.id!,
        documentoSeleccionado,
        urlDocumento.trim(),
        user?.email || ''
      );

      if (result.success) {
        Alert.alert('Éxito', 'Documento agregado correctamente');
        setShowDocumentosForm(false);
        setDocumentoSeleccionado('');
        setUrlDocumento('');
        
        // Recargar datos
        await verificarTramitesPendientes(alumno.id!);
        await obtenerDocumentosFaltantes(alumno.id!);
      } else {
        Alert.alert('Error', result.error || 'Error al agregar documento');
      }
    } catch (error) {
      console.error('Error al agregar documento:', error);
      Alert.alert('Error', 'Error al agregar documento: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return '#ffc107';
      case 'aprobada':
        return '#28a745';
      case 'rechazada':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return '⏳';
      case 'aprobada':
        return '✅';
      case 'rechazada':
        return '❌';
      default:
        return '📋';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={true}
    >
      {/* Información del alumno */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información del Alumno</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Nombre:</Text>
          <Text style={styles.value}>{alumno.nombre} {alumno.apellidos}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{alumno.email}</Text>
        </View>
        {alumno.telefono && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Teléfono:</Text>
            <Text style={styles.value}>{alumno.telefono}</Text>
          </View>
        )}
        <View style={styles.infoRow}>
          <Text style={styles.label}>Estado:</Text>
          <Text style={[styles.value, { color: alumno.status === 'pendiente' ? '#ffc107' : '#28a745' }]}>
            {alumno.status || 'Activo'}
          </Text>
        </View>
      </View>

      {/* Información actual */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información Actual</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Carrera:</Text>
          <Text style={styles.value}>{carreraActual?.nombre || 'No disponible'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Ciclo:</Text>
          <Text style={styles.value}>{cicloActual?.nombre || 'No disponible'}</Text>
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
            
            {/* Botón para agregar documentos (solo Control Escolar) */}
            {esControlEscolar && (
              <View style={styles.buttonContainer}>
                <PrimaryButton
                  label="Agregar Documento"
                  onPress={() => setShowDocumentosForm(true)}
                  disabled={isLoading}
                />
              </View>
            )}
          </View>
        </View>
      )}

      {/* Formulario para agregar documentos */}
      {showDocumentosForm && esControlEscolar && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Agregar Documento Faltante</Text>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Tipo de Documento *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={documentoSeleccionado}
                onValueChange={(value) => setDocumentoSeleccionado(value)}
                style={styles.picker}
              >
                <Picker.Item label="Selecciona un documento" value="" />
                <Picker.Item label="Acta de nacimiento" value="acta" />
                <Picker.Item label="Certificado de preparatoria" value="certificado_prepa" />
                <Picker.Item label="Comprobante de pago" value="formato_pago" />
              </Picker>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>URL del Documento *</Text>
            <Input
              placeholder="https://ejemplo.com/documento.pdf"
              value={urlDocumento}
              onChangeText={setUrlDocumento}
              style={styles.textArea}
            />
          </View>

          <View style={styles.buttonContainer}>
            <PrimaryButton
              label="Agregar Documento"
              onPress={handleAgregarDocumento}
              disabled={isLoading || !documentoSeleccionado || !urlDocumento.trim()}
            />
            <PrimaryButton
              label="Cancelar"
              onPress={() => {
                setShowDocumentosForm(false);
                setDocumentoSeleccionado('');
                setUrlDocumento('');
              }}
              disabled={isLoading}
            />
          </View>
        </View>
      )}

      {/* Peticiones pendientes */}
      {peticionesPendientes.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Peticiones Pendientes</Text>
          {peticionesPendientes.map((peticion: PeticionHistorial, index: number) => (
            <View key={index} style={styles.peticionCard}>
              <View style={styles.peticionHeader}>
                <Text style={styles.peticionTitle}>
                  {peticion.carrera_actual.nombre} → {peticion.carrera_nueva.nombre}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: getEstadoColor(peticion.estado) }]}>
                  <Text style={styles.statusText}>{peticion.estado || ''}</Text>
                </View>
              </View>
              <Text style={styles.peticionDate}>
                Solicitado: {formatDate(peticion.fecha_solicitud)}
              </Text>
              <Text style={styles.peticionMotivo}>
                <Text style={styles.label}>Motivo: </Text>
                {peticion.motivo}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Historial de peticiones */}
      {historialPeticiones.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historial de Peticiones</Text>
          {historialPeticiones.map((peticion: PeticionHistorial, index: number) => (
            <View key={index} style={styles.peticionCard}>
              <View style={styles.peticionHeader}>
                <Text style={styles.peticionTitle}>
                  {peticion.carrera_actual.nombre} → {peticion.carrera_nueva.nombre}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: getEstadoColor(peticion.estado) }]}>
                  <Text style={styles.statusText}>{peticion.estado || ''}</Text>
                </View>
              </View>
              <Text style={styles.peticionDate}>
                Solicitado: {formatDate(peticion.fecha_solicitud)}
              </Text>
              {peticion.fecha_resolucion && (
                <Text style={styles.peticionDate}>
                  Resuelto: {formatDate(peticion.fecha_resolucion)}
                </Text>
              )}
              <Text style={styles.peticionMotivo}>
                <Text style={styles.label}>Motivo: </Text>
                {peticion.motivo}
              </Text>
              {peticion.comentarios && (
                <Text style={styles.peticionComentarios}>
                  <Text style={styles.label}>Comentarios: </Text>
                  {peticion.comentarios}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Formulario de cambio de carrera */}
      {!tramitesPendientes?.tieneTramitesPendientes && puedeCrear && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Solicitar Cambio de Carrera</Text>
          
          {!showFormulario ? (
            <View style={styles.buttonContainer}>
              <PrimaryButton
                label="Nueva Solicitud de Cambio"
                onPress={() => setShowFormulario(true)}
                disabled={isLoading}
              />
            </View>
          ) : (
            <>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Nueva Carrera *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={form.carrera_nueva_id}
                    onValueChange={(value) => handleInputChange('carrera_nueva_id', value)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Selecciona una carrera" value="" />
                    {carreras
                      .filter(c => c.id !== carreraActual?.id)
                      .map(carrera => (
                        <Picker.Item 
                          key={carrera.id} 
                          label={carrera.nombre} 
                          value={carrera.id.toString()} 
                        />
                      ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Nuevo Ciclo *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={form.ciclo_nuevo_id}
                    onValueChange={(value) => handleInputChange('ciclo_nuevo_id', value)}
                    style={styles.picker}
                    enabled={!!form.carrera_nueva_id}
                  >
                    <Picker.Item label="Selecciona un ciclo" value="" />
                    {ciclos.map(ciclo => (
                      <Picker.Item 
                        key={ciclo.id} 
                        label={ciclo.nombre} 
                        value={ciclo.id.toString()} 
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Nuevo Grupo</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={form.grupo_nuevo}
                    onValueChange={(value) => handleInputChange('grupo_nuevo', value)}
                    style={styles.picker}
                  >
                    <Picker.Item label="A" value="A" />
                    <Picker.Item label="B" value="B" />
                    <Picker.Item label="C" value="C" />
                    <Picker.Item label="D" value="D" />
                  </Picker>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Motivo del Cambio *</Text>
                <Input
                  placeholder="Explica el motivo del cambio de carrera..."
                  value={form.motivo}
                  onChangeText={(value) => handleInputChange('motivo', value)}
                  multiline
                  numberOfLines={4}
                  style={styles.textArea}
                />
              </View>

              <View style={styles.buttonContainer}>
                <PrimaryButton
                  label="Solicitar Cambio"
                  onPress={handleCrearPeticionCambio}
                  disabled={isLoading}
                />
                <PrimaryButton
                  label="Cancelar"
                  onPress={() => setShowFormulario(false)}
                  disabled={isLoading}
                />
              </View>
            </>
          )}
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
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
  peticionCard: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  peticionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  peticionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  peticionDate: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  peticionMotivo: {
    fontSize: 14,
    color: '#374151',
    marginTop: 8,
  },
  peticionComentarios: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    fontStyle: 'italic',
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
  },
  picker: {
    height: 50,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  cancelButton: {
    backgroundColor: '#6B7280',
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
  },
}); 