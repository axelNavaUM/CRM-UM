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

  const calculateConversionRate = (completed: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  const renderMetricCard = (title: string, value: string | number, icon: React.ReactNode, color: string) => (
    <View style={styles.metricCard}>
      <View style={styles.metricHeader}>
        {icon}
        <Text style={styles.metricTitle}>{title}</Text>
      </View>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
    </View>
  );

  const renderAdvisorMetrics = () => {
    const advisorEntries = Object.entries(metrics.registrationsByAdvisor);
    
    if (advisorEntries.length === 0) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Métricas por Asesor</Text>
          <Text style={styles.emptyText}>No hay datos de asesores disponibles</Text>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Métricas por Asesor</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.advisorScroll}>
          {advisorEntries.map(([advisorId, registrations]) => (
            <View key={advisorId} style={styles.advisorCard}>
              <Text style={styles.advisorId}>Asesor {advisorId}</Text>
              <Text style={styles.advisorRegistrations}>{registrations} registros</Text>
              <Text style={styles.advisorPetitions}>
                {metrics.petitionsByAdvisor[advisorId] || 0} peticiones
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderPetitionMetrics = () => {
    const totalPetitions = metrics.totalPetitions;
    const pendingPetitions = metrics.pendingPetitions;
    const completedPetitions = totalPetitions - pendingPetitions;
    const conversionRate = calculateConversionRate(completedPetitions, totalPetitions);

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Métricas de Peticiones</Text>
        <View style={styles.petitionMetrics}>
          <View style={styles.petitionMetric}>
            <Text style={styles.petitionMetricLabel}>Total de Peticiones</Text>
            <Text style={styles.petitionMetricValue}>{totalPetitions}</Text>
          </View>
          <View style={styles.petitionMetric}>
            <Text style={styles.petitionMetricLabel}>Peticiones Completadas</Text>
            <Text style={[styles.petitionMetricValue, { color: '#10B981' }]}>{completedPetitions}</Text>
          </View>
          <View style={styles.petitionMetric}>
            <Text style={styles.petitionMetricLabel}>Peticiones Pendientes</Text>
            <Text style={[styles.petitionMetricValue, { color: '#F59E0B' }]}>{pendingPetitions}</Text>
          </View>
          <View style={styles.petitionMetric}>
            <Text style={styles.petitionMetricLabel}>Tasa de Conversión</Text>
            <Text style={[styles.petitionMetricValue, { color: '#3B82F6' }]}>{conversionRate}%</Text>
          </View>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Cargando métricas de ventas...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Métricas de Ventas</Text>
        <Text style={styles.subtitle}>
          Vista para {userRole} - Dashboard de rendimiento
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
          <RadixIcons.Clock size={24} color="#F59E0B" />,
          '#F59E0B'
        )}
        {renderMetricCard(
          'Total Peticiones',
          metrics.totalPetitions.toString(),
          <RadixIcons.Document size={24} color="#8B5CF6" />,
          '#8B5CF6'
        )}
        {renderMetricCard(
          'Peticiones Pendientes',
          metrics.pendingPetitions.toString(),
          <RadixIcons.AlertCircle size={24} color="#EF4444" />,
          '#EF4444'
        )}
      </View>

      {renderPetitionMetrics()}
      {renderAdvisorMetrics()}

      <View style={styles.summarySection}>
        <Text style={styles.summaryTitle}>Resumen Ejecutivo</Text>
        <View style={styles.summaryContent}>
          <Text style={styles.summaryText}>
            • Total de registros: {metrics.totalRegistrations} estudiantes
          </Text>
          <Text style={styles.summaryText}>
            • Registros pendientes: {metrics.pendingRegistrations} ({calculateConversionRate(metrics.totalRegistrations - metrics.pendingRegistrations, metrics.totalRegistrations)}% completados)
          </Text>
          <Text style={styles.summaryText}>
            • Total de peticiones: {metrics.totalPetitions} solicitudes
          </Text>
          <Text style={styles.summaryText}>
            • Peticiones pendientes: {metrics.pendingPetitions} ({calculateConversionRate(metrics.totalPetitions - metrics.pendingPetitions, metrics.totalPetitions)}% completadas)
          </Text>
          <Text style={styles.summaryText}>
            • Asesores activos: {Object.keys(metrics.registrationsByAdvisor).length}
          </Text>
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
    color: '#1F2937',
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
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  metricCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '48%',
    minWidth: 150,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  advisorScroll: {
    marginBottom: 8,
  },
  advisorCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  advisorId: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  advisorRegistrations: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 2,
  },
  advisorPetitions: {
    fontSize: 12,
    color: '#6B7280',
  },
  petitionMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  petitionMetric: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    minWidth: 120,
    alignItems: 'center',
  },
  petitionMetricLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  petitionMetricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  summarySection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#F8FAFC',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  summaryContent: {
    gap: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
}); 