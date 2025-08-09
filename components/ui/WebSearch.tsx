import { SearchResult, SearchService } from '@/services/searchService';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import RadixIcons from './RadixIcons';
import SearchAsideContent from './SearchAsideContent';

const { width: screenWidth } = Dimensions.get('window');

interface WebSearchProps {
  visible: boolean;
  onClose: () => void;
  onResultPress?: (result: SearchResult) => void;
}

const WebSearch: React.FC<WebSearchProps> = ({
  visible,
  onClose,
  onResultPress,
}) => {
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  
  const router = useRouter();
  const searchInputRef = useRef<TextInput>(null);

  // Búsqueda en tiempo real
  useEffect(() => {
    if (searchText.length > 2) {
      performSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchText]);

  // Focus en el input cuando se abre
  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [visible]);

  const performSearch = async () => {
    setIsSearching(true);
    try {
      const results = await SearchService.globalSearch(searchText);
      setSearchResults(results);
    } catch (error) {
      console.error('Error en búsqueda:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Manejar cierre de búsqueda
  const handleClose = () => {
    setSearchText('');
    setSearchResults([]);
    onClose();
  };

  // Manejar selección de resultado
  const handleResultPress = (result: SearchResult) => {
    setSelectedResult(result);
    onResultPress?.(result);
  };

  // Manejar volver a la búsqueda
  const handleBackToSearch = () => {
    setSelectedResult(null);
  };

  // Manejar cierre completo
  const handleCloseSearch = () => {
    setSelectedResult(null);
    handleClose();
  };



  const getResultColor = (type: string) => {
    switch (type) {
      case 'alumno': return '#3B82F6';
      case 'usuario': return '#10B981';
      case 'peticion': return '#F59E0B';
      case 'carrera': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'alumno': return RadixIcons.User;
      case 'usuario': return RadixIcons.Users;
      case 'peticion': return RadixIcons.FileText;
      case 'carrera': return RadixIcons.Graduation;
      default: return RadixIcons.Search;
    }
  };

  const renderResultItem = (result: SearchResult) => {
    const color = getResultColor(result.type);
    const IconComponent = getResultIcon(result.type);
    
    return (
      <TouchableOpacity
        key={result.id}
        style={styles.resultItem}
        onPress={() => handleResultPress(result)}
        activeOpacity={0.7}
      >
        <View style={[styles.resultIcon, { backgroundColor: color + '20' }]}>
          <IconComponent size={18} color={color} />
        </View>
        <View style={styles.resultContent}>
          <Text style={styles.resultTitle} numberOfLines={1}>
            {result.title}
          </Text>
          <Text style={styles.resultDescription} numberOfLines={2}>
            {result.subtitle}
          </Text>
          <View style={styles.resultMeta}>
            <Text style={styles.resultType}>
              {result.type.toUpperCase()}
            </Text>
            <RadixIcons.ChevronRight size={16} color="#9CA3AF" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (!visible) return null;

  // Si hay un resultado seleccionado, mostrar el aside panel con detalles
  if (selectedResult) {
    return (
      <View style={styles.asideContainer}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={handleCloseSearch} 
        />
        <View style={styles.aside}>
          <SearchAsideContent
            result={selectedResult}
            onClose={handleCloseSearch}
            onBack={handleBackToSearch}
          />
        </View>
      </View>
    );
  }

  // Mostrar la interfaz de búsqueda
  return (
    <View style={styles.asideContainer}>
      {/* Backdrop para web */}
      <TouchableOpacity 
        style={styles.backdrop} 
        activeOpacity={1} 
        onPress={handleClose} 
      />
      
      {/* Aside de búsqueda */}
      <View style={styles.aside}>
        <View style={styles.asideHeader}>
          <Text style={styles.asideTitle}>Búsqueda Global</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <RadixIcons.Close size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <RadixIcons.Search size={20} color="#9CA3AF" />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Buscar alumnos, usuarios, peticiones..."
              placeholderTextColor="#9CA3AF"
              value={searchText}
              onChangeText={setSearchText}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <RadixIcons.Close size={16} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView 
          style={styles.resultsContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.resultsList}
        >
          {isSearching ? (
            <View style={styles.loadingContainer}>
              <RadixIcons.Search size={24} color="#3B82F6" />
              <Text style={styles.loadingText}>Buscando...</Text>
            </View>
          ) : searchResults.length > 0 ? (
            searchResults.map(renderResultItem)
          ) : searchText.length > 2 ? (
            <View style={styles.emptyContainer}>
              <RadixIcons.Search size={48} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No se encontraron resultados</Text>
              <Text style={styles.emptySubtitle}>
                Intenta con otros términos de búsqueda
              </Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <RadixIcons.Search size={48} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>Búsqueda Global</Text>
              <Text style={styles.emptySubtitle}>
                Busca alumnos, usuarios, peticiones y más
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  asideContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999999,
    flexDirection: 'row',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  aside: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 450,
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 1,
    borderLeftColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: -4,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  asideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  asideTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#111827',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsList: {
    padding: 20,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  resultIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  resultDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  resultMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultType: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  detailContainer: {
    flex: 1,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  detailIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  detailInfo: {
    flex: 1,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  detailType: {
    fontSize: 14,
    color: '#6B7280',
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  detailContent: {
    flex: 1,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  detailDescriptionContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailDescription: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  detailDataContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  navigateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default WebSearch; 