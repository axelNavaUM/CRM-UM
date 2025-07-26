import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { PeticionConFirmas } from '@/models/cambioCarrera/firmasModel';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface ModalFirmaProps {
  visible: boolean;
  onClose: () => void;
  onFirmar: (estado: 'aprobada' | 'rechazada', contraseña: string, comentarios?: string) => Promise<void>;
  loading: boolean;
  peticion: PeticionConFirmas;
}

export const ModalFirma: React.FC<ModalFirmaProps> = ({
  visible,
  onClose,
  onFirmar,
  loading,
  peticion
}) => {
  const [estado, setEstado] = useState<'aprobada' | 'rechazada'>('aprobada');
  const [contraseña, setContraseña] = useState('');
  const [comentarios, setComentarios] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    if (!contraseña.trim()) {
      Alert.alert('Error', 'Debe ingresar su contraseña para firmar');
      return;
    }

    if (estado === 'rechazada' && !comentarios.trim()) {
      Alert.alert('Error', 'Debe proporcionar un motivo para rechazar la petición');
      return;
    }

    try {
      await onFirmar(estado, contraseña, comentarios.trim() || undefined);
      // Limpiar formulario
      setContraseña('');
      setComentarios('');
      setEstado('aprobada');
    } catch (error) {
      // Error ya manejado en el componente padre
    }
  };

  const handleClose = () => {
    if (!loading) {
      setContraseña('');
      setComentarios('');
      setEstado('aprobada');
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20
        }}>
          <ThemedView style={{
            backgroundColor: 'white',
            borderRadius: 20,
            padding: 24,
            width: '100%',
            maxWidth: 400,
            maxHeight: '80%',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.25,
            shadowRadius: 20,
            elevation: 10
          }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View style={{ alignItems: 'center', marginBottom: 24 }}>
                <Text style={{ fontSize: 24, marginBottom: 8 }}>✍️</Text>
                <ThemedText style={{ 
                  fontSize: 20, 
                  fontWeight: 'bold', 
                  color: '#2c3e50',
                  textAlign: 'center'
                }}>
                  Firmar Petición
                </ThemedText>
                <Text style={{ 
                  fontSize: 14, 
                  color: '#6c757d',
                  textAlign: 'center',
                  marginTop: 4
                }}>
                  {peticion.alumno_nombre} {peticion.alumno_apellidos}
                </Text>
              </View>

              {/* Información de la petición */}
              <View style={{
                backgroundColor: '#f8f9fa',
                borderRadius: 12,
                padding: 16,
                marginBottom: 20
              }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#495057', marginBottom: 8 }}>
                  Detalles del Cambio
                </Text>
                <View style={{ gap: 6 }}>
                  <Text style={{ fontSize: 13, color: '#6c757d' }}>
                    📚 <Text style={{ fontWeight: '500' }}>Carrera Actual:</Text> {peticion.carrera_actual_nombre}
                  </Text>
                  <Text style={{ fontSize: 13, color: '#6c757d' }}>
                    🎯 <Text style={{ fontWeight: '500' }}>Carrera Nueva:</Text> {peticion.carrera_nueva_nombre}
                  </Text>
                  <Text style={{ fontSize: 13, color: '#6c757d' }}>
                    📅 <Text style={{ fontWeight: '500' }}>Fecha:</Text> {new Date(peticion.fecha_creacion).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              {/* Selector de estado */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#495057', marginBottom: 12 }}>
                  Decisión
                </Text>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity
                    onPress={() => setEstado('aprobada')}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderRadius: 10,
                      backgroundColor: estado === 'aprobada' ? '#28a745' : '#f8f9fa',
                      borderWidth: 2,
                      borderColor: estado === 'aprobada' ? '#28a745' : '#e9ecef',
                      alignItems: 'center',
                      flexDirection: 'row',
                      justifyContent: 'center'
                    }}
                  >
                    <Text style={{ fontSize: 18, marginRight: 6 }}>✅</Text>
                    <Text style={{ 
                      color: estado === 'aprobada' ? 'white' : '#495057',
                      fontWeight: '600',
                      fontSize: 14
                    }}>
                      Aprobar
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => setEstado('rechazada')}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderRadius: 10,
                      backgroundColor: estado === 'rechazada' ? '#dc3545' : '#f8f9fa',
                      borderWidth: 2,
                      borderColor: estado === 'rechazada' ? '#dc3545' : '#e9ecef',
                      alignItems: 'center',
                      flexDirection: 'row',
                      justifyContent: 'center'
                    }}
                  >
                    <Text style={{ fontSize: 18, marginRight: 6 }}>❌</Text>
                    <Text style={{ 
                      color: estado === 'rechazada' ? 'white' : '#495057',
                      fontWeight: '600',
                      fontSize: 14
                    }}>
                      Rechazar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Campo de contraseña */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#495057', marginBottom: 8 }}>
                  Contraseña de Autorización
                </Text>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#e9ecef',
                  borderRadius: 10,
                  backgroundColor: '#f8f9fa'
                }}>
                  <TextInput
                    value={contraseña}
                    onChangeText={setContraseña}
                    placeholder="Ingrese su contraseña"
                    secureTextEntry={!showPassword}
                    style={{
                      flex: 1,
                      paddingVertical: 14,
                      paddingHorizontal: 16,
                      fontSize: 16,
                      color: '#495057'
                    }}
                    placeholderTextColor="#adb5bd"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={{ padding: 12 }}
                  >
                    <Text style={{ fontSize: 18 }}>
                      {showPassword ? '🙈' : '👁️'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text style={{ fontSize: 12, color: '#6c757d', marginTop: 6 }}>
                  Se requiere su contraseña para autorizar esta acción
                </Text>
              </View>

              {/* Campo de comentarios (solo para rechazo) */}
              {estado === 'rechazada' && (
                <View style={{ marginBottom: 20 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#495057', marginBottom: 8 }}>
                    Motivo del Rechazo *
                  </Text>
                  <TextInput
                    value={comentarios}
                    onChangeText={setComentarios}
                    placeholder="Explique el motivo del rechazo..."
                    multiline
                    numberOfLines={4}
                    style={{
                      borderWidth: 1,
                      borderColor: '#e9ecef',
                      borderRadius: 10,
                      padding: 16,
                      fontSize: 16,
                      color: '#495057',
                      backgroundColor: '#f8f9fa',
                      textAlignVertical: 'top',
                      minHeight: 100
                    }}
                    placeholderTextColor="#adb5bd"
                  />
                  <Text style={{ fontSize: 12, color: '#6c757d', marginTop: 6 }}>
                    Es obligatorio proporcionar un motivo para rechazar la petición
                  </Text>
                </View>
              )}

              {/* Botones */}
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 10 }}>
                <TouchableOpacity
                  onPress={handleClose}
                  disabled={loading}
                  style={{
                    flex: 1,
                    paddingVertical: 14,
                    borderRadius: 10,
                    backgroundColor: '#6c757d',
                    alignItems: 'center'
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
                    Cancelar
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={loading}
                  style={{
                    flex: 1,
                    paddingVertical: 14,
                    borderRadius: 10,
                    backgroundColor: estado === 'aprobada' ? '#28a745' : '#dc3545',
                    alignItems: 'center',
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
                    {loading ? 'Procesando...' : estado === 'aprobada' ? 'Aprobar' : 'Rechazar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </ThemedView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}; 