import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function BarChartBox() {
  const barData = [
    { label: 'Sem 1', height: '90%' },
    { label: 'Sem 2', height: '40%' },
    { label: 'Sem 3', height: '80%' },
    { label: 'Sem 4', height: '60%' },
  ];

  return (
    <View style={styles.box}>
      <Text style={styles.title}>Proceso del Mes</Text>
      <Text style={styles.percent}>85%</Text>
      <View style={styles.row}>
        <Text style={styles.week}>Semana 4</Text>
        <Text style={styles.improvement}>+5%</Text>
      </View>
      <View style={styles.barChart}>
        {barData.map((item, idx) => (
          <View key={idx} style={styles.barGroup}>
            <View style={[styles.bar, { height: item.height }]} />
            <Text style={styles.barLabel}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#324d67',
    borderRadius: 12,
    padding: 24,
    minWidth: 288,
  },
  title: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    marginBottom: 4,
  },
  percent: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  week: {
    color: '#92aec9',
    fontSize: 16,
  },
  improvement: {
    color: '#0bda5b',
    fontSize: 16,
    fontWeight: '500',
  },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    minHeight: 180,
    paddingHorizontal: 12,
  },
  barGroup: {
    alignItems: 'center',
    gap: 4,
  },
  bar: {
    width: 16,
    backgroundColor: '#233648',
    borderTopWidth: 2,
    borderColor: '#92aec9',
  },
  barLabel: {
    color: '#92aec9',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
