import { SearchResult, SearchService } from '@/services/searchService';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Keyboard,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SearchResultCard from './SearchResultCard';

interface SearchBarProps {
  isVisible: boolean;
  onClose: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ isVisible, onClose }) => {
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();
  const searchInputRef = useRef<TextInput>(null);

  // Animaciones
  const expandAnim = useRef(new Animated.Value(0)).current;
  const resultsAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const { width, height } = Dimensions.get('window');
  const isMobile = width < 600;

  // Datos mock para pruebas
  const mockData: SearchResult[] = [
    {
      id: '1',
      type: 'alumno',
      title: 'Juan Pérez',
      subtitle: 'Matrícula: 2024001 - Ingeniería en Sistemas',
      icon: 'account',
      route: '/alumno/1',
    },
    {
      id: '2',
      type: 'alumno',
      title: 'María García',
      subtitle: 'Matrícula: 2024002 - Administración',
      icon: 'account',
      route: '/alumno/2',
    },
    {
      id: '3',
      type: 'configuracion',
      title: 'Configuración de Perfiles',
      subtitle: 'Gestionar roles y permisos de usuarios',
      icon: 'account-cog',
      route: '/configuracion/perfiles',
    },
    {
      id: '4',
      type: 'alta',
      title: 'Alta de Alumno',
      subtitle: 'Registrar nuevo estudiante',
      icon: 'account-plus',
      route: '/altaAlumno',
    },
    {
      id: '5',
      type: 'alumno',
      title: 'Usuario Test',
      subtitle: 'Matrícula: 6225455059 - Carrera Test',
      icon: 'account',
      route: '/alumno/5',
    },
    {
      id: '6',
      type: 'configuracion',
      title: 'Usuario 6225455059',
      subtitle: 'Usuario - Administrador',
      icon: 'account-cog',
      route: '/configuracion/usuario/6',
    },
  ];

  // Animación de expansión
  useEffect(() => {
    if (isVisible) {
      setIsExpanded(true);
      Animated.parallel([
        Animated.timing(expandAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: false,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
      
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 150);
    } else {
      setIsExpanded(false);
      Animated.parallel([
        Animated.timing(expandAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: false,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(resultsAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false,
        }),
      ]).start();
      
      setSearchText('');
      setResults([]);
    }
  }, [isVisible]);

  // Animación de resultados
  useEffect(() => {
    if (results.length > 0 || isSearching) {
      Animated.timing(resultsAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(resultsAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }).start();
    }
  }, [results.length, isSearching]);

  useEffect(() => {
    if (searchText.length > 0) {
      performSearch();
    } else {
      setResults([]);
    }
  }, [searchText]);

  const performSearch = async () => {
    console.log('🔍 SearchBar: Performing search for:', searchText);
    setIsSearching(true);
    
    try {
      // Usar Supabase para búsqueda real
      const searchResults = await SearchService.globalSearch(searchText);
      console.log('🔍 SearchBar: Supabase search results:', searchResults.length);
      setResults(searchResults);
      
      // Si no hay resultados en Supabase, usar datos mock como fallback
      if (searchResults.length === 0) {
        console.log('🔍 SearchBar: No Supabase results, using mock data as fallback');
        const filteredResults = mockData.filter(item => {
          const pattern = new RegExp(searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
          return (
            pattern.test(item.title || '') ||
            pattern.test(item.subtitle || '')
          );
        });
        setResults(filteredResults);
      }
    } catch (error) {
      console.error('🔍 SearchBar: Error in search:', error);
      // En caso de error, usar datos mock
      const filteredResults = mockData.filter(item => {
        const pattern = new RegExp(searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        return (
          pattern.test(item.title || '') ||
          pattern.test(item.subtitle || '')
        );
      });
      setResults(filteredResults);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultPress = (result: SearchResult) => {
    console.log('🔍 SearchBar: Result pressed:', result);
    if (result.route) {
      router.push(result.route as any);
    }
    setSearchText('');
    setResults([]);
    onClose();
  };

  const handleClose = () => {
    Keyboard.dismiss();
    onClose();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: opacityAnim,
        }
      ]}
      pointerEvents={isVisible ? 'auto' : 'none'}
    >
      {/* Overlay de fondo */}
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={handleClose}
      />
      
              {/* Contenedor principal */}
        <Animated.View 
          style={[
            styles.mainContainer,
            {
              transform: [
                {
                  scaleX: expandAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.7, 1],
                  })
                },
                {
                  scaleY: expandAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  })
                }
              ],
              opacity: expandAnim,
            }
          ]}
          pointerEvents={isVisible ? 'auto' : 'none'}
        >
          {/* Debug: Indicador de que el contenedor principal está visible */}
          {__DEV__ && (
            <View style={{
              position: 'absolute',
              top: 0,
              left: 0,
              backgroundColor: 'blue',
              padding: 4,
              zIndex: 10002,
            }}>
              <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
                MAIN CONTAINER
              </Text>
            </View>
          )}
        {/* Barra de búsqueda */}
        <View style={styles.searchBarContainer}>
          <View style={styles.searchInputContainer}>
            <Icon name="magnify" size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Search for reports, documents or anything?"
              placeholderTextColor="#9CA3AF"
              value={searchText}
              onChangeText={setSearchText}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
            {searchText.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchText('')}
                style={styles.clearButton}
              >
                <Icon name="close" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>CLOSE</Text>
          </TouchableOpacity>
        </View>

        {/* Contenedor de resultados */}
        <Animated.View 
          style={[
            styles.resultsWrapper,
            {
              maxHeight: resultsAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 400],
              }),
              opacity: resultsAnim,
            }
          ]}
        >
          {/* Debug: Indicador visual de que el contenedor está visible */}
          {__DEV__ && (
            <View style={{
              position: 'absolute',
              top: 0,
              right: 0,
              backgroundColor: 'red',
              padding: 4,
              zIndex: 10001,
            }}>
              <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
                RESULTS VISIBLE
              </Text>
            </View>
          )}
          {/* Estado de carga */}
          {isSearching && (
            <View style={styles.loadingContainer}>
              <View style={styles.loadingSpinner}>
                <Icon name="magnify" size={24} color="#3B82F6" />
              </View>
              <Text style={styles.loadingText}>Buscando...</Text>
            </View>
          )}

          {/* Resultados de búsqueda */}
          {!isSearching && results.length > 0 && (
            <View style={styles.resultsContainer}>
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsTitle}>Resultados de Búsqueda</Text>
                <Text style={styles.resultsCount}>{results.length} resultados encontrados</Text>
              </View>
              
              {/* Filtros por tipo */}
              <View style={styles.filtersContainer}>
                <Text style={styles.filtersTitle}>Filtrar por:</Text>
                <View style={styles.filtersRow}>
                  <TouchableOpacity style={[styles.filterButton, { backgroundColor: '#3B82F6' }]}>
                    <Text style={styles.filterButtonText}>Alumnos</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.filterButton, { backgroundColor: '#10B981' }]}>
                    <Text style={styles.filterButtonText}>Usuarios UM</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.filterButton, { backgroundColor: '#F59E0B' }]}>
                    <Text style={styles.filterButtonText}>Configuración</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <ScrollView 
                style={styles.resultsScrollView}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {results.map((result, index) => (
                  <SearchResultCard
                    key={result.id}
                    result={result}
                    onPress={handleResultPress}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Sin resultados */}
          {!isSearching && searchText.length > 0 && results.length === 0 && (
            <View style={styles.noResultsContainer}>
              <Icon name="magnify" size={32} color="#D1D5DB" />
              <Text style={styles.noResultsText}>No se encontraron resultados</Text>
              <Text style={styles.noResultsSubtext}>
                Intenta con otros términos de búsqueda
              </Text>
            </View>
          )}

          {/* Acciones rápidas cuando no hay búsqueda */}
          {!isSearching && searchText.length === 0 && (
            <View style={styles.quickActionsContainer}>
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsTitle}>Quick Actions</Text>
              </View>
              <View style={styles.quickActionsGrid}>
                <TouchableOpacity
                  style={styles.quickAction}
                  onPress={() => handleResultPress({
                    id: 'alta_alumno',
                    type: 'alta',
                    title: 'Alta de Alumno',
                    subtitle: 'Registrar nuevo estudiante',
                    icon: 'account-plus',
                    route: '/altaAlumno',
                  })}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: '#F59E0B' }]}>
                    <Icon name="account-plus" size={24} color="#FFFFFF" />
                  </View>
                  <Text style={styles.quickActionText}>Alta Alumno</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickAction}
                  onPress={() => handleResultPress({
                    id: 'alta_usuario',
                    type: 'alta',
                    title: 'Alta de Usuario',
                    subtitle: 'Registrar nuevo usuario del sistema',
                    icon: 'account-plus',
                    route: '/altaUsuario',
                  })}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: '#10B981' }]}>
                    <Icon name="account-plus" size={24} color="#FFFFFF" />
                  </View>
                  <Text style={styles.quickActionText}>Alta Usuario</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickAction}
                  onPress={() => handleResultPress({
                    id: 'config_perfiles',
                    type: 'configuracion',
                    title: 'Configuración de Perfiles',
                    subtitle: 'Gestionar roles y permisos de usuarios',
                    icon: 'account-cog',
                    route: '/configuracion/perfiles',
                  })}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: '#3B82F6' }]}>
                    <Icon name="cog" size={24} color="#FFFFFF" />
                  </View>
                  <Text style={styles.quickActionText}>Configuración</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    elevation: 9999,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 9998,
  },
  mainContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F8F9FA',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 9999,
    zIndex: 9999,
    overflow: 'hidden',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 4,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  closeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  resultsWrapper: {
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    zIndex: 10000,
    elevation: 10000,
  },
  resultsContainer: {
    backgroundColor: '#FFFFFF',
  },
  resultsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  resultsCount: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  filtersTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 8,
  },
  filtersRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  resultsScrollView: {
    maxHeight: 300,
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingSpinner: {
    marginBottom: 8,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  noResultsContainer: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 12,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
  },
  quickActionsContainer: {
    backgroundColor: '#FFFFFF',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 8,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default SearchBar; 