import { RadixIcons } from '@/components/ui/RadixIcons';
import { supabase } from '@/services/supabase/supaConf';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

interface StudentWithPendingPayment {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  carrera: string;
  status: string;
  total_pendiente: number;
  numero_pagos: number;
  ultimo_pago?: {
    fecha: string;
    monto: number;
    concepto: string;
  };
  pagos_pendientes: Array<{
    concepto: string;
    monto: number;
    fecha_vencimiento: string;
  }>;
  documentos_pago_faltantes: string[];
}

interface StudentsWithPendingPaymentsSectionProps {
  userRole: string;
}

export const StudentsWithPendingPaymentsSection: React.FC<StudentsWithPendingPaymentsSectionProps> = ({ userRole }) => {
  const [studentsWithPendingPayments, setStudentsWithPendingPayments] = useState<StudentWithPendingPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStudentsWithPendingPayments();
  }, []);

  const loadStudentsWithPendingPayments = async () => {
    try {
      setIsLoading(true);
      
      // Obtener todos los alumnos
      const { data: alumnos, error } = await supabase
        .from('alumnos')
        .select('*')
        .order('nombre', { ascending: true });

      if (error) throw error;

      // Simulación de datos de pagos pendientes (reemplazar con datos reales)
      const mockStudentsWithPayments: StudentWithPendingPayment[] = (alumnos || []).map((alumno, index) => {
        // Simular que algunos alumnos tienen pagos pendientes
        const hasPendingPayments = index % 3 === 0; // 1 de cada 3 alumnos tiene pagos pendientes
        
        if (!hasPendingPayments) {
          return {
            id: alumno.id,
            nombre: alumno.nombre,
            apellidos: alumno.apellidos,
            email: alumno.email,
            carrera: alumno.carrera,
            status: alumno.status,
            total_pendiente: 0,
            numero_pagos: 0,
            pagos_pendientes: [],
            documentos_pago_faltantes: []
          };
        }

        const pendingPayments = [
          {
            concepto: 'Inscripción',
            monto: 2500,
            fecha_vencimiento: '2024-02-15'
          },
          {
            concepto: 'Mensualidad Enero',
            monto: 1800,
            fecha_vencimiento: '2024-01-31'
          }
        ];

        const totalPendiente = pendingPayments.reduce((sum, payment) => sum + payment.monto, 0);

        return {
          id: alumno.id,
          nombre: alumno.nombre,
          apellidos: alumno.apellidos,
          email: alumno.email,
          carrera: alumno.carrera,
          status: alumno.status,
          total_pendiente: totalPendiente,
          numero_pagos: pendingPayments.length,
          ultimo_pago: {
            fecha: '2024-01-10',
            monto: 500,
            concepto: 'Pago parcial'
          },
          pagos_pendientes: pendingPayments,
          documentos_pago_faltantes: ['Comprobante de pago', 'Recibo de inscripción']
        };
      });

      // Filtrar solo alumnos con pagos pendientes
      const filteredStudents = mockStudentsWithPayments.filter(student => student.total_pendiente > 0);

      setStudentsWithPendingPayments(filteredStudents);
    } catch (error) {
      console.error('Error al cargar alumnos con pagos pendientes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'activo':
        return <RadixIcons.Success size={16} color="#10B981" />;
      case 'pendiente':
        return <RadixIcons.Clock size={16} color="#F59E0B" />;
      case 'inactivo':
        return <RadixIcons.Error size={16} color="#EF4444" />;
      default:
        return <RadixIcons.Info size={16} color="#6B7280" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'activo':
        return '#10B981';
      case 'pendiente':
        return '#F59E0B';
      case 'inactivo':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
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
          <Text style={styles.studentCareer}>{item.carrera}</Text>
        </View>
        <View style={styles.studentStatus}>
          {getStatusIcon(item.status)}
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.paymentSection}>
        <View style={styles.paymentHeader}>
          <Text style={styles.paymentTitle}>Pagos Pendientes</Text>
          <Text style={styles.paymentTotal}>
            Total: {formatCurrency(item.total_pendiente)}
          </Text>
        </View>

        <View style={styles.paymentStats}>
          <View style={styles.paymentStat}>
            <Text style={styles.paymentStatNumber}>{item.numero_pagos}</Text>
            <Text style={styles.paymentStatLabel}>Pagos Pendientes</Text>
          </View>
          {item.ultimo_pago && (
            <View style={styles.paymentStat}>
              <Text style={styles.paymentStatNumber}>
                {formatCurrency(item.ultimo_pago.monto)}
              </Text>
              <Text style={styles.paymentStatLabel}>Último Pago</Text>
            </View>
          )}
        </View>

        {item.pagos_pendientes.length > 0 && (
          <View style={styles.pendingPaymentsSection}>
            <Text style={styles.pendingPaymentsTitle}>📋 Pagos Pendientes:</Text>
            {item.pagos_pendientes.map((payment, index) => (
              <View key={index} style={styles.pendingPaymentItem}>
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentConcept}>{payment.concepto}</Text>
                  <Text style={styles.paymentAmount}>{formatCurrency(payment.monto)}</Text>
                </View>
                <Text style={styles.paymentDueDate}>
                  Vence: {formatDate(payment.fecha_vencimiento)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {item.documentos_pago_faltantes.length > 0 && (
          <View style={styles.missingDocsSection}>
            <Text style={styles.missingDocsTitle}>📄 Documentos de Pago Faltantes:</Text>
            {item.documentos_pago_faltantes.map((doc, index) => (
              <Text key={index} style={styles.missingDocItem}>
                • {doc}
              </Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Cargando estudiantes con pagos pendientes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Control de Pagos</Text>
        <Text style={styles.subtitle}>
          Vista para {userRole} - Gestión de pagos estudiantiles
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{studentsWithPendingPayments.length}</Text>
          <Text style={styles.statLabel}>Estudiantes con pagos pendientes</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {formatCurrency(studentsWithPendingPayments.reduce((total, student) => 
              total + student.total_pendiente, 0
            ))}
          </Text>
          <Text style={styles.statLabel}>Total pendiente</Text>
        </View>
      </View>

      {studentsWithPendingPayments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <RadixIcons.Success size={48} color="#10B981" />
          <Text style={styles.emptyText}>¡Excelente! Todos los pagos están al corriente</Text>
          <Text style={styles.emptySubtext}>
            No hay estudiantes con pagos pendientes
          </Text>
        </View>
      ) : (
        <FlatList
          data={studentsWithPendingPayments}
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
    elevation: 3,
  },
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  studentEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  studentCareer: {
    fontSize: 12,
    color: '#6B7280',
  },
  studentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  paymentSection: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  paymentTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  paymentStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  paymentStat: {
    alignItems: 'center',
  },
  paymentStatNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  paymentStatLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  pendingPaymentsSection: {
    marginBottom: 12,
  },
  pendingPaymentsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 8,
  },
  pendingPaymentItem: {
    backgroundColor: '#FEF2F2',
    borderRadius: 6,
    padding: 8,
    marginBottom: 6,
  },
  paymentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  paymentConcept: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  paymentAmount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  paymentDueDate: {
    fontSize: 10,
    color: '#6B7280',
  },
  missingDocsSection: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 8,
  },
  missingDocsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
    marginBottom: 4,
  },
  missingDocItem: {
    fontSize: 12,
    color: '#F59E0B',
    marginLeft: 8,
    marginBottom: 2,
  },
  // Estilos para estadísticas
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#EF4444',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
}); 