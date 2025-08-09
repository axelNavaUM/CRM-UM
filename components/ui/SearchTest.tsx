import { useSearch } from '@/context/SearchContext';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const SearchTest: React.FC = () => {
  const { isSearchVisible, openSearch } = useSearch();

  return (
    <View style={styles.container}>
      {/* Contenido de prueba que debería estar por debajo */}
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Header de Prueba</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sección 1</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Card 1</Text>
            <Text style={styles.cardText}>Este contenido debería estar por debajo del buscador</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sección 2</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Card 2</Text>
            <Text style={styles.cardText}>Más contenido de prueba</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sección 3</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Card 3</Text>
            <Text style={styles.cardText}>Contenido adicional para probar z-index</Text>
          </View>
        </View>

        {/* Botón para abrir el buscador */}
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => {
            console.log('🔍 Abriendo buscador...');
            openSearch();
          }}
        >
          <Text style={styles.searchButtonText}>🔍 Abrir Buscador</Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sección 4</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Card 4</Text>
            <Text style={styles.cardText}>Contenido que debería estar oculto cuando el buscador esté abierto</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sección 5</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Card 5</Text>
            <Text style={styles.cardText}>Más contenido de prueba</Text>
          </View>
        </View>
      </ScrollView>

      {/* Debug: Indicador de estado */}
      {__DEV__ && (
        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>
            Estado: {isSearchVisible ? 'BUSCADOR ABIERTO' : 'BUSCADOR CERRADO'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: '#3B82F6',
    padding: 20,
    alignItems: 'center',
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  searchButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    margin: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  debugContainer: {
    position: 'absolute',
    top: 50,
    right: 10,
    backgroundColor: 'red',
    padding: 8,
    borderRadius: 4,
    zIndex: 9998,
  },
  debugText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default SearchTest; 