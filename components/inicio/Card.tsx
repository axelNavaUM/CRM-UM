import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '@/style/inicio2';

const Card = ({ title, value }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardValue}>{value}</Text>
    </View>
  );
};

export default Card;
