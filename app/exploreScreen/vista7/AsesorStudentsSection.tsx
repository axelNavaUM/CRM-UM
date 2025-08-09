import AlumnoDetail from '@/components/alumnos/AlumnoDetail';
import BottomSheet from '@/components/ui/BottomSheet';
import { useAsidePanel } from '@/context/AsidePanelContext';
import { useAuth } from '@/context/AuthContext';
import { useSheetsContext } from '@/context/SheetsContext';
import { Alumno } from '@/models/registroAlumnoModel';
import { supabase } from '@/services/supabase/supaConf';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AsesorStudentsSectionProps {
  userRole: string;
}

interface StudentWithDetails extends Alumno {
  carrera_nombre?: string;
  ciclo_nombre?: string;
}

export const AsesorStudentsSection: React.FC<AsesorStudentsSectionProps> = ({ userRole }) => {
  const { user } = useAuth();
  const [students, setStudents] = useState<StudentWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<StudentWithDetails | null>(null);
  const { openAsidePanel } = useAsidePanel();
  const { addSheet, removeSheet } = useSheetsContext();
  const isMobile = Dimensions.get('window').width < 768;

  useEffect(() => {
    loadAsesorStudents();
  }, [user?.email]);

  const loadAsesorStudents = async () => {
    try {
      setIsLoading(true);
      
      if (!user?.email) {
        console.log('No hay usuario autenticado');
        return;
      }

      // Obtener el ID del asesor
      const { data: asesor, error: asesorError } = await supabase
        .from('usuariosum')
        .select('idusuario')
        .eq('correoinstitucional', user.email)
        .single();

      if (asesorError || !asesor) {
        console.error('Error al obtener información del asesor:', asesorError);
        return;
      }

      // Obtener alumnos registrados por este asesor
      const { data: alumnos, error: alumnosError } = await supabase
        .from('alumnos')
        .select(`
          *,
          carreras(nombre),
          ciclos(nombre)
        `)
        .eq('asesor_id', asesor.idusuario)
        .order('fecha_alta', { ascending: false });

      if (alumnosError) {
        console.error('Error al cargar alumnos:', alumnosError);
        return;
      }

      // Mapear datos con nombres de carrera y ciclo
      const studentsWithDetails = (alumnos || []).map((alumno: any) => ({
        ...alumno,
        carrera_nombre: alumno.carreras?.nombre || 'Sin carrera',
        ciclo_nombre: alumno.ciclos?.nombre || 'Sin ciclo'
      }));

      setStudents(studentsWithDetails);
    } catch (error) {
      console.error('Error al cargar estudiantes del asesor:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'activo':
        return '#10B981';
      case 'pendiente':
        return '#F59E0B';
      case 'rechazado':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'activo':
        return 'Activo';
      case 'pendiente':
        return 'Pendiente';
      case 'rechazado':
        return 'Rechazado';
      default:
        return 'Sin estado';
    }
  };

  const handleOpenStudent = (item: StudentWithDetails) => {
    if (isMobile) {
      // Abrir en BottomSheet
      const sheetId = `alumno-${item.id || item.email}`;
      addSheet(sheetId, (
        <BottomSheet open={true} onClose={() => removeSheet(sheetId)}>
          <AlumnoDetail alumno={item} onClose={() => removeSheet(sheetId)} user={user} />
        </BottomSheet>
      ));
    } else {
      // Abrir en Aside
      openAsidePanel(
        <AlumnoDetail alumno={item} onClose={() => { /* aside se cierra desde el propio componente */ }} user={user} />,
        'Detalle del Alumno'
      );
    }
  };

  const renderStudentItem = ({ item }: { item: StudentWithDetails }) => (
    <TouchableOpacity
      style={styles.studentCard}
      onPress={() => handleOpenStudent(item)}
    >
      <View style={styles.studentHeader}>
        <Text style={styles.studentName}>
          {item.nombre} {item.apellidos}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>
      
      <View style={styles.studentDetails}>
        <Text style={styles.studentInfo}>
          📧 {item.email}
        </Text>
        <Text style={styles.studentInfo}>
          🎓 {item.carrera_nombre}
        </Text>
        <Text style={styles.studentInfo}>
          📅 {item.ciclo_nombre}
        </Text>
        {item.matricula && (
          <Text style={styles.studentInfo}>
            🆔 Matrícula: {item.matricula}
          </Text>
        )}
      </View>
      
      <View style={styles.studentFooter}>
        <Text style={styles.dateText}>
          Registrado: {new Date(item.fecha_alta || '').toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Cargando estudiantes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Estudiantes Registrados</Text>
        <Text style={styles.subtitle}>
          {students.length} estudiante{students.length !== 1 ? 's' : ''} registrado{students.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {students.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No hay estudiantes registrados</Text>
          <Text style={styles.emptySubtitle}>
            Los estudiantes que registres aparecerán aquí
          </Text>
        </View>
      ) : (
        <FlatList
          data={students}
          renderItem={renderStudentItem}
          keyExtractor={(item) => item.id?.toString() || item.email}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  listContainer: {
    padding: 20,
  },
  studentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  studentName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  studentDetails: {
    marginBottom: 12,
  },
  studentInfo: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  studentFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
}); 