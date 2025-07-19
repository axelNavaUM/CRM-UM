import { Input } from '@/components/ui/Input';
import PrimaryButton from '@/components/ui/PrimaryButton';
import React, { useState } from 'react';
import { Text, View } from 'react-native';

export interface Paso1DatosPersonalesProps {
  datos: {
    nombre: string;
    apellidos: string;
    email: string;
    matricula: string;
  };
  setDatos: (d: any) => void;
  onSiguiente: () => void;
}

/**
 * Paso 1: Datos personales del alumno
 * @param {Paso1DatosPersonalesProps} props
 */
const Paso1DatosPersonales: React.FC<Paso1DatosPersonalesProps> = ({ datos, setDatos, onSiguiente }) => {
  const [validationError, setValidationError] = useState('');

  function isValidEmail(email: string) {
    return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
  }

  return (
    <View>
      <Input placeholder="Nombre" value={datos.nombre} onChangeText={v => setDatos({ ...datos, nombre: v })} />
      <Input placeholder="Apellidos" value={datos.apellidos} onChangeText={v => setDatos({ ...datos, apellidos: v })} />
      <Input placeholder="Email" value={datos.email} onChangeText={v => setDatos({ ...datos, email: v })} keyboardType="email-address" />
      <Input placeholder="Matrícula" value={datos.matricula} editable={false} />
      {validationError ? <Text style={{ color: 'red', marginBottom: 8 }}>{validationError}</Text> : null}
      {!isValidEmail(datos.email) && datos.email.length > 0 ? (
        <Text style={{ color: 'red', marginBottom: 8 }}>Email no válido</Text>
      ) : null}
      <PrimaryButton
        label="Siguiente"
        disabled={!datos.nombre || !datos.apellidos || !datos.email || !datos.matricula || !isValidEmail(datos.email)}
        onPress={() => {
          if (!datos.nombre || !datos.apellidos || !datos.email || !datos.matricula) {
            setValidationError('Todos los campos son obligatorios.');
            return;
          }
          if (!isValidEmail(datos.email)) {
            setValidationError('El email no es válido.');
            return;
          }
          setValidationError('');
          onSiguiente();
        }}
      />
    </View>
  );
};

export default Paso1DatosPersonales;