import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import PrimaryButton from '@/components/ui/home/PrimaryButton';
import CardBox from '@/components/ui/home/CardBox';
import BarChartBox from '@/components/ui/home/BarChartBox';

export default function InicioScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Inicio</Text>
      </View>

      <View style={styles.buttonGroup}>
        <PrimaryButton label="Registrar Alumno" backgroundColor="#1383eb" />
        <PrimaryButton label="Ver Historial" backgroundColor="#233648" />
      </View>

      <View style={styles.buttonWrapper}>
        <PrimaryButton label="Cambiar Carrera" backgroundColor="#233648" />
      </View>

      <View style={styles.cards}>
        <CardBox title="Registros" value="120" />
        <CardBox title="Tareas Pendientes" value="3" />
        <CardBox title="Documentos por Revisar" value="2" />
      </View>

      <BarChartBox />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: '#0c1a24',
  },
  header: {
    paddingVertical: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    paddingBottom: 12,
  },
  buttonWrapper: {
    marginBottom: 16,
  },
  cards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
});
