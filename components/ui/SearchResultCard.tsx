import { SearchResult } from '@/services/searchService';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface SearchResultCardProps {
  result: SearchResult;
  onPress: (result: SearchResult) => void;
}

const SearchResultCard: React.FC<SearchResultCardProps> = ({ result, onPress }) => {
  const getResultColor = (type: string) => {
    switch (type) {
      case 'alumno':
        return '#3B82F6'; // Azul para alumnos
      case 'usuario':
        return '#10B981'; // Verde para usuarios UM
      case 'configuracion':
        return '#F59E0B'; // Naranja para configuraciones
      case 'alta':
        return '#8B5CF6'; // Púrpura para altas
      default:
        return '#6B7280'; // Gris por defecto
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'alumno':
        return 'account';
      case 'usuario':
        return 'account-cog';
      case 'configuracion':
        return 'cog';
      case 'alta':
        return 'account-plus';
      default:
        return 'magnify';
    }
  };

  const getResultBadge = (type: string) => {
    switch (type) {
      case 'alumno':
        return 'Alumno';
      case 'usuario':
        return 'Usuario UM';
      case 'configuracion':
        return 'Configuración';
      case 'alta':
        return 'Alta';
      default:
        return 'Otro';
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(result)}
      activeOpacity={0.7}
    >
      {/* Icono a la izquierda */}
      <View style={[styles.iconContainer, { backgroundColor: getResultColor(result.type) }]}>
        <Icon name={getResultIcon(result.type)} size={20} color="#FFFFFF" />
      </View>

      {/* Contenido a la derecha */}
      <View style={styles.contentContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {result.title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={2}>
          {result.subtitle}
        </Text>
        
        {/* Badge del tipo */}
        <View style={[styles.badge, { backgroundColor: getResultColor(result.type) }]}>
          <Text style={styles.badgeText}>{getResultBadge(result.type)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
});

export default SearchResultCard; 