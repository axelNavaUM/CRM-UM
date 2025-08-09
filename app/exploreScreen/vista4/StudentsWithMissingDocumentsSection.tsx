import { RadixIcons } from '@/components/ui/RadixIcons';
import { RegistroAlumnoModel } from '@/models/registroAlumnoModel';
import { CambioCarreraService } from '@/services/cambioCarrera/cambioCarreraService';
import { subirArchivosBucket } from '@/services/subirArchivoBucket';
import { supabase } from '@/services/supabase/supaConf';
import * as DocumentPicker from 'expo-document-picker';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface StudentWithMissingDocs {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  carrera: string;
  status: string;
  documentos_faltantes: string[];
  documentos_entregados: string[];
  total_documentos: number;
  documentos_completados: number;
}

interface StudentsWithMissingDocumentsSectionProps {
  userRole: string;
}

export const StudentsWithMissingDocumentsSection: React.FC<StudentsWithMissingDocumentsSectionProps> = ({ userRole }) => {
  const [studentsWithMissingDocs, setStudentsWithMissingDocs] = useState<StudentWithMissingDocs[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<number | null>(null);

  useEffect(() => {
    loadStudentsWithMissingDocuments();
  }, []);

  const loadStudentsWithMissingDocuments = async () => {
    try {
      setIsLoading(true);
      
      // Obtener todos los alumnos
      const { data: alumnos, error } = await supabase
        .from('alumnos')
        .select('*')
        .order('nombre', { ascending: true });

      if (error) throw error;

      // Filtrar alumnos que deben documentos
      const studentsWithMissingDocs = await Promise.all(
        (alumnos || []).map(async (alumno) => {
          try {
            const res = await CambioCarreraService.obtenerDocumentosFaltantes(alumno.id);
            const faltantes = res?.documentosFaltantes || [];
            const entregados = res?.documentosSubidos || [];
            return {
              id: alumno.id,
              nombre: alumno.nombre,
              apellidos: alumno.apellidos,
              email: alumno.email,
              carrera: alumno.carrera,
              status: alumno.status,
              documentos_faltantes: faltantes,
              documentos_entregados: entregados,
              total_documentos: faltantes.length + entregados.length,
              documentos_completados: entregados.length
            };
          } catch (error) {
            console.error(`Error al obtener documentos para alumno ${alumno.id}:`, error);
            return null;
          }
        })
      );

      // Filtrar solo alumnos que tienen documentos faltantes
      const filteredStudents = studentsWithMissingDocs
        .filter(student => student !== null && student.documentos_faltantes.length > 0) as StudentWithMissingDocs[];

      setStudentsWithMissingDocs(filteredStudents);
    } catch (error) {
      console.error('Error al cargar alumnos con documentos faltantes:', error);
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

  const mapDocToTipo = (doc: string): 'acta' | 'certificado_prepa' | 'formato_pago' | null => {
    const d = (doc || '').toLowerCase();
    if (d.includes('acta')) return 'acta';
    if (d.includes('certificado')) return 'certificado_prepa';
    if (d.includes('pago') || d.includes('comprobante')) return 'formato_pago';
    return null;
  };

  const pickFile = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false,
      type: ['application/pdf','image/jpeg','image/png','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    });
    if (res.canceled || !res.assets?.[0]) return null;
    return res.assets[0] as any;
  };

  const uploadMissingDoc = async (alumnoId: number, docLabel: string) => {
    try {
      const tipo = mapDocToTipo(docLabel);
      if (!tipo) {
        Alert.alert('Documento no soportado', 'No se reconoce el tipo de documento.');
        return;
      }
      setUploadingId(alumnoId);
      const file = await pickFile();
      if (!file) return;

      // Obtener info completa del alumno para construir ruta
      const { data: alumnoDet, error: alumnoErr } = await supabase
        .from('alumnos')
        .select('*, carreras(nombre), ciclos(nombre)')
        .eq('id', alumnoId)
        .single();
      if (alumnoErr || !alumnoDet) throw alumnoErr || new Error('Alumno no encontrado');

      // Intentar reutilizar basePath desde documentos existentes (si los hay)
      const { data: docsExist } = await supabase
        .from('documentos_alumno')
        .select('url_archivo')
        .eq('alumno_id', alumnoId)
        .limit(1);

      let area = 'alumnos';
      let carrera = (alumnoDet.carreras?.nombre as string) || String(alumnoDet.carrera_id || '');
      let ciclo = (alumnoDet.ciclos?.nombre as string) || '';
      let grupo = alumnoDet.grupo || 'sin_grupo';
      const matricula = alumnoDet.matricula || '';

      if (docsExist && docsExist.length > 0) {
        try {
          const url: string = docsExist[0].url_archivo;
          // Extraer path: crmum/<area>/<carrera>/<ciclo>/<grupo>/<matricula>/<file>
          const match = url.match(/crmum\/(.+)\/(.+)\/(.+)\/(.+)\/(.+?)\//);
          if (match) {
            area = match[1];
            carrera = match[2];
            ciclo = match[3];
            grupo = match[4];
            // match[5] es la matrícula
          }
        } catch {}
      }

      const archivos = [{
        fileUri: (file.uri || file) as string,
        area,
        carrera,
        ciclo,
        grupo,
        matricula,
        tipoDocumento: tipo,
        extension: (file.name?.split('.')?.pop() || 'pdf') as string,
      }];

      const resultados = await subirArchivosBucket(archivos);
      const ok = resultados[0] && resultados[0].url;
      if (!ok) throw new Error(resultados[0]?.error || 'No se pudo subir');

      await RegistroAlumnoModel.subirDocumento({
        alumno_id: alumnoId,
        tipo_documento: tipo,
        url_archivo: resultados[0].url as string,
      });

      Alert.alert('Éxito', 'Documento subido correctamente');
      await loadStudentsWithMissingDocuments();
    } catch (e: any) {
      console.error('Error al subir documento faltante:', e);
      Alert.alert('Error', e?.message || 'No se pudo subir el documento');
    } finally {
      setUploadingId(null);
    }
  };

  const getCompletionPercentage = (completed: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  const renderStudentItem = ({ item }: { item: StudentWithMissingDocs }) => {
    const completionPercentage = getCompletionPercentage(item.documentos_completados, item.total_documentos);
    
    return (
      <View style={styles.studentCard}>
        <View style={styles.studentHeader}>
          <View style={styles.studentInfo}>
            <Text style={styles.studentName}>
              {item.nombre} {item.apellidos}
            </Text>
            <Text style={styles.studentEmail}>{item.email}</Text>
            <Text style={styles.studentCareer}>{item.carrera}</Text>
          </View>
          <View style={styles.studentStatus}>
            {getStatusIcon(item.status)}
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.documentsSection}>
          <View style={styles.documentsHeader}>
            <Text style={styles.documentsTitle}>Documentos</Text>
            <Text style={styles.completionText}>
              {item.documentos_completados}/{item.total_documentos} completados ({completionPercentage}%)
            </Text>
          </View>

          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${completionPercentage}%`,
                  backgroundColor: completionPercentage === 100 ? '#10B981' : '#F59E0B'
                }
              ]} 
            />
          </View>

          {item.documentos_faltantes.length > 0 && (
            <View style={styles.missingDocsSection}>
              <Text style={styles.missingDocsTitle}>📄 Documentos Faltantes:</Text>
              {item.documentos_faltantes.map((doc, index) => (
                <View key={index} style={styles.missingDocRow}>
                  <Text style={styles.missingDocItem}>• {doc}</Text>
                  <TouchableOpacity
                    onPress={() => uploadMissingDoc(item.id, doc)}
                    style={styles.uploadBtn}
                    disabled={uploadingId === item.id}
                  >
                    <Text style={styles.uploadBtnText}>
                      {uploadingId === item.id ? 'Subiendo...' : 'Subir'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {item.documentos_entregados.length > 0 && (
            <View style={styles.submittedDocsSection}>
              <Text style={styles.submittedDocsTitle}>✅ Documentos Entregados:</Text>
              {item.documentos_entregados.map((doc, index) => (
                <Text key={index} style={styles.submittedDocItem}>
                  • {doc}
                </Text>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Cargando estudiantes con documentos faltantes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Control de Documentación</Text>
        <Text style={styles.subtitle}>
          Vista para {userRole} - Gestión de documentos estudiantiles
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{studentsWithMissingDocs.length}</Text>
          <Text style={styles.statLabel}>Estudiantes con documentos faltantes</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {studentsWithMissingDocs.reduce((total, student) => 
              total + student.documentos_faltantes.length, 0
            )}
          </Text>
          <Text style={styles.statLabel}>Documentos faltantes total</Text>
        </View>
      </View>

      {studentsWithMissingDocs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <RadixIcons.Success size={48} color="#10B981" />
          <Text style={styles.emptyText}>¡Excelente! Todos los documentos están completos</Text>
          <Text style={styles.emptySubtext}>
            No hay estudiantes con documentos faltantes
          </Text>
        </View>
      ) : (
        <FlatList
          data={studentsWithMissingDocs}
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
    elevation: 3,
  },
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  studentEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
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
  documentsSection: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  documentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  documentsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  completionText: {
    fontSize: 12,
    color: '#6B7280',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  missingDocsSection: {
    marginBottom: 12,
  },
  missingDocsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 4,
  },
  missingDocItem: {
    fontSize: 12,
    color: '#EF4444',
    marginLeft: 8,
    marginBottom: 2,
  },
  submittedDocsSection: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 8,
  },
  submittedDocsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 4,
  },
  submittedDocItem: {
    fontSize: 12,
    color: '#10B981',
    marginLeft: 8,
    marginBottom: 2,
  },
  // Estilos para estadísticas
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
}); 