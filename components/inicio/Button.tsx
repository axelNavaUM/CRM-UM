import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { styles } from '@/style/inicio2';
const Button = ({ title, onPress, bgColor, textColor }) => {
  return (
    <TouchableOpacity style={[styles.button, { backgroundColor: bgColor }]} onPress={onPress}>
      <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>
    </TouchableOpacity>
  );
};
export default Button;