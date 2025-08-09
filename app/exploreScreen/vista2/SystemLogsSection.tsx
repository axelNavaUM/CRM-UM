import { RadixIcons } from '@/components/ui/RadixIcons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface LogEntry {
  id: string;
  tipo: 'login' | 'request' | 'error' | 'warning' | 'failed_login';
  mensaje: string;
  usuario: string;
  ip: string;
  fecha: string;
  detalles?: string;
}

interface SystemLogsSectionProps {
  userRole: string;
}

export const SystemLogsSection: React.FC<SystemLogsSectionProps> = ({ userRole }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('todos');
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setIsLoading(true);
      
      // Simulación de logs del sistema (reemplazar con datos reales)
      const mockLogs: LogEntry[] = [
        {
          id: '1',
          tipo: 'login',
          mensaje: 'Inicio de sesión exitoso',
          usuario: 'admin@universidad.edu',
          ip: '192.168.1.100',
          fecha: '2024-01-15T10:30:00Z',
          detalles: 'Sesión iniciada desde navegador Chrome'
        },
        {
          id: '2',
          tipo: 'request',
          mensaje: 'Solicitud de cambio de carrera',
          usuario: 'asesor1@universidad.edu',
          ip: '192.168.1.101',
          fecha: '2024-01-15T11:15:00Z',
          detalles: 'Nueva petición de cambio de carrera para alumno ID: 123'
        },
        {
          id: '3',
          tipo: 'error',
          mensaje: 'Error al procesar documento',
          usuario: 'control@universidad.edu',
          ip: '192.168.1.102',
          fecha: '2024-01-15T12:00:00Z',
          detalles: 'Error al subir documento: Formato no válido'
        },
        {
          id: '4',
          tipo: 'warning',
          mensaje: 'Intento de acceso sin permisos',
          usuario: 'usuario@universidad.edu',
          ip: '192.168.1.103',
          fecha: '2024-01-15T13:45:00Z',
          detalles: 'Intento de acceso a pantalla restringida'
        },
        {
          id: '5',
          tipo: 'failed_login',
          mensaje: 'Intento de inicio de sesión fallido',
          usuario: 'usuario_desconocido@email.com',
          ip: '192.168.1.104',
          fecha: '2024-01-15T14:20:00Z',
          detalles: 'Contraseña incorrecta - 3 intentos consecutivos'
        },
        {
          id: '6',
          tipo: 'login',
          mensaje: 'Inicio de sesión exitoso',
          usuario: 'jefe_ventas@universidad.edu',
          ip: '192.168.1.105',
          fecha: '2024-01-15T15:10:00Z',
          detalles: 'Sesión iniciada desde navegador Firefox'
        },
        {
          id: '7',
          tipo: 'request',
          mensaje: 'Consulta de métricas',
          usuario: 'jefe_ventas@universidad.edu',
          ip: '192.168.1.105',
          fecha: '2024-01-15T15:15:00Z',
          detalles: 'Consulta de métricas de ventas por asesor'
        },
        {
          id: '8',
          tipo: 'error',
          mensaje: 'Error de conexión a base de datos',
          usuario: 'sistema',
          ip: '192.168.1.106',
          fecha: '2024-01-15T16:00:00Z',
          detalles: 'Timeout en conexión a PostgreSQL'
        }
      ];

      setLogs(mockLogs);
    } catch (error) {
      console.error('Error al cargar logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getLogTypeIcon = (tipo: string) => {
    switch (tipo) {
      case 'login':
        return <RadixIcons.Success size={20} color="#10B981" />;
      case 'request':
        return <RadixIcons.Info size={20} color="#3B82F6" />;
      case 'error':
        return <RadixIcons.Error size={20} color="#EF4444" />;
      case 'warning':
        return <RadixIcons.Warning size={20} color="#F59E0B" />;
      case 'failed_login':
        return <RadixIcons.Lock size={20} color="#DC2626" />;
      default:
        return <RadixIcons.Info size={20} color="#6B7280" />;
    }
  };

  const getLogTypeColor = (tipo: string) => {
    switch (tipo) {
      case 'login':
        return '#10B981';
      case 'request':
        return '#3B82F6';
      case 'error':
        return '#EF4444';
      case 'warning':
        return '#F59E0B';
      case 'failed_login':
        return '#DC2626';
      default:
        return '#6B7280';
    }
  };

  const getLogTypeLabel = (tipo: string) => {
    switch (tipo) {
      case 'login':
        return 'Login';
      case 'request':
        return 'Solicitud';
      case 'error':
        return 'Error';
      case 'warning':
        return 'Advertencia';
      case 'failed_login':
        return 'Login Fallido';
      default:
        return 'Otro';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredLogs = logs.filter(log => {
    if (selectedFilter === 'todos') return true;
    return log.tipo === selectedFilter;
  });

  const renderLogItem = ({ item }: { item: LogEntry }) => (
    <TouchableOpacity
      style={styles.logCard}
      onPress={() => setSelectedLog(item)}
    >
      <View style={styles.logHeader}>
        <View style={styles.logTypeContainer}>
          {getLogTypeIcon(item.tipo)}
          <Text style={[styles.logTypeText, { color: getLogTypeColor(item.tipo) }]}>
            {getLogTypeLabel(item.tipo)}
          </Text>
        </View>
        <Text style={styles.dateText}>{formatDate(item.fecha)}</Text>
      </View>

      <Text style={styles.logMessage}>{item.mensaje}</Text>
      
      <View style={styles.logDetails}>
        <Text style={styles.userText}>Usuario: {item.usuario}</Text>
        <Text style={styles.ipText}>IP: {item.ip}</Text>
      </View>

      {item.detalles && (
        <Text style={styles.detailsText}>{item.detalles}</Text>
      )}
    </TouchableOpacity>
  );

  const renderFilterButton = (filter: string, label: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === filter && styles.filterButtonActive
      ]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text style={[
        styles.filterButtonText,
        selectedFilter === filter && styles.filterButtonTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Cargando logs del sistema...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Monitoreo del Sistema</Text>
        <Text style={styles.subtitle}>
          Vista para {userRole} - Logs y actividad del sistema
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{logs.length}</Text>
          <Text style={styles.statLabel}>Total de logs</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {logs.filter(l => l.tipo === 'error').length}
          </Text>
          <Text style={styles.statLabel}>Errores</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {logs.filter(l => l.tipo === 'failed_login').length}
          </Text>
          <Text style={styles.statLabel}>Login fallidos</Text>
        </View>
      </View>

      <View style={styles.filtersContainer}>
        <Text style={styles.filtersLabel}>Filtrar por tipo:</Text>
        <View style={styles.filtersRow}>
          {renderFilterButton('todos', 'Todos')}
          {renderFilterButton('login', 'Login')}
          {renderFilterButton('request', 'Solicitudes')}
          {renderFilterButton('error', 'Errores')}
          {renderFilterButton('warning', 'Advertencias')}
          {renderFilterButton('failed_login', 'Login Fallido')}
        </View>
      </View>

      {filteredLogs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <RadixIcons.Info size={48} color="#6B7280" />
          <Text style={styles.emptyText}>No hay logs disponibles</Text>
          <Text style={styles.emptySubtext}>
            Los logs del sistema aparecerán aquí
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredLogs}
          renderItem={renderLogItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
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
  filtersContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filtersLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
  },
  logCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  logTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logTypeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
  },
  logMessage: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 8,
  },
  logDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  userText: {
    fontSize: 12,
    color: '#6B7280',
  },
  ipText: {
    fontSize: 12,
    color: '#6B7280',
  },
  detailsText: {
    fontSize: 12,
    color: '#EF4444',
    fontStyle: 'italic',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 8,
  },
  // Estilos para estadísticas
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
  },
}); 