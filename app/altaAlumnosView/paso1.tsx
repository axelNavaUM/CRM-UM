import { Input } from '@/components/ui/Input';
import PrimaryButton from '@/components/ui/PrimaryButton';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

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
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Input 
          placeholder="Nombre" 
          value={datos.nombre} 
          onChangeText={v => setDatos({ ...datos, nombre: v })} 
        />
        <Input 
          placeholder="Apellidos" 
          value={datos.apellidos} 
          onChangeText={v => setDatos({ ...datos, apellidos: v })} 
        />
        <Input 
          placeholder="Email" 
          value={datos.email} 
          onChangeText={v => setDatos({ ...datos, email: v })} 
          keyboardType="email-address" 
        />
        <Input 
          placeholder="Matrícula" 
          value={datos.matricula} 
          editable={false} 
        />
        
        {validationError ? (
          <Text style={styles.errorText}>{validationError}</Text>
        ) : null}
        
        {!isValidEmail(datos.email) && datos.email.length > 0 ? (
          <Text style={styles.errorText}>Email no válido</Text>
        ) : null}
        
        <View style={styles.buttonContainer}>
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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  formContainer: {
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 24,
  },
});

export default Paso1DatosPersonales;