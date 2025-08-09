import { RadixIcons } from '@/components/ui/RadixIcons';
import { DashboardMetrics } from '@/models/permisos/roleBasedContentModel';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

interface SalesMetricsSectionProps {
  userRole: string;
  metrics: DashboardMetrics;
}

export const SalesMetricsSection: React.FC<SalesMetricsSectionProps> = ({ userRole, metrics }) => {
  const [isLoading, setIsLoading] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const renderMetricCard = (title: string, value: string | number, icon: React.ReactNode, color: string) => (
    <View style={[styles.metricCard, { borderLeftColor: color }]}>
      <View style={styles.metricHeader}>
        {icon}
        <Text style={styles.metricTitle}>{title}</Text>
      </View>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
    </View>
  );

  const renderAdvisorMetrics = () => {
    const advisorEntries = Object.entries(metrics.registrationsByAdvisor);
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Registros por Asesor</Text>
        <View style={styles.advisorList}>
          {advisorEntries.map(([advisorId, count]) => (
            <View key={advisorId} style={styles.advisorItem}>
              <View style={styles.advisorInfo}>
                <RadixIcons.User size={16} color="#6B7280" />
                <Text style={styles.advisorName}>
                  {advisorId === 'Sin Asesor' ? 'Sin Asesor Asignado' : `Asesor ${advisorId}`}
                </Text>
              </View>
              <View style={styles.advisorStats}>
                <Text style={styles.advisorCount}>{count} registros</Text>
                <Text style={styles.advisorPercentage}>
                  {Math.round((count / metrics.totalRegistrations) * 100)}%
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderPetitionMetrics = () => {
    const petitionEntries = Object.entries(metrics.petitionsByAdvisor);
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Peticiones por Asesor</Text>
        <View style={styles.advisorList}>
          {petitionEntries.map(([advisorId, count]) => (
            <View key={advisorId} style={styles.advisorItem}>
              <View style={styles.advisorInfo}>
                <RadixIcons.FileText size={16} color="#6B7280" />
                <Text style={styles.advisorName}>
                  {advisorId === 'Sin Asesor' ? 'Sin Asesor Asignado' : `Asesor ${advisorId}`}
                </Text>
              </View>
              <View style={styles.advisorStats}>
                <Text style={styles.advisorCount}>{count} peticiones</Text>
                <Text style={styles.advisorPercentage}>
                  {Math.round((count / metrics.totalPetitions) * 100)}%
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1383eb" />
        <Text style={styles.loadingText}>Cargando métricas de ventas...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Métricas de Ventas</Text>
        <Text style={styles.subtitle}>
          Dashboard de rendimiento y estadísticas
        </Text>
      </View>

      <View style={styles.metricsGrid}>
        {renderMetricCard(
          'Total Registros',
          metrics.totalRegistrations.toString(),
          <RadixIcons.Users size={24} color="#3B82F6" />,
          '#3B82F6'
        )}
        
        {renderMetricCard(
          'Registros Pendientes',
          metrics.pendingRegistrations.toString(),
          <RadixIcons.Warning size={24} color="#F59E0B" />,
          '#F59E0B'
        )}
        
        {renderMetricCard(
          'Total Peticiones',
          metrics.totalPetitions.toString(),
          <RadixIcons.FileText size={24} color="#10B981" />,
          '#10B981'
        )}
        
        {renderMetricCard(
          'Peticiones Pendientes',
          metrics.pendingPetitions.toString(),
          <RadixIcons.Clock size={24} color="#EF4444" />,
          '#EF4444'
        )}
      </View>

      <View style={styles.summarySection}>
        <Text style={styles.summaryTitle}>Resumen de Rendimiento</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Tasa de Conversión</Text>
            <Text style={styles.summaryValue}>
              {metrics.totalRegistrations > 0 
                ? Math.round((metrics.totalPetitions / metrics.totalRegistrations) * 100)
                : 0}%
            </Text>
            <Text style={styles.summaryDescription}>
              Registros que generan peticiones
            </Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Eficiencia de Procesamiento</Text>
            <Text style={styles.summaryValue}>
              {metrics.totalPetitions > 0 
                ? Math.round(((metrics.totalPetitions - metrics.pendingPetitions) / metrics.totalPetitions) * 100)
                : 0}%
            </Text>
            <Text style={styles.summaryDescription}>
              Peticiones procesadas exitosamente
            </Text>
          </View>
        </View>
      </View>

      {renderAdvisorMetrics()}
      {renderPetitionMetrics()}

      <View style={styles.insightsSection}>
        <Text style={styles.insightsTitle}>Insights</Text>
        <View style={styles.insightsList}>
          <View style={styles.insightItem}>
            <RadixIcons.Info size={16} color="#3B82F6" />
            <Text style={styles.insightText}>
              {metrics.pendingRegistrations > 0 
                ? `${metrics.pendingRegistrations} registros requieren atención inmediata`
                : 'Todos los registros están procesados'
              }
            </Text>
          </View>
          
          <View style={styles.insightItem}>
            <RadixIcons.Info size={16} color="#10B981" />
            <Text style={styles.insightText}>
              {metrics.pendingPetitions > 0 
                ? `${metrics.pendingPetitions} peticiones esperan aprobación`
                : 'Todas las peticiones han sido procesadas'
              }
            </Text>
          </View>
          
          <View style={styles.insightItem}>
            <RadixIcons.Info size={16} color="#F59E0B" />
            <Text style={styles.insightText}>
              {Object.keys(metrics.registrationsByAdvisor).length} asesores activos en el sistema
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  metricsGrid: {
    padding: 16,
    gap: 12,
  },
  metricCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  summarySection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  summaryGrid: {
    gap: 12,
  },
  summaryItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  summaryDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  section: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  advisorList: {
    gap: 8,
  },
  advisorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  advisorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  advisorName: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  advisorStats: {
    alignItems: 'flex-end',
  },
  advisorCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  advisorPercentage: {
    fontSize: 12,
    color: '#6B7280',
  },
  insightsSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  insightsList: {
    gap: 8,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
  },
  insightText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    flex: 1,
  },
}); 