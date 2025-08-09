import { useSearch } from '@/context/SearchContext';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const SearchDemo: React.FC = () => {
  const { isSearchVisible, openSearch } = useSearch();

  return (
    <View style={styles.container}>
      {/* Contenido de prueba */}
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Demo de Búsqueda</Text>
          <Text style={styles.headerSubtext}>Prueba las búsquedas de alumnos y usuarios UM</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Búsquedas de Alumnos</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Por Matrícula</Text>
            <Text style={styles.cardText}>Busca alumnos por número de matrícula</Text>
            <Text style={styles.exampleText}>Ejemplo: "2024001"</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Por Nombre</Text>
            <Text style={styles.cardText}>Busca alumnos por nombre o apellido</Text>
            <Text style={styles.exampleText}>Ejemplo: "Juan Pérez"</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Búsquedas de Usuarios UM</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Por Nombre</Text>
            <Text style={styles.cardText}>Busca usuarios UM por nombre o apellido</Text>
            <Text style={styles.exampleText}>Ejemplo: "María García"</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Por Correo</Text>
            <Text style={styles.cardText}>Busca usuarios UM por correo institucional</Text>
            <Text style={styles.exampleText}>Ejemplo: "maria.garcia@um.edu.mx"</Text>
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
          <Text style={styles.searchButtonText}>🔍 Probar Buscador</Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipos de Resultados</Text>
          <View style={styles.card}>
            <View style={styles.resultType}>
              <View style={[styles.typeIcon, { backgroundColor: '#3B82F6' }]}>
                <Text style={styles.typeIconText}>👨‍🎓</Text>
              </View>
              <View style={styles.typeInfo}>
                <Text style={styles.typeTitle}>Alumnos</Text>
                <Text style={styles.typeDescription}>Estudiantes registrados con matrícula y carrera</Text>
              </View>
            </View>
          </View>
          <View style={styles.card}>
            <View style={styles.resultType}>
              <View style={[styles.typeIcon, { backgroundColor: '#10B981' }]}>
                <Text style={styles.typeIconText}>👨‍💼</Text>
              </View>
              <View style={styles.typeInfo}>
                <Text style={styles.typeTitle}>Usuarios UM</Text>
                <Text style={styles.typeDescription}>Personal administrativo y docente</Text>
              </View>
            </View>
          </View>
          <View style={styles.card}>
            <View style={styles.resultType}>
              <View style={[styles.typeIcon, { backgroundColor: '#F59E0B' }]}>
                <Text style={styles.typeIconText}>⚙️</Text>
              </View>
              <View style={styles.typeInfo}>
                <Text style={styles.typeTitle}>Configuración</Text>
                <Text style={styles.typeDescription}>Áreas y configuraciones del sistema</Text>
              </View>
            </View>
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
  headerSubtext: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 4,
    opacity: 0.9,
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
    marginBottom: 12,
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
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 12,
    color: '#3B82F6',
    fontStyle: 'italic',
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
  resultType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  typeIconText: {
    fontSize: 20,
  },
  typeInfo: {
    flex: 1,
  },
  typeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  typeDescription: {
    fontSize: 12,
    color: '#6B7280',
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

export default SearchDemo; 