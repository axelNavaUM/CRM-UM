import { ThemedView } from '@/components/ThemedView';
import React from 'react';
import { Text, View } from 'react-native';

interface EstadisticasProps {
  estadisticas: {
    total: number;
    pendientes: number;
    aprobadas: number;
    rechazadas: number;
    enProceso: number;
  };
}

export const EstadisticasCards: React.FC<EstadisticasProps> = ({ estadisticas }) => {
  const cards = [
    {
      titulo: 'Total',
      valor: estadisticas.total,
      color: '#6c757d',
      icono: '📊'
    },
    {
      titulo: 'En Proceso',
      valor: estadisticas.enProceso,
      color: '#ffc107',
      icono: '⏳'
    },
    {
      titulo: 'Pendientes',
      valor: estadisticas.pendientes,
      color: '#17a2b8',
      icono: '⏰'
    },
    {
      titulo: 'Aprobadas',
      valor: estadisticas.aprobadas,
      color: '#28a745',
      icono: '✅'
    },
    {
      titulo: 'Rechazadas',
      valor: estadisticas.rechazadas,
      color: '#dc3545',
      icono: '❌'
    }
  ];

  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ 
        fontSize: 18, 
        fontWeight: 'bold', 
        color: '#2c3e50', 
        marginBottom: 15 
      }}>
        Resumen de Peticiones
      </Text>
      
      <View style={{ 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        gap: 12,
        justifyContent: 'space-between'
      }}>
        {cards.map((card, index) => (
          <ThemedView
            key={index}
            style={{
              backgroundColor: 'white',
              borderRadius: 12,
              padding: 16,
              minWidth: '48%',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
              borderLeftWidth: 4,
              borderLeftColor: card.color
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ fontSize: 20, marginRight: 8 }}>{card.icono}</Text>
              <Text style={{ 
                fontSize: 12, 
                color: '#6c757d', 
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: 0.5
              }}>
                {card.titulo}
              </Text>
            </View>
            
            <Text style={{ 
              fontSize: 28, 
              fontWeight: 'bold', 
              color: card.color,
              marginBottom: 4
            }}>
              {card.valor}
            </Text>
            
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center',
              marginTop: 4
            }}>
              <View style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: card.color,
                marginRight: 6
              }} />
              <Text style={{ 
                fontSize: 11, 
                color: '#6c757d' 
              }}>
                {card.valor === 1 ? 'petición' : 'peticiones'}
              </Text>
            </View>
          </ThemedView>
        ))}
      </View>
    </View>
  );
}; 