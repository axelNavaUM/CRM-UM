import { RadixIcons } from '@/components/ui/RadixIcons';
import { supabase } from '@/services/supabase/supaConf';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Student {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  carrera: string;
  status: string;
  fecha_alta: string;
}

interface StudentGroup {
  id: string;
  name: string;
  career: string;
  studentCount: number;
  students: Student[];
  pendingPetitions: number;
}

interface StudentsByGroupsSectionProps {
  userRole: string;
}

export const StudentsByGroupsSection: React.FC<StudentsByGroupsSectionProps> = ({ userRole }) => {
  const [groups, setGroups] = useState<StudentGroup[]>([]);
  const [pendingPetitions, setPendingPetitions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<StudentGroup | null>(null);
  const [activeTab, setActiveTab] = useState<'groups' | 'petitions'>('groups');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Cargar grupos por carrera
      const { data: alumnos, error } = await supabase
        .from('alumnos')
        .select('*')
        .order('carrera', { ascending: true });

      if (error) throw error;

      // Agrupar alumnos por carrera
      const groupsMap = new Map<string, Student[]>();
      alumnos?.forEach(alumno => {
        const carrera = alumno.carrera || 'Sin Carrera';
        if (!groupsMap.has(carrera)) {
          groupsMap.set(carrera, []);
        }
        groupsMap.get(carrera)!.push(alumno);
      });

      // Crear grupos con información adicional
      const groupsData: StudentGroup[] = Array.from(groupsMap.entries()).map(([carrera, students]) => ({
        id: carrera,
        name: carrera,
        career: carrera,
        studentCount: students.length,
        students: students,
        pendingPetitions: students.filter(s => s.status === 'pendiente').length
      }));

      setGroups(groupsData);

      // Cargar peticiones pendientes de firmas
      const { data: petitionsData, error: petitionsError } = await supabase
        .from('peticiones_cambio_carrera')
        .select(`
          *,
          alumno:alumnos(
            nombre,
            apellidos,
            email
          )
        `)
        .eq('estado', 'pendiente')
        .order('fecha_solicitud', { ascending: false });

      if (!petitionsError && petitionsData) {
        setPendingPetitions(petitionsData);
      }

    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'activo':
        return <RadixIcons.Success size={16} color="#10B981" />;
      case 'pendiente':
        return <RadixIcons.Clock size={16} color="#F59E0B" />;
      case 'inactivo':
        return <RadixIcons.Error size={16} color="#EF4444" />;
      default:
        return <RadixIcons.Info size={16} color="#6B7280" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'activo':
        return '#10B981';
      case 'pendiente':
        return '#F59E0B';
      case 'inactivo':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderGroupItem = ({ item }: { item: StudentGroup }) => (
    <TouchableOpacity
      style={styles.groupCard}
      onPress={() => setSelectedGroup(item)}
    >
      <View style={styles.groupHeader}>
        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>{item.name}</Text>
          <Text style={styles.groupSubtitle}>
            {item.studentCount} estudiantes
          </Text>
        </View>
        <View style={styles.groupStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{item.studentCount}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{item.pendingPetitions}</Text>
            <Text style={styles.statLabel}>Pendientes</Text>
          </View>
        </View>
      </View>

      <View style={styles.groupPreview}>
        <Text style={styles.previewLabel}>Vista previa de estudiantes:</Text>
        {item.students.slice(0, 3).map((student, index) => (
          <View key={student.id} style={styles.previewStudent}>
            <View style={styles.studentInfo}>
              <Text style={styles.studentName}>
                {student.nombre} {student.apellidos}
              </Text>
              <Text style={styles.studentEmail}>{student.email}</Text>
            </View>
            <View style={styles.studentStatus}>
              {getStatusIcon(student.status)}
              <Text style={[styles.statusText, { color: getStatusColor(student.status) }]}>
                {student.status}
              </Text>
            </View>
          </View>
        ))}
        {item.students.length > 3 && (
          <Text style={styles.moreStudents}>
            +{item.students.length - 3} estudiantes más
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderStudentItem = ({ item }: { item: Student }) => (
    <View style={styles.studentCard}>
      <View style={styles.studentHeader}>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>
            {item.nombre} {item.apellidos}
          </Text>
          <Text style={styles.studentEmail}>{item.email}</Text>
        </View>
        <View style={styles.studentStatus}>
          {getStatusIcon(item.status)}
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.studentDetails}>
        <Text style={styles.detailText}>Carrera: {item.carrera}</Text>
        <Text style={styles.detailText}>Registro: {formatDate(item.fecha_alta)}</Text>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Cargando estudiantes por grupos...</Text>
      </View>
    );
  }

  const renderPetitionItem = ({ item }: { item: any }) => (
    <View style={styles.petitionCard}>
      <View style={styles.petitionHeader}>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>
            {item.alumnos?.nombre} {item.alumnos?.apellidos}
          </Text>
          <Text style={styles.studentEmail}>{item.alumnos?.email}</Text>
          <Text style={styles.studentCareer}>{item.alumnos?.carrera}</Text>
        </View>
        <View style={styles.petitionStatus}>
          <RadixIcons.Clock size={16} color="#F59E0B" />
          <Text style={styles.statusText}>Pendiente de Firma</Text>
        </View>
      </View>

      <View style={styles.petitionDetails}>
        <Text style={styles.petitionLabel}>Cambio de Carrera:</Text>
        <Text style={styles.petitionText}>
          {item.carrera_origen} → {item.carrera_destino}
        </Text>
          <Text style={styles.petitionDate}>
            Solicitado: {formatDate(item.fecha_solicitud || item.fecha_creacion)}
          </Text>
      </View>
    </View>
  );

  const renderTabButton = (tab: 'groups' | 'petitions', label: string, count: number) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
      onPress={() => setActiveTab(tab)}
    >
      <Text style={[styles.tabButtonText, activeTab === tab && styles.tabButtonTextActive]}>
        {label}
      </Text>
      <View style={styles.tabBadge}>
        <Text style={styles.tabBadgeText}>{count}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Panel de Coordinador</Text>
        <Text style={styles.subtitle}>
          Vista para {userRole} - Gestión de grupos y peticiones
        </Text>
      </View>

      <View style={styles.tabsContainer}>
        {renderTabButton('groups', 'Grupos por Carrera', groups.length)}
        {renderTabButton('petitions', 'Peticiones Pendientes', pendingPetitions.length)}
      </View>

      {activeTab === 'groups' ? (
        selectedGroup ? (
          <View style={styles.groupDetailView}>
            <View style={styles.groupDetailHeader}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setSelectedGroup(null)}
              >
                <RadixIcons.ArrowLeft size={20} color="#3B82F6" />
                <Text style={styles.backButtonText}>Volver a grupos</Text>
              </TouchableOpacity>
              <Text style={styles.groupDetailTitle}>{selectedGroup.name}</Text>
              <Text style={styles.groupDetailSubtitle}>
                {selectedGroup.studentCount} estudiantes
              </Text>
            </View>

            <FlatList
              data={selectedGroup.students}
              renderItem={renderStudentItem}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.studentsListContainer}
            />
          </View>
        ) : (
          <>
            {groups.length === 0 ? (
              <View style={styles.emptyContainer}>
                <RadixIcons.Info size={48} color="#6B7280" />
                <Text style={styles.emptyText}>No hay grupos disponibles</Text>
                <Text style={styles.emptySubtext}>
                  Los grupos se crearán automáticamente cuando haya estudiantes registrados
                </Text>
              </View>
            ) : (
              <FlatList
                data={groups}
                renderItem={renderGroupItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
              />
            )}
          </>
        )
      ) : (
        <>
          {pendingPetitions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <RadixIcons.Success size={48} color="#10B981" />
              <Text style={styles.emptyText}>No hay peticiones pendientes</Text>
              <Text style={styles.emptySubtext}>
                Todas las peticiones han sido procesadas
              </Text>
            </View>
          ) : (
            <FlatList
              data={pendingPetitions}
              renderItem={renderPetitionItem}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
            />
          )}
        </>
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
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
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
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
  },
  groupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  groupSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  groupStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  groupPreview: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  previewLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  previewStudent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  studentEmail: {
    fontSize: 12,
    color: '#6B7280',
  },
  studentCareer: {
    fontSize: 12,
    color: '#6B7280',
  },
  studentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  moreStudents: {
    fontSize: 12,
    color: '#3B82F6',
    fontStyle: 'italic',
    marginTop: 4,
  },
  groupDetailView: {
    flex: 1,
  },
  groupDetailHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  backButtonText: {
    fontSize: 14,
    color: '#3B82F6',
    marginLeft: 4,
  },
  groupDetailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  groupDetailSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  studentsListContainer: {
    padding: 16,
  },
  studentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  studentDetails: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 8,
  },
  detailText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  // Nuevos estilos para peticiones
  petitionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  petitionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  petitionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  petitionDetails: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  petitionLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  petitionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  petitionDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  // Estilos para tabs
  tabsContainer: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F8FAFC',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tabButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
  tabBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
    minWidth: 20,
    alignItems: 'center',
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
}); 