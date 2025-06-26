import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { styles } from '@/style/inicio2';

const RecentActivitiesTable = ({ activities }) => {
  return (
    <View style={styles.table}>
      <View style={styles.tableHeader}>
        <Text style={styles.tableHeaderCell}>Actividad</Text>
        <Text style={styles.tableHeaderCell}>Fecha</Text>
        <Text style={styles.tableHeaderCell}>Detalle de Movimiento</Text>
      </View>
      <FlatList
        data={activities}
        renderItem={({ item }) => (
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>{item.activity}</Text>
            <Text style={styles.tableCell}>{item.date}</Text>
            <Text style={styles.tableCell}>{item.details}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

export default RecentActivitiesTable;
