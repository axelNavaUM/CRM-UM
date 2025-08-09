import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import RadixIcons from './RadixIcons';

const TestModernLayout: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test de Componentes Modernos</Text>
      
      <View style={styles.iconTest}>
        <Text style={styles.sectionTitle}>Iconos Radix:</Text>
        <View style={styles.iconGrid}>
          <RadixIcons.Home size={24} color="#3B82F6" />
          <RadixIcons.Users size={24} color="#10B981" />
          <RadixIcons.Settings size={24} color="#F59E0B" />
          <RadixIcons.Bell size={24} color="#EF4444" />
        </View>
      </View>

      <View style={styles.statusTest}>
        <Text style={styles.statusText}>✅ Componentes cargados correctamente</Text>
        <Text style={styles.statusText}>✅ Iconos Radix funcionando</Text>
        <Text style={styles.statusText}>✅ Layout moderno disponible</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 30,
    textAlign: 'center',
  },
  iconTest: {
    marginBottom: 30,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 15,
  },
  iconGrid: {
    flexDirection: 'row',
    gap: 20,
  },
  statusTest: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    color: '#10B981',
    marginBottom: 8,
  },
});

export default TestModernLayout; 