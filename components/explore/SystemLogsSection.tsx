import { RadixIcons } from '@/components/ui/RadixIcons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface LogEntry {
  id: number;
  tipo: 'login' | 'request' | 'error' | 'warning' | 'failed_login';
  mensaje: string;
  usuario_email?: string;
  ip_address?: string;
  fecha: string;
  detalles?: string;
}

interface SystemLogsSectionProps {
  userRole: string;
}

export const SystemLogsSection: React.FC<SystemLogsSectionProps> = ({ userRole }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLogType, setSelectedLogType] = useState<string>('all');

  useEffect(() => {
    loadLogs();
  }, [selectedLogType]);

  const loadLogs = async () => {
    try {
      setIsLoading(true);
      
      // Simular logs del sistema (en un sistema real, esto vendría de una tabla de logs)
      const mockLogs: LogEntry[] = [
        {
          id: 1,
          tipo: 'login',
          mensaje: 'Inicio de sesión exitoso',
          usuario_email: 'admin@universidad.edu',
          ip_address: '192.168.1.100',
          fecha: new Date().toISOString(),
          detalles: 'Sesión iniciada desde navegador Chrome'
        },
        {
          id: 2,
          tipo: 'request',
          mensaje: 'Solicitud de cambio de carrera creada',
          usuario_email: 'asesor1@universidad.edu',
          ip_address: '192.168.1.101',
          fecha: new Date(Date.now() - 3600000).toISOString(),
          detalles: 'Petición ID: 12345 - Alumno: Juan Pérez'
        },
        {
          id: 3,
          tipo: 'error',
          mensaje: 'Error al procesar documento',
          usuario_email: 'asesor2@universidad.edu',
          ip_address: '192.168.1.102',
          fecha: new Date(Date.now() - 7200000).toISOString(),
          detalles: 'Error 500 - Documento no encontrado'
        },
        {
          id: 4,
          tipo: 'warning',
          mensaje: 'Intento de acceso a área restringida',
          usuario_email: 'usuario@universidad.edu',
          ip_address: '192.168.1.103',
          fecha: new Date(Date.now() - 10800000).toISOString(),
          detalles: 'Acceso denegado a gestión de usuarios'
        },
        {
          id: 5,
          tipo: 'failed_login',
          mensaje: 'Intento fallido de inicio de sesión',
          usuario_email: 'usuario_desconocido@email.com',
          ip_address: '192.168.1.104',
          fecha: new Date(Date.now() - 14400000).toISOString(),
          detalles: 'Contraseña incorrecta - 3 intentos'
        },
        {
          id: 6,
          tipo: 'login',
          mensaje: 'Inicio de sesión exitoso',
          usuario_email: 'coordinador@universidad.edu',
          ip_address: '192.168.1.105',
          fecha: new Date(Date.now() - 18000000).toISOString(),
          detalles: 'Sesión iniciada desde aplicación móvil'
        },
        {
          id: 7,
          tipo: 'request',
          mensaje: 'Petición de cambio de carrera aprobada',
          usuario_email: 'jefe_ventas@universidad.edu',
          ip_address: '192.168.1.106',
          fecha: new Date(Date.now() - 21600000).toISOString(),
          detalles: 'Petición ID: 12344 - Aprobada por Jefe de Ventas'
        },
        {
          id: 8,
          tipo: 'error',
          mensaje: 'Error de conexión a base de datos',
          usuario_email: 'system@universidad.edu',
          ip_address: '192.168.1.107',
          fecha: new Date(Date.now() - 25200000).toISOString(),
          detalles: 'Timeout en consulta de alumnos'
        }
      ];

      // Filtrar logs por tipo seleccionado
      const filteredLogs = selectedLogType === 'all' 
        ? mockLogs 
        : mockLogs.filter(log => log.tipo === selectedLogType);

      setLogs(filteredLogs);
    } catch (error) {
      console.error('Error al cargar logs:', error);
    } finally {
      setIsLoading(false);
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

  const getLogTypeIcon = (tipo: string) => {
    switch (tipo) {
      case 'login':
        return <RadixIcons.Login size={16} color="#10B981" />;
      case 'request':
        return <RadixIcons.FileText size={16} color="#3B82F6" />;
      case 'error':
        return <RadixIcons.Error size={16} color="#EF4444" />;
      case 'warning':
        return <RadixIcons.Warning size={16} color="#F59E0B" />;
      case 'failed_login':
        return <RadixIcons.Lock size={16} color="#DC2626" />;
      default:
        return <RadixIcons.Info size={16} color="#6B7280" />;
    }
  };

  const getLogTypeLabel = (tipo: string) => {
    switch (tipo) {
      case 'login':
        return 'Inicio de Sesión';
      case 'request':
        return 'Solicitud';
      case 'error':
        return 'Error';
      case 'warning':
        return 'Advertencia';
      case 'failed_login':
        return 'Acceso Fallido';
      default:
        return 'Otro';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderLogItem = ({ item }: { item: LogEntry }) => (
    <View style={styles.logCard}>
      <View style={styles.logHeader}>
        <View style={styles.logTypeContainer}>
          {getLogTypeIcon(item.tipo)}
          <Text style={[styles.logTypeText, { color: getLogTypeColor(item.tipo) }]}>
            {getLogTypeLabel(item.tipo)}
          </Text>
        </View>
        <Text style={styles.logDate}>{formatDate(item.fecha)}</Text>
      </View>

      <View style={styles.logContent}>
        <Text style={styles.logMessage}>{item.mensaje}</Text>
        
        {item.usuario_email && (
          <Text style={styles.logUser}>
            Usuario: {item.usuario_email}
          </Text>
        )}
        
        {item.ip_address && (
          <Text style={styles.logIP}>
            IP: {item.ip_address}
          </Text>
        )}
        
        {item.detalles && (
          <Text style={styles.logDetails}>
            {item.detalles}
          </Text>
        )}
      </View>
    </View>
  );

  const renderFilterButton = (type: string, label: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedLogType === type && styles.filterButtonActive
      ]}
      onPress={() => setSelectedLogType(type)}
    >
      <Text style={[
        styles.filterButtonText,
        selectedLogType === type && styles.filterButtonTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1383eb" />
        <Text style={styles.loadingText}>Cargando logs del sistema...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Logs del Sistema</Text>
        <Text style={styles.subtitle}>
          Registro de actividades, errores y eventos del sistema
        </Text>
      </View>

      <View style={styles.filtersContainer}>
        {renderFilterButton('all', 'Todos')}
        {renderFilterButton('login', 'Inicios de Sesión')}
        {renderFilterButton('request', 'Solicitudes')}
        {renderFilterButton('error', 'Errores')}
        {renderFilterButton('warning', 'Advertencias')}
        {renderFilterButton('failed_login', 'Accesos Fallidos')}
      </View>

      {logs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <RadixIcons.FileText size={48} color="#9CA3AF" />
          <Text style={styles.emptyText}>No hay logs disponibles</Text>
        </View>
      ) : (
        <FlatList
          data={logs}
          renderItem={renderLogItem}
          keyExtractor={(item) => item.id.toString()}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  filtersContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    flexWrap: 'wrap',
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
    backgroundColor: '#1383eb',
    borderColor: '#1383eb',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
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
    elevation: 2,
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
    fontWeight: 'bold',
    marginLeft: 6,
  },
  logDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  logContent: {
    gap: 6,
  },
  logMessage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  logUser: {
    fontSize: 12,
    color: '#374151',
  },
  logIP: {
    fontSize: 12,
    color: '#6B7280',
  },
  logDetails: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 4,
  },
}); 