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
  user?: any; // Agregar prop user
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

export default function AlumnoDetail({ alumno, onClose, user }: AlumnoDetailProps) {
  const {
    peticiones,
    notificaciones,
    notificacionesNoLeidas,
    isLoading,
    error,
    handleCrearPeticion,
    handleAprobarPeticion,
    handleRechazarPeticion,
    handleMarcarNotificacionLeida,
    clearError
  } = useCambioCarrera(user);

  const { verificarPermisoUsuario, verificarSuperSu } = usePermisos();

  const [puedeCrear, setPuedeCrear] = useState(false);
  const [puedeAprobar, setPuedeAprobar] = useState(false);

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
        console.log('📋 Permisos específicos - Editar:', tienePermisoEditar, 'Actualizar:', tienePermisoActualizar, 'Alta:', tienePermisoAltaAlumnos, 'Update:', tienePermisoUpdate);
        console.log('📋 Todos los permisos del área:', permisos);
      } catch (error) {
        console.error('Error al verificar permisos:', error);
        setPuedeCrear(false);
        setPuedeAprobar(false);
      }
    };

    verificarPermisos();
  }, [user?.email]);
  
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
    console.log('🎓 Alumno:', alumno); // Changed from selectedAlumno to alumno
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
        grupo_actual: 'A', // Por defecto, se puede ajustar según la lógica del negocio
        grupo_nuevo: form.grupo_nuevo,
        motivo: form.motivo.trim()
      });

      console.log('✅ Resultado de la petición:', result);

      if (result.success) {
        Alert.alert(
          'Éxito', 
          'Petición de cambio de carrera creada exitosamente. Será revisada por el jefe de ventas.',
          [{ text: 'OK', onPress: onClose }]
        );
      } else {
        Alert.alert('Error', result.error || 'Error al crear la petición');
      }
    } catch (error) {
      console.error('❌ Error en handleCrearPeticionCambio:', error);
      Alert.alert('Error', 'Error al procesar la petición: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
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
          <Text style={styles.value}>{alumno.status || 'Activo'}</Text>
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

      {/* Formulario de cambio de carrera */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Solicitar Cambio de Carrera</Text>
        {puedeCrear ? (
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
                    .filter(c => c.id !== carreraActual?.id) // Excluir la carrera actual
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
                onPress={onClose}
                disabled={isLoading}
              />
            </View>
          </>
        ) : (
          <Text style={{ color: 'gray', marginTop: 16 }}>
            No tienes permisos para solicitar un cambio de carrera. 
            {user?.email ? ' Contacta a tu administrador para solicitar los permisos necesarios.' : ' Inicia sesión para continuar.'}
          </Text>
        )}
      </View>

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
    paddingBottom: 40, // Agregar padding extra al final
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
    marginBottom: 20, // Agregar margen al final
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