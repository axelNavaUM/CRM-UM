import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface FiltrosPeticionesProps {
  filtroActivo: 'todas' | 'pendientes' | 'aprobadas' | 'rechazadas';
  onFiltroChange: (filtro: 'todas' | 'pendientes' | 'aprobadas' | 'rechazadas') => void;
  estadisticas: {
    total: number;
    pendientes: number;
    aprobadas: number;
    rechazadas: number;
    enProceso: number;
  };
}

export const FiltrosPeticiones: React.FC<FiltrosPeticionesProps> = ({
  filtroActivo,
  onFiltroChange,
  estadisticas
}) => {
  const filtros = [
    {
      id: 'todas' as const,
      label: 'Todas',
      count: estadisticas.total,
      color: '#6c757d',
      icon: '📋'
    },
    {
      id: 'pendientes' as const,
      label: 'Pendientes',
      count: estadisticas.pendientes,
      color: '#17a2b8',
      icon: '⏰'
    },
    {
      id: 'aprobadas' as const,
      label: 'Aprobadas',
      count: estadisticas.aprobadas,
      color: '#28a745',
      icon: '✅'
    },
    {
      id: 'rechazadas' as const,
      label: 'Rechazadas',
      count: estadisticas.rechazadas,
      color: '#dc3545',
      icon: '❌'
    }
  ];

  return (
    <View style={{ marginBottom: 15 }}>
      <Text style={{ 
        fontSize: 16, 
        fontWeight: '600', 
        color: '#2c3e50', 
        marginBottom: 12 
      }}>
        Filtrar por Estado
      </Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 20 }}
      >
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {filtros.map((filtro) => (
            <TouchableOpacity
              key={filtro.id}
              onPress={() => onFiltroChange(filtro.id)}
              style={{
                backgroundColor: filtroActivo === filtro.id ? filtro.color : 'white',
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 10,
                flexDirection: 'row',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
                borderWidth: 1,
                borderColor: filtroActivo === filtro.id ? filtro.color : '#e9ecef',
                minWidth: 100
              }}
            >
              <Text style={{ 
                fontSize: 16, 
                marginRight: 6,
                opacity: filtroActivo === filtro.id ? 1 : 0.7
              }}>
                {filtro.icon}
              </Text>
              
              <View style={{ flex: 1 }}>
                <Text style={{ 
                  fontSize: 12, 
                  fontWeight: '600',
                  color: filtroActivo === filtro.id ? 'white' : '#495057',
                  marginBottom: 2
                }}>
                  {filtro.label}
                </Text>
                
                <Text style={{ 
                  fontSize: 14, 
                  fontWeight: 'bold',
                  color: filtroActivo === filtro.id ? 'white' : filtro.color
                }}>
                  {filtro.count}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}; 