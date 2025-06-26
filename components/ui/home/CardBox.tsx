import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  title: string;
  value: string;
}

export default function CardBox({ title, value }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 158,
    borderWidth: 1,
    borderColor: '#324d67',
    borderRadius: 12,
    padding: 24,
    gap: 8,
  },
  title: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  value: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
});
