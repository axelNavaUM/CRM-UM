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
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#324d67',
    gap: 8,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  value: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
