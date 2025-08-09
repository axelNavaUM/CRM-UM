import { ProcedureDocumentation } from '@/scripts/get-procedures';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface StoredProcedure {
  routine_name: string;
  routine_type: string;
  data_type: string;
  routine_definition?: string;
}

interface Trigger {
  trigger_name: string;
  event_manipulation: string;
  action_statement: string;
  action_timing: string;
}

const ProcedureDocumentationComponent: React.FC = () => {
  const [procedures, setProcedures] = useState<StoredProcedure[]>([]);
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [documentation, setDocumentation] = useState<string>('');

  const handleGetProcedures = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 Obteniendo stored procedures...');
      const proceduresData = await ProcedureDocumentation.getStoredProcedures();
      setProcedures(proceduresData);
      
      const triggersData = await ProcedureDocumentation.getTriggers();
      setTriggers(triggersData);
      
      Alert.alert(
        '✅ Éxito',
        `Encontrados:\n- ${proceduresData.length} stored procedures\n- ${triggersData.length} triggers`
      );
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('❌ Error', 'No se pudieron obtener los stored procedures');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateDocumentation = async () => {
    setIsLoading(true);
    try {
      console.log('📚 Generando documentación...');
      const docs = await ProcedureDocumentation.generateDocumentation();
      setDocumentation(docs);
      
      Alert.alert('✅ Éxito', 'Documentación generada correctamente');
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('❌ Error', 'No se pudo generar la documentación');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowSummary = async () => {
    try {
      await ProcedureDocumentation.showSummary();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Documentación de Base de Datos</Text>
        <Text style={styles.headerSubtitle}>Stored Procedures y Triggers</Text>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleGetProcedures}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? '🔍 Consultando...' : '🔍 Obtener Stored Procedures'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleShowSummary}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>📊 Mostrar Resumen</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.successButton]}
          onPress={handleGenerateDocumentation}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? '📚 Generando...' : '📚 Generar Documentación'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Resumen */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Resumen</Text>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryText}>
            Stored Procedures: {procedures.length}
          </Text>
          <Text style={styles.summaryText}>
            Triggers: {triggers.length}
          </Text>
        </View>
      </View>

      {/* Stored Procedures */}
      {procedures.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Stored Procedures</Text>
          {procedures.map((proc, index) => (
            <View key={index} style={styles.procedureCard}>
              <Text style={styles.procedureName}>{proc.routine_name}</Text>
              <Text style={styles.procedureType}>
                Tipo: {proc.routine_type} | Retorna: {proc.data_type}
              </Text>
              {proc.routine_definition && (
                <Text style={styles.procedureCode} numberOfLines={3}>
                  {proc.routine_definition}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Triggers */}
      {triggers.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Triggers</Text>
          {triggers.map((trigger, index) => (
            <View key={index} style={styles.triggerCard}>
              <Text style={styles.triggerName}>{trigger.trigger_name}</Text>
              <Text style={styles.triggerDetails}>
                Evento: {trigger.event_manipulation} | Timing: {trigger.action_timing}
              </Text>
              <Text style={styles.triggerAction} numberOfLines={2}>
                {trigger.action_statement}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Documentación */}
      {documentation && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📄 Documentación Generada</Text>
          <View style={styles.documentationCard}>
            <Text style={styles.documentationText} numberOfLines={20}>
              {documentation}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Usa los botones arriba para consultar y generar documentación
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#3B82F6',
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 4,
    opacity: 0.9,
  },
  actionsContainer: {
    padding: 20,
    gap: 12,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
  },
  secondaryButton: {
    backgroundColor: '#6B7280',
  },
  successButton: {
    backgroundColor: '#10B981',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  procedureCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  procedureName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  procedureType: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  procedureCode: {
    fontSize: 10,
    color: '#374151',
    fontFamily: 'monospace',
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderRadius: 4,
  },
  triggerCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  triggerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  triggerDetails: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  triggerAction: {
    fontSize: 10,
    color: '#374151',
    fontFamily: 'monospace',
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderRadius: 4,
  },
  documentationCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  documentationText: {
    fontSize: 12,
    color: '#374151',
    lineHeight: 18,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default ProcedureDocumentationComponent; 