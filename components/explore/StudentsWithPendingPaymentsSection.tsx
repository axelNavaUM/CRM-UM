import { RadixIcons } from '@/components/ui/RadixIcons';
import { supabase } from '@/services/supabase/supaConf';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

interface StudentWithPendingPayment {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  status: string;
  fecha_alta: string;
  pagos_pendientes: number;
  monto_pendiente: number;
  ultimo_pago?: {
    fecha: string;
    monto: number;
    status: string;
  };
}

interface StudentsWithPendingPaymentsSectionProps {
  userRole: string;
}

export const StudentsWithPendingPaymentsSection: React.FC<StudentsWithPendingPaymentsSectionProps> = ({ userRole }) => {
  const [students, setStudents] = useState<StudentWithPendingPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStudentsWithPendingPayments();
  }, []);

  const loadStudentsWithPendingPayments = async () => {
    try {
      setIsLoading(true);
      
      // Obtener todos los alumnos
      const { data: allStudents, error } = await supabase
        .from('alumnos')
        .select('*')
        .order('fecha_alta', { ascending: false });

      if (error) throw error;

      // Simular datos de pagos (en un sistema real, esto vendría de una tabla de pagos)
      const studentsWithPayments = (allStudents || []).map((student) => {
        // Simular pagos pendientes para algunos estudiantes
        const hasPendingPayments = Math.random() > 0.6; // 40% de estudiantes tienen pagos pendientes
        
        if (hasPendingPayments) {
          const pendingAmount = Math.floor(Math.random() * 5000) + 1000; // $1000-$6000
          const pendingPayments = Math.floor(Math.random() * 3) + 1; // 1-3 pagos pendientes
          
          return {
            ...student,
            pagos_pendientes: pendingPayments,
            monto_pendiente: pendingAmount,
            ultimo_pago: {
              fecha: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
              monto: Math.floor(Math.random() * 2000) + 500,
              status: Math.random() > 0.5 ? 'autorizado' : 'pendiente'
            }
          };
        } else {
          return {
            ...student,
            pagos_pendientes: 0,
            monto_pendiente: 0,
            ultimo_pago: {
              fecha: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
              monto: Math.floor(Math.random() * 2000) + 500,
              status: 'autorizado'
            }
          };
        }
      });

      // Filtrar solo estudiantes con pagos pendientes
      const filteredStudents = studentsWithPayments.filter(
        student => student.pagos_pendientes > 0 || student.monto_pendiente > 0
      );

      setStudents(filteredStudents);
    } catch (error) {
      console.error('Error al cargar estudiantes con pagos pendientes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'autorizado':
        return '#10B981';
      case 'pendiente':
        return '#F59E0B';
      case 'rechazado':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'autorizado':
        return <RadixIcons.Success size={16} color="#10B981" />;
      case 'pendiente':
        return <RadixIcons.Warning size={16} color="#F59E0B" />;
      case 'rechazado':
        return <RadixIcons.Error size={16} color="#EF4444" />;
      default:
        return <RadixIcons.Info size={16} color="#6B7280" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStudentItem = ({ item }: { item: StudentWithPendingPayment }) => (
    <View style={styles.studentCard}>
      <View style={styles.studentHeader}>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>
            {item.nombre} {item.apellidos}
          </Text>
          <Text style={styles.studentEmail}>{item.email}</Text>
        </View>
        <View style={styles.paymentStatus}>
          <Text style={styles.pendingAmount}>
            {formatCurrency(item.monto_pendiente)}
          </Text>
          <Text style={styles.pendingPayments}>
            {item.pagos_pendientes} pago(s) pendiente(s)
          </Text>
        </View>
      </View>

      <View style={styles.paymentDetails}>
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Monto Pendiente:</Text>
          <Text style={styles.paymentValue}>
            {formatCurrency(item.monto_pendiente)}
          </Text>
        </View>
        
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Pagos Pendientes:</Text>
          <Text style={styles.paymentValue}>
            {item.pagos_pendientes}
          </Text>
        </View>

        {item.ultimo_pago && (
          <View style={styles.lastPaymentSection}>
            <Text style={styles.lastPaymentTitle}>Último Pago:</Text>
            <View style={styles.lastPaymentInfo}>
              <View style={styles.lastPaymentRow}>
                <Text style={styles.lastPaymentLabel}>Fecha:</Text>
                <Text style={styles.lastPaymentValue}>
                  {formatDate(item.ultimo_pago.fecha)}
                </Text>
              </View>
              <View style={styles.lastPaymentRow}>
                <Text style={styles.lastPaymentLabel}>Monto:</Text>
                <Text style={styles.lastPaymentValue}>
                  {formatCurrency(item.ultimo_pago.monto)}
                </Text>
              </View>
              <View style={styles.lastPaymentRow}>
                <Text style={styles.lastPaymentLabel}>Estado:</Text>
                <View style={styles.statusContainer}>
                  {getStatusIcon(item.ultimo_pago.status)}
                  <Text style={[styles.statusText, { color: getStatusColor(item.ultimo_pago.status) }]}>
                    {item.ultimo_pago.status}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.dateText}>
          Registro: {formatDate(item.fecha_alta)}
        </Text>
        <View style={styles.priorityContainer}>
          <RadixIcons.Warning size={14} color="#F59E0B" />
          <Text style={styles.priorityText}>
            {item.monto_pendiente > 3000 ? 'Alta Prioridad' : 'Prioridad Normal'}
          </Text>
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1383eb" />
        <Text style={styles.loadingText}>Cargando estudiantes con pagos pendientes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Estudiantes con Pagos Pendientes</Text>
        <Text style={styles.subtitle}>
          Control de pagos y cobranza
        </Text>
      </View>

      {students.length === 0 ? (
        <View style={styles.emptyContainer}>
          <RadixIcons.Success size={48} color="#10B981" />
          <Text style={styles.emptyText}>
            ¡Excelente! No hay estudiantes con pagos pendientes
          </Text>
        </View>
      ) : (
        <FlatList
          data={students}
          renderItem={renderStudentItem}
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
    color: '#10B981',
    textAlign: 'center',
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
  },
  studentCard: {
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
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  studentEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  paymentStatus: {
    alignItems: 'flex-end',
  },
  pendingAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#EF4444',
    marginBottom: 2,
  },
  pendingPayments: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '500',
  },
  paymentDetails: {
    marginBottom: 12,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  lastPaymentSection: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  lastPaymentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  lastPaymentInfo: {
    gap: 6,
  },
  lastPaymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastPaymentLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  lastPaymentValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#111827',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
    marginLeft: 4,
  },
}); 