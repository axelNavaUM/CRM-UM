import { RadixIcons } from '@/components/ui/RadixIcons';
import { supabase } from '@/services/supabase/supaConf';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Petition {
  id: number;
  alumno_id: number;
  carrera_origen: string;
  carrera_destino: string;
  status: string;
  fecha_creacion: string;
  asesor_id: number;
  alumno_nombre?: string;
  alumno_email?: string;
  firmas?: any[];
  comentarios?: string;
}

interface CareerChangePetitionsSectionProps {
  userRole: string;
}

export const CareerChangePetitionsSection: React.FC<CareerChangePetitionsSectionProps> = ({ userRole }) => {
  const [petitions, setPetitions] = useState<Petition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPetition, setSelectedPetition] = useState<Petition | null>(null);

  useEffect(() => {
    loadPetitions();
  }, []);

  const loadPetitions = async () => {
    try {
      setIsLoading(true);
      
      // Obtener peticiones con información del alumno
      const { data: petitionsData, error } = await supabase
        .from('peticiones_cambio_carrera')
        .select(`
          *,
          alumno:alumnos(
            nombre,
            apellidos,
            email
          )
        `)
        .order('fecha_solicitud', { ascending: false });

      if (error) throw error;

      // Obtener firmas para cada petición
      const petitionsWithSignatures = await Promise.all(
        (petitionsData || []).map(async (petition) => {
          const { data: firmas } = await supabase
            .from('firmas_cambio_carrera')
            .select('*')
            .eq('peticion_id', petition.id);

          return {
            ...petition,
            alumno_nombre: `${petition.alumno?.nombre || ''} ${petition.alumno?.apellidos || ''}`,
            alumno_email: petition.alumno?.email,
            firmas: firmas || []
          };
        })
      );

      setPetitions(petitionsWithSignatures);
    } catch (error) {
      console.error('Error al cargar peticiones:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprobada':
        return '#10B981';
      case 'rechazada':
        return '#EF4444';
      case 'pendiente':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aprobada':
        return <RadixIcons.Success size={20} color="#10B981" />;
      case 'rechazada':
        return <RadixIcons.Error size={20} color="#EF4444" />;
      case 'pendiente':
        return <RadixIcons.Clock size={20} color="#F59E0B" />;
      default:
        return <RadixIcons.Info size={20} color="#6B7280" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderPetitionItem = ({ item }: { item: Petition }) => (
    <TouchableOpacity
      style={styles.petitionCard}
      onPress={() => setSelectedPetition(item)}
    >
      <View style={styles.petitionHeader}>
        <View style={styles.statusContainer}>
          {getStatusIcon(item.status)}
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status || ''}
          </Text>
        </View>
        <Text style={styles.dateText}>{formatDate(item.fecha_solicitud)}</Text>
      </View>

      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{item.alumno_nombre}</Text>
        <Text style={styles.studentEmail}>{item.alumno_email}</Text>
      </View>

      <View style={styles.careerChange}>
        <Text style={styles.careerLabel}>Cambio de Carrera:</Text>
        <Text style={styles.careerText}>
          {item.carrera_origen} → {item.carrera_destino}
        </Text>
      </View>

      <View style={styles.signaturesInfo}>
        <Text style={styles.signaturesLabel}>
          Firmas: {item.firmas?.length || 0} completadas
        </Text>
        {item.comentarios && (
          <Text style={styles.commentText}>Comentario: {item.comentarios}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Cargando peticiones de cambio de carrera...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Seguimiento de Peticiones</Text>
        <Text style={styles.subtitle}>
          Vista para {userRole} - Gestión de cambios de carrera
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{petitions.length}</Text>
          <Text style={styles.statLabel}>Total de peticiones</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {petitions.filter(p => p.status === 'pendiente').length}
          </Text>
          <Text style={styles.statLabel}>Pendientes</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {petitions.filter(p => p.status === 'aprobada').length}
          </Text>
          <Text style={styles.statLabel}>Aprobadas</Text>
        </View>
      </View>

      {petitions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <RadixIcons.Info size={48} color="#6B7280" />
          <Text style={styles.emptyText}>No hay peticiones de cambio de carrera</Text>
          <Text style={styles.emptySubtext}>
            Las peticiones aparecerán aquí cuando los alumnos las soliciten
          </Text>
        </View>
      ) : (
        <FlatList
          data={petitions}
          renderItem={renderPetitionItem}
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
    alignItems: 'center',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
  },
  studentInfo: {
    marginBottom: 12,
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
  },
  careerChange: {
    marginBottom: 12,
  },
  careerLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  careerText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  signaturesInfo: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  signaturesLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 12,
    color: '#EF4444',
    fontStyle: 'italic',
  },
  // Estilos para estadísticas
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
  },
}); 