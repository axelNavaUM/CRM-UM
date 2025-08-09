import { RadixIcons } from '@/components/ui/RadixIcons';
import { supabase } from '@/services/supabase/supaConf';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Petition {
  id: number;
  alumno_id: number;
  carrera_origen: string;
  carrera_destino: string;
  estado: string;
  fecha_solicitud: string;
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
    return new Date(dateString).toLocaleDateString('es-ES', {
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
          {getStatusIcon(item.estado)}
          <Text style={[styles.statusText, { color: getStatusColor(item.estado) }]}>
            {item.estado || ''}
          </Text>
        </View>
        <Text style={styles.dateText}>{formatDate(item.fecha_solicitud)}</Text>
      </View>

      <View style={styles.petitionInfo}>
        <Text style={styles.studentName}>{item.alumno_nombre}</Text>
        <Text style={styles.studentEmail}>{item.alumno_email}</Text>
        
        <View style={styles.careerChange}>
          <Text style={styles.careerLabel}>Cambio de Carrera:</Text>
          <Text style={styles.careerText}>
            {item.carrera_origen} → {item.carrera_destino}
          </Text>
        </View>

        <View style={styles.signaturesInfo}>
          <Text style={styles.signaturesLabel}>
            Firmas: {item.firmas?.length || 0} de 2
          </Text>
          {item.firmas && item.firmas.length > 0 && (
            <View style={styles.signaturesList}>
              {item.firmas.map((firma, index) => (
                <Text key={index} style={styles.signatureItem}>
                  • {firma.firmante_nombre} - {formatDate(firma.fecha_firma)}
                </Text>
              ))}
            </View>
          )}
        </View>

        {item.comentarios && (
          <View style={styles.commentsContainer}>
            <Text style={styles.commentsLabel}>Comentarios:</Text>
            <Text style={styles.commentsText}>{item.comentarios}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1383eb" />
        <Text style={styles.loadingText}>Cargando peticiones...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Peticiones de Cambio de Carrera</Text>
        <Text style={styles.subtitle}>
          {userRole === 'asesor del área ventas' || userRole === 'asesor ventas' 
            ? 'Seguimiento de peticiones de cambio de carrera'
            : 'Peticiones pendientes de firma y aprobación'
          }
        </Text>
      </View>

      {petitions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <RadixIcons.ClipboardList size={48} color="#9CA3AF" />
          <Text style={styles.emptyText}>No hay peticiones de cambio de carrera</Text>
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
    color: '#9CA3AF',
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
    elevation: 2,
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
    fontWeight: 'bold',
    marginLeft: 6,
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
  },
  petitionInfo: {
    gap: 8,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  studentEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  careerChange: {
    marginTop: 8,
  },
  careerLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  careerText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  signaturesInfo: {
    marginTop: 8,
  },
  signaturesLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  signaturesList: {
    marginLeft: 8,
  },
  signatureItem: {
    fontSize: 12,
    color: '#374151',
    marginBottom: 2,
  },
  commentsContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
  },
  commentsLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  commentsText: {
    fontSize: 12,
    color: '#6B7280',
  },
}); 