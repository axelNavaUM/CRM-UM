import React from 'react';
import { StyleSheet, TextInput } from 'react-native';

interface InputProps {
    placeholder: string;
    secureTextEntry?: boolean;
  }

export function Input({ placeholder, secureTextEntry}: any){
    return(
        <TextInput 
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        style={styles.input}
        placeholderTextColor="#61758a" />
    );
}

const styles = StyleSheet.create({
    input: {
      width: 280,
      height: 40,
      borderRadius: 8,
      backgroundColor: '#f0f2f5',
      paddingHorizontal: 16,
      fontSize: 14,
      fontWeight: '500',
      color: '#121417',
      marginVertical: 8,
    },
  });

