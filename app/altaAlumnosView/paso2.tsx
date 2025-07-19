import { Input } from '@/components/ui/Input';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { Picker } from '@react-native-picker/picker';
import React from 'react';
import { Text, View } from 'react-native';

export interface Paso2CarreraCicloProps {
  datos: any;
  setDatos: (d: any) => void;
  carreras: Array<{ id: string; nombre: string }>;
  ciclos: Array<{ nombre: string; fecha_inicio: string }>;
  onSiguiente: () => void;
  onAtras: () => void;
}

/**
 * Paso 2: Selección de carrera, ciclo y grupo
 * @param {Paso2CarreraCicloProps} props
 */
const Paso2CarreraCiclo: React.FC<Paso2CarreraCicloProps> = ({ datos, setDatos, carreras, ciclos, onSiguiente, onAtras }) => {
  return (
    <View>
      <Text style={{ marginBottom: 8, fontWeight: '500' }}>Selecciona tu carrera:</Text>
      <Picker
        selectedValue={datos.carreraId}
        onValueChange={value => setDatos({ ...datos, carreraId: value })}
        style={{ marginBottom: 16 }}
      >
        <Picker.Item label="Selecciona una carrera" value={undefined} />
        {carreras.map(c => (
          <Picker.Item key={c.id} label={c.nombre} value={c.id} />
        ))}
      </Picker>
      <Text style={{ marginBottom: 8, fontWeight: '500', marginTop: 16 }}>Ciclo automático:</Text>
      <Input placeholder="Ciclo" value={datos.cicloAuto} editable={false} />
      <Text style={{ marginBottom: 8, fontWeight: '500', marginTop: 16 }}>Grupo:</Text>
      <Input placeholder="Grupo" value={datos.grupo} onChangeText={text => setDatos({ ...datos, grupo: text })} />
      <PrimaryButton label="Siguiente" disabled={!datos.carreraId || !datos.cicloAuto || !datos.grupo} onPress={onSiguiente} />
      <PrimaryButton label="Atrás" onPress={onAtras} />
    </View>
  );
};

export default Paso2CarreraCiclo; 