import { RadixIcons } from '@/components/ui/RadixIcons';
import { CambioCarreraService } from '@/services/cambioCarrera/cambioCarreraService';
import { supabase } from '@/services/supabase/supaConf';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

interface StudentWithMissingDocs {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  status: string;
  fecha_alta: string;
  documentos_faltantes: string[];
  documentos_subidos: string[];
}

interface StudentsWithMissingDocumentsSectionProps {
  userRole: string;
}

export const StudentsWithMissingDocumentsSection: React.FC<StudentsWithMissingDocumentsSectionProps> = ({ userRole }) => {
  const [students, setStudents] = useState<StudentWithMissingDocs[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStudentsWithMissingDocuments();
  }, []);

  const loadStudentsWithMissingDocuments = async () => {
    try {
      setIsLoading(true);
      
      // Obtener todos los alumnos
      const { data: allStudents, error } = await supabase
        .from('alumnos')
        .select('*')
        .order('fecha_alta', { ascending: false });

      if (error) throw error;

      // Verificar documentos faltantes para cada alumno
      const studentsWithMissingDocs = await Promise.all(
        (allStudents || []).map(async (student) => {
          const { documentosFaltantes, documentosSubidos } = await CambioCarreraService.obtenerDocumentosFaltantes(student.id);
          
          return {
            ...student,
            documentos_faltantes: documentosFaltantes,
            documentos_subidos: documentosSubidos
          };
        })
      );

      // Filtrar solo alumnos con documentos faltantes
      const filteredStudents = studentsWithMissingDocs.filter(
        student => student.documentos_faltantes.length > 0
      );

      setStudents(filteredStudents);
    } catch (error) {
      console.error('Error al cargar estudiantes con documentos faltantes:', error);
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
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'activo':
        return <RadixIcons.Success size={16} color="#10B981" />;
      case 'pendiente':
        return <RadixIcons.Warning size={16} color="#F59E0B" />;
      default:
        return <RadixIcons.Info size={16} color="#6B7280" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStudentItem = ({ item }: { item: StudentWithMissingDocs }) => (
    <View style={styles.studentCard}>
      <View style={styles.studentHeader}>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>
            {item.nombre} {item.apellidos}
          </Text>
          <Text style={styles.studentEmail}>{item.email}</Text>
        </View>
        <View style={styles.statusContainer}>
          {getStatusIcon(item.status)}
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.documentsSection}>
        <Text style={styles.documentsTitle}>Documentos Faltantes:</Text>
        <View style={styles.missingDocsList}>
          {item.documentos_faltantes.map((doc, index) => (
            <View key={index} style={styles.missingDocItem}>
              <RadixIcons.Error size={14} color="#EF4444" />
              <Text style={styles.missingDocText}>{doc}</Text>
            </View>
          ))}
        </View>

        {item.documentos_subidos.length > 0 && (
          <View style={styles.submittedDocsSection}>
            <Text style={styles.submittedDocsTitle}>Documentos Entregados:</Text>
            <View style={styles.submittedDocsList}>
              {item.documentos_subidos.map((doc, index) => (
                <View key={index} style={styles.submittedDocItem}>
                  <RadixIcons.Success size={14} color="#10B981" />
                  <Text style={styles.submittedDocText}>{doc}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.dateText}>
          Registro: {formatDate(item.fecha_alta)}
        </Text>
        <Text style={styles.countText}>
          {item.documentos_faltantes.length} documento(s) faltante(s)
        </Text>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1383eb" />
        <Text style={styles.loadingText}>Cargando estudiantes con documentos faltantes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Estudiantes con Documentos Faltantes</Text>
        <Text style={styles.subtitle}>
          Control de documentos pendientes de entrega
        </Text>
      </View>

      {students.length === 0 ? (
        <View style={styles.emptyContainer}>
          <RadixIcons.Success size={48} color="#10B981" />
          <Text style={styles.emptyText}>
            ¡Excelente! Todos los estudiantes han entregado sus documentos
          </Text>
        </View>
      ) : (
        <FlatList
          data={students}
          renderItem={renderStudentItem}
          keyExtractor={(item) => item.id.toString()}
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
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
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
    marginTop: 12,
    fontSize: 16,
    color: '#10B981',
    textAlign: 'center',
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
  },
  studentCard: {
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
    elevation: 2,
  },
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  studentEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  documentsSection: {
    marginBottom: 12,
  },
  documentsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  missingDocsList: {
    marginBottom: 12,
  },
  missingDocItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  missingDocText: {
    fontSize: 12,
    color: '#EF4444',
    marginLeft: 6,
    fontWeight: '500',
  },
  submittedDocsSection: {
    marginTop: 8,
  },
  submittedDocsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  submittedDocsList: {
    marginLeft: 8,
  },
  submittedDocItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  submittedDocText: {
    fontSize: 12,
    color: '#10B981',
    marginLeft: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
  },
}); 