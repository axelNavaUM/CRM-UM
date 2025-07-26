import { Alumno } from '@/models/registroAlumnoModel';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';

interface AlumnosGridProps {
  alumnos: Alumno[];
  onAlumnoPress: (alumno: Alumno) => void;
  isLoading?: boolean;
}

export default function AlumnosGrid({ alumnos, onAlumnoPress, isLoading = false }: AlumnosGridProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando alumnos...</Text>
      </View>
    );
  }

  if (alumnos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No hay alumnos registrados</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isMobile && styles.containerMobile]}>
      <View style={styles.grid}>
        {alumnos.map((alumno) => (
          <TouchableOpacity
            key={alumno.id}
            style={[styles.alumnoCard, isMobile && styles.alumnoCardMobile]}
            onPress={() => onAlumnoPress(alumno)}
          >
            {/* Icono de carpeta */}
            <View style={styles.folderIcon}>
              <Text style={styles.folderIconText}>📁</Text>
            </View>
            
            {/* Información del alumno */}
            <View style={styles.alumnoInfo}>
              <Text style={styles.alumnoName} numberOfLines={1}>
                {alumno.nombre} {alumno.apellidos}
              </Text>
              <Text style={styles.alumnoEmail} numberOfLines={1}>
                {alumno.email}
              </Text>
              {alumno.telefono && (
                <Text style={styles.alumnoTelefono} numberOfLines={1}>
                  Tel: {alumno.telefono}
                </Text>
              )}
              <View style={styles.statusContainer}>
                <View style={[
                  styles.statusBadge,
                  alumno.status === 'pendiente' ? styles.statusPendiente : styles.statusActivo
                ]}>
                  <Text style={styles.statusText}>
                    {alumno.status === 'pendiente' ? 'Pendiente' : 'Activo'}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  containerMobile: {
    padding: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'flex-start',
  },
  alumnoCard: {
    width: 280,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  alumnoCardMobile: {
    width: '100%',
    marginBottom: 12,
  },
  folderIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  folderIconText: {
    fontSize: 24,
  },
  alumnoInfo: {
    flex: 1,
  },
  alumnoName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  alumnoEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  alumnoTelefono: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPendiente: {
    backgroundColor: '#FEF3C7',
  },
  statusActivo: {
    backgroundColor: '#D1FAE5',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
}); 