import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/context/AuthContext';
import { useFirmas } from '@/hooks/cambioCarrera/useFirmas';
import { useScreenPermissionsStore } from '@/store/permisos/screenPermissionsStore';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { EstadisticasCards } from './EstadisticasCards';
import { FiltrosPeticiones } from './FiltrosPeticiones';
import { PeticionCard } from './PeticionCard';

export const GestionPeticiones: React.FC = () => {
  const { user } = useAuth();
  const {
    peticiones,
    loading,
    error,
    cargarTodasLasPeticiones,
    cargarPeticionesPendientes,
    obtenerEstadisticas,
    limpiarError
  } = useFirmas();

  const [filtroActivo, setFiltroActivo] = useState<'todas' | 'pendientes' | 'aprobadas' | 'rechazadas'>('todas');
  const [vistaActiva, setVistaActiva] = useState<'todas' | 'mis-pendientes'>('mis-pendientes');
  const { userRoleInfo } = useScreenPermissionsStore();

  const isDirector = useMemo(() => {
    const normalize = (v?: string) => (v || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
    return normalize(userRoleInfo?.rolarea) === 'director';
  }, [userRoleInfo]);

  // Si es director, por defecto mostrar "todas" para gestión completa
  useEffect(() => {
    if (isDirector && vistaActiva !== 'todas') {
      setVistaActiva('todas');
    }
  }, [isDirector]);

  // Cargar datos iniciales
  useEffect(() => {
    if (user?.email) {
      if (vistaActiva === 'todas') {
        cargarTodasLasPeticiones();
      } else {
        cargarPeticionesPendientes();
      }
    }
  }, [user?.email, vistaActiva, cargarTodasLasPeticiones, cargarPeticionesPendientes]);

  // Filtrar peticiones según el filtro activo
  const peticionesFiltradas = peticiones.filter(peticion => {
    switch (filtroActivo) {
      case 'pendientes':
        return peticion.estado === 'pendiente';
      case 'aprobadas':
        return peticion.estado === 'aprobada';
      case 'rechazadas':
        return peticion.estado === 'rechazada';
      default:
        return true;
    }
  });

  const estadisticas = obtenerEstadisticas();

  const handleCambiarVista = (nuevaVista: 'todas' | 'mis-pendientes') => {
    setVistaActiva(nuevaVista);
    setFiltroActivo('todas'); // Resetear filtro al cambiar vista
  };

  const handleRecargar = () => {
    if (vistaActiva === 'todas') {
      cargarTodasLasPeticiones();
    } else {
      cargarPeticionesPendientes();
    }
  };

  if (error) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <ThemedText style={{ fontSize: 16, marginBottom: 10, textAlign: 'center' }}>
          Error: {error}
        </ThemedText>
        <TouchableOpacity
          onPress={limpiarError}
          style={{
            backgroundColor: '#007AFF',
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 8
          }}
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>Reintentar</Text>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <View style={{
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <ThemedText style={{ fontSize: 24, fontWeight: 'bold', color: '#2c3e50' }}>
            Gestión de Cambios de Carrera
          </ThemedText>
          <TouchableOpacity
            onPress={handleRecargar}
            style={{
              backgroundColor: '#28a745',
              paddingHorizontal: 15,
              paddingVertical: 8,
              borderRadius: 6
            }}
          >
            <Text style={{ color: 'white', fontWeight: '600', fontSize: 14 }}>
              {loading ? 'Cargando...' : 'Actualizar'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Estadísticas */}
        <View style={{ padding: 20 }}>
          <EstadisticasCards estadisticas={estadisticas} />
        </View>

        {/* Selector de vista */}
        <View style={{ paddingHorizontal: 20, marginBottom: 15 }}>
          <View style={{
            backgroundColor: 'white',
            borderRadius: 10,
            padding: 4,
            flexDirection: 'row',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2
          }}>
            <TouchableOpacity
              onPress={() => handleCambiarVista('mis-pendientes')}
              style={{
                flex: 1,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 8,
                backgroundColor: vistaActiva === 'mis-pendientes' ? '#007AFF' : 'transparent',
                alignItems: 'center'
              }}
            >
              <Text style={{
                color: vistaActiva === 'mis-pendientes' ? 'white' : '#6c757d',
                fontWeight: '600',
                fontSize: 14
              }}>
                Mis Pendientes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleCambiarVista('todas')}
              style={{
                flex: 1,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 8,
                backgroundColor: vistaActiva === 'todas' ? '#007AFF' : 'transparent',
                alignItems: 'center'
              }}
            >
              <Text style={{
                color: vistaActiva === 'todas' ? 'white' : '#6c757d',
                fontWeight: '600',
                fontSize: 14
              }}>
                Todas las Peticiones
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Filtros */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <FiltrosPeticiones
            filtroActivo={filtroActivo}
            onFiltroChange={setFiltroActivo}
            estadisticas={estadisticas}
          />
        </View>

        {/* Lista de peticiones */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
          {loading ? (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Text style={{ fontSize: 16, color: '#6c757d' }}>Cargando peticiones...</Text>
            </View>
          ) : peticionesFiltradas.length === 0 ? (
            <View style={{
              backgroundColor: 'white',
              borderRadius: 12,
              padding: 30,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3
            }}>
              <Text style={{ fontSize: 18, color: '#6c757d', marginBottom: 10 }}>
                No hay peticiones {filtroActivo !== 'todas' ? filtroActivo : ''}
              </Text>
              <Text style={{ fontSize: 14, color: '#adb5bd', textAlign: 'center' }}>
                {vistaActiva === 'mis-pendientes' 
                  ? 'No tienes peticiones pendientes de firma'
                  : 'No se encontraron peticiones con los filtros aplicados'
                }
              </Text>
            </View>
          ) : (
            <View style={{ gap: 15 }}>
              {peticionesFiltradas.map((peticion) => (
                <PeticionCard
                  key={peticion.id}
                  peticion={peticion}
                  vistaActiva={vistaActiva}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}; 