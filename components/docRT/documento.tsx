import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  studentName: string;
}

const RegisterDocument = ({ studentName }: Props) => {
  const fechaActual = new Date().toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <View style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.university}>UniverMilenium</Text>
        <Text style={styles.date}>{fechaActual}</Text>
      </View>

      {/* Cuerpo del documento */}
      <Text style={styles.text}>
        Por este documento presente, el alumno{' '}
        <Text style={styles.bold}>{studentName || '__________'}</Text> declara estar de acuerdo con los términos de inscripción para el ciclo escolar correspondiente.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 260,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'flex-start',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  university: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  date: {
    color: '#cbd5e1',
    fontSize: 13,
  },
  text: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 20,
  },
  bold: {
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default RegisterDocument;
