import React from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  placeholder: string;
  secureTextEntry?: boolean;
}

export function Input({ placeholder, secureTextEntry, value, onChangeText }: InputProps) {
  return (
    <TextInput
      placeholder={placeholder}
      secureTextEntry={secureTextEntry}
      style={styles.input}
      placeholderTextColor="#61758a"
      value={value}
      onChangeText={onChangeText} 
      autoCapitalize="none"
      autoCorrect={false}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    width: '100%',
    minWidth: 280,
    maxWidth: 400,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
});
