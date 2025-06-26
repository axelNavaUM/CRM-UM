import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface Props {
  title: string;
  backgroundColor: string;
  onPress?: () => void;
}

export default function PrimaryButton({ title, backgroundColor, onPress }: Props) {
  return (
    <TouchableOpacity style={[styles.button, { backgroundColor }]} onPress={onPress}>
      <Text style={styles.text} numberOfLines={1}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: 84,
    maxWidth: 480,
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.15,
  },
});
