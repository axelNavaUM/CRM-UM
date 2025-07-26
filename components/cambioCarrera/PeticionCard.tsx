import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/context/AuthContext';
import { useFirmas } from '@/hooks/cambioCarrera/useFirmas';
import { PeticionConFirmas } from '@/models/cambioCarrera/firmasModel';
import React, { useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { ModalFirma } from './ModalFirma';

interface PeticionCardProps {
  peticion: PeticionConFirmas;
  vistaActiva: 'todas' | 'mis-pendientes';
}

export const PeticionCard: React.FC<PeticionCardProps> = ({ peticion, vistaActiva }) => {
  const { user } = useAuth();
  const { firmarPeticion, verificarPuedeFirmar } = useFirmas();
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Obtener el estado de la petición
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

  // Obtener progreso de firmas
  const progresoFirmas = peticion.total_firmas > 0 
    ? Math.round((peticion.firmas_aprobadas / peticion.total_firmas) * 100)
    : 0;

  // Verificar si el usuario puede firmar esta petición
  const [puedeFirmar, setPuedeFirmar] = useState(false);
  
  React.useEffect(() => {
    const verificarPermisos = async () => {
      if (user?.email) {
        const puede = await verificarPuedeFirmar(peticion.id);
        setPuedeFirmar(puede);
      }
    };
    verificarPermisos();
  }, [user?.email, peticion.id, verificarPuedeFirmar]);

  const handleFirmar = async (estado: 'aprobada' | 'rechazada', contraseña: string, comentarios?: string) => {
    setLoading(true);
    try {
      // Obtener el área del usuario
      const { data: usuario } = await import('@/services/supabase/supaConf').then(({ supabase }) => 
        supabase
          .from('usuariosum')
          .select('idarea')
          .eq('correoinstitucional', user?.email)
          .single()
      );

      if (!usuario?.idarea) {
        // Si es superSU, puede firmar cualquier área
        const firmaPendiente = peticion.firmas.find(f => f.estado === 'pendiente');
        if (firmaPendiente) {
          await firmarPeticion(peticion.id, firmaPendiente.area_id, estado, contraseña, comentarios);
        }
      } else {
        await firmarPeticion(peticion.id, usuario.idarea, estado, contraseña, comentarios);
      }

      setModalVisible(false);
      Alert.alert('Éxito', 'Firma registrada correctamente');
    } catch (error) {
      console.error('Error al firmar:', error);
      Alert.alert('Error', 'No se pudo registrar la firma');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ThemedView style={{
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        borderLeftWidth: 4,
        borderLeftColor: getEstadoColor(peticion.estado)
      }}>
        {/* Header de la petición */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ fontSize: 20, marginRight: 8 }}>👨‍🎓</Text>
              <ThemedText style={{ fontSize: 18, fontWeight: 'bold', color: '#2c3e50' }}>
                {peticion.alumno_nombre} {peticion.alumno_apellidos}
              </ThemedText>
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Text style={{ fontSize: 14, color: '#6c757d', marginRight: 8 }}>
                📚 {peticion.carrera_actual_nombre} → {peticion.carrera_nueva_nombre}
              </Text>
            </View>
            
            <Text style={{ fontSize: 12, color: '#adb5bd' }}>
              📅 Creada: {new Date(peticion.fecha_creacion).toLocaleDateString()}
            </Text>
          </View>
          
          <View style={{
            backgroundColor: getEstadoColor(peticion.estado),
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
            flexDirection: 'row',
            alignItems: 'center'
          }}>
            <Text style={{ fontSize: 16, marginRight: 4 }}>{getEstadoIcon(peticion.estado)}</Text>
            <Text style={{ 
              color: 'white', 
              fontSize: 12, 
              fontWeight: '600',
              textTransform: 'uppercase'
            }}>
              {peticion.estado}
            </Text>
          </View>
        </View>

        {/* Progreso de firmas */}
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#495057' }}>
              Progreso de Firmas
            </Text>
            <Text style={{ fontSize: 12, color: '#6c757d' }}>
              {peticion.firmas_aprobadas}/{peticion.total_firmas} aprobadas
            </Text>
          </View>
          
          <View style={{
            height: 8,
            backgroundColor: '#e9ecef',
            borderRadius: 4,
            overflow: 'hidden'
          }}>
            <View style={{
              height: '100%',
              backgroundColor: '#28a745',
              width: `${progresoFirmas}%`,
              borderRadius: 4
            }} />
          </View>
        </View>

        {/* Lista de firmas */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#495057', marginBottom: 8 }}>
            Firmas Requeridas
          </Text>
          
          <View style={{ gap: 8 }}>
            {peticion.firmas.map((firma, index) => (
              <View key={index} style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 8,
                paddingHorizontal: 12,
                backgroundColor: '#f8f9fa',
                borderRadius: 8
              }}>
                <Text style={{ fontSize: 16, marginRight: 8 }}>
                  {firma.estado === 'aprobada' ? '✅' : 
                   firma.estado === 'rechazada' ? '❌' : '⏳'}
                </Text>
                
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#495057' }}>
                    {firma.area_nombre}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#6c757d' }}>
                    {firma.estado === 'pendiente' ? 'Pendiente de firma' :
                     firma.estado === 'aprobada' ? `Aprobada por ${firma.firmante_nombre || 'N/A'}` :
                     `Rechazada por ${firma.firmante_nombre || 'N/A'}`}
                  </Text>
                </View>
                
                {firma.estado !== 'pendiente' && (
                  <Text style={{ fontSize: 10, color: '#adb5bd' }}>
                    {firma.fecha_firma ? new Date(firma.fecha_firma).toLocaleDateString() : ''}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Motivo */}
        {peticion.motivo && (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#495057', marginBottom: 6 }}>
              Motivo del Cambio
            </Text>
            <Text style={{ fontSize: 13, color: '#6c757d', lineHeight: 18 }}>
              {peticion.motivo}
            </Text>
          </View>
        )}

        {/* Botones de acción */}
        {vistaActiva === 'mis-pendientes' && puedeFirmar && peticion.estado === 'pendiente' && (
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              style={{
                flex: 1,
                backgroundColor: '#28a745',
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: 'center'
              }}
            >
              <Text style={{ color: 'white', fontWeight: '600', fontSize: 14 }}>
                Firmar Petición
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Información adicional */}
        <View style={{ 
          marginTop: 12, 
          paddingTop: 12, 
          borderTopWidth: 1, 
          borderTopColor: '#e9ecef' 
        }}>
          <Text style={{ fontSize: 11, color: '#adb5bd', textAlign: 'center' }}>
            ID: {peticion.id} • {peticion.firmas_pendientes} firmas pendientes
          </Text>
        </View>
      </ThemedView>

      {/* Modal de firma */}
      <ModalFirma
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onFirmar={handleFirmar}
        loading={loading}
        peticion={peticion}
      />
    </>
  );
}; 