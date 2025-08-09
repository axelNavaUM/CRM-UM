import { Input } from '@/components/ui/Input';
import PrimaryButton from '@/components/ui/PrimaryButton';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';

export interface Paso4ContratoProps {
  contrato: string;
  contratoAceptado: boolean;
  setContratoAceptado: (v: boolean) => void;
  onFinalizar: () => void;
  onAtras: () => void;
  loading?: boolean;
  error?: string;
  success?: string;
}

/**
 * Paso 4: Contrato y finalización de registro
 * @param {Paso4ContratoProps} props
 */
const Paso4Contrato: React.FC<Paso4ContratoProps> = ({ contrato, contratoAceptado, setContratoAceptado, onFinalizar, onAtras, loading, error, success }) => {
  return (
    <View>
      <Text style={{ marginBottom: 16, fontWeight: 'bold' }}>Contrato</Text>
      <ScrollView style={{ maxHeight: 200, marginBottom: 16 }}>
        <Text style={{ fontFamily: 'monospace' }}>{contrato}</Text>
      </ScrollView>
      <Input
        placeholder="Acepto los términos y condiciones"
        value={contratoAceptado ? 'Sí' : ''}
        onChangeText={v => setContratoAceptado(!!v)}
      />
      <PrimaryButton label="Finalizar registro" disabled={!contratoAceptado || loading} onPress={onFinalizar} />
      {loading && <Text style={{ marginTop: 8, color: '#6B7280' }}>Subiendo documentos, por favor espera...</Text>}
      <PrimaryButton label="Atrás" onPress={onAtras} />
      {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}
      {success ? <Text style={{ color: 'green' }}>{success}</Text> : null}
    </View>
  );
};

export default Paso4Contrato; 