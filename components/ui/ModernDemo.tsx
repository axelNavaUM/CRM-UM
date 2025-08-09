import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import ModernAppLayout from './ModernAppLayout';
import RadixIcons from './RadixIcons';

const ModernDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');

  const handleTabPress = (tabId: string) => {
    setActiveTab(tabId);
    Alert.alert('Navegación', `Navegando a: ${tabId}`);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <ScrollView style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🏠 Inicio</Text>
              <Text style={styles.description}>
                Bienvenido al CRM de la Universidad Milenium. Aquí puedes gestionar alumnos, usuarios y reportes.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📊 Estadísticas Rápidas</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <RadixIcons.Students size={24} color="#3B82F6" />
                  <Text style={styles.statNumber}>1,234</Text>
                  <Text style={styles.statLabel}>Alumnos</Text>
                </View>
                <View style={styles.statCard}>
                  <RadixIcons.Users size={24} color="#10B981" />
                  <Text style={styles.statNumber}>89</Text>
                  <Text style={styles.statLabel}>Usuarios</Text>
                </View>
                <View style={styles.statCard}>
                  <RadixIcons.Reports size={24} color="#F59E0B" />
                  <Text style={styles.statNumber}>45</Text>
                  <Text style={styles.statLabel}>Reportes</Text>
                </View>
                <View style={styles.statCard}>
                  <RadixIcons.Settings size={24} color="#8B5CF6" />
                  <Text style={styles.statNumber}>12</Text>
                  <Text style={styles.statLabel}>Config</Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⚡ Acciones Rápidas</Text>
              <View style={styles.actionsGrid}>
                <TouchableOpacity style={styles.actionCard}>
                  <RadixIcons.Plus size={20} color="#3B82F6" />
                  <Text style={styles.actionText}>Nuevo Alumno</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionCard}>
                  <RadixIcons.Users size={20} color="#10B981" />
                  <Text style={styles.actionText}>Nuevo Usuario</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionCard}>
                  <RadixIcons.Reports size={20} color="#F59E0B" />
                  <Text style={styles.actionText}>Generar Reporte</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionCard}>
                  <RadixIcons.Settings size={20} color="#8B5CF6" />
                  <Text style={styles.actionText}>Configuración</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        );

      case 'students':
        return (
          <ScrollView style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>👨‍🎓 Gestión de Alumnos</Text>
              <Text style={styles.description}>
                Administra la información de los alumnos, sus carreras y documentos.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📋 Acciones de Alumnos</Text>
              <View style={styles.actionsGrid}>
                <TouchableOpacity style={styles.actionCard}>
                  <RadixIcons.Plus size={20} color="#3B82F6" />
                  <Text style={styles.actionText}>Alta Alumno</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionCard}>
                  <RadixIcons.Search size={20} color="#10B981" />
                  <Text style={styles.actionText}>Buscar Alumno</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionCard}>
                  <RadixIcons.Edit size={20} color="#F59E0B" />
                  <Text style={styles.actionText}>Editar Alumno</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionCard}>
                  <RadixIcons.Documents size={20} color="#8B5CF6" />
                  <Text style={styles.actionText}>Documentos</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        );

      case 'users':
        return (
          <ScrollView style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>👥 Gestión de Usuarios</Text>
              <Text style={styles.description}>
                Administra los usuarios del sistema, sus permisos y roles.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🔧 Acciones de Usuarios</Text>
              <View style={styles.actionsGrid}>
                <TouchableOpacity style={styles.actionCard}>
                  <RadixIcons.Plus size={20} color="#3B82F6" />
                  <Text style={styles.actionText}>Nuevo Usuario</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionCard}>
                  <RadixIcons.Search size={20} color="#10B981" />
                  <Text style={styles.actionText}>Buscar Usuario</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionCard}>
                  <RadixIcons.Settings size={20} color="#F59E0B" />
                  <Text style={styles.actionText}>Permisos</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionCard}>
                  <RadixIcons.Team size={20} color="#8B5CF6" />
                  <Text style={styles.actionText}>Roles</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        );

      case 'reports':
        return (
          <ScrollView style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📊 Reportes y Analytics</Text>
              <Text style={styles.description}>
                Genera reportes y visualiza estadísticas del sistema.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📈 Tipos de Reportes</Text>
              <View style={styles.actionsGrid}>
                <TouchableOpacity style={styles.actionCard}>
                  <RadixIcons.Chart size={20} color="#3B82F6" />
                  <Text style={styles.actionText}>Estadísticas</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionCard}>
                  <RadixIcons.Reports size={20} color="#10B981" />
                  <Text style={styles.actionText}>Reportes</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionCard}>
                  <RadixIcons.Analytics size={20} color="#F59E0B" />
                  <Text style={styles.actionText}>Analytics</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionCard}>
                  <RadixIcons.Download size={20} color="#8B5CF6" />
                  <Text style={styles.actionText}>Exportar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        );

      case 'settings':
        return (
          <ScrollView style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⚙️ Configuración</Text>
              <Text style={styles.description}>
                Configura el sistema y personaliza tu experiencia.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🔧 Opciones</Text>
              <View style={styles.actionsGrid}>
                <TouchableOpacity style={styles.actionCard}>
                  <RadixIcons.Profile size={20} color="#3B82F6" />
                  <Text style={styles.actionText}>Mi Perfil</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionCard}>
                  <RadixIcons.Settings size={20} color="#10B981" />
                  <Text style={styles.actionText}>Configuración</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionCard}>
                  <RadixIcons.Security size={20} color="#F59E0B" />
                  <Text style={styles.actionText}>Seguridad</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionCard}>
                  <RadixIcons.Support size={20} color="#8B5CF6" />
                  <Text style={styles.actionText}>Soporte</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        );

      default:
        return (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Página no encontrada</Text>
          </View>
        );
    }
  };

  return (
    <ModernAppLayout
      activeTab={activeTab}
      onTabPress={handleTabPress}
      headerTitle="CRM UM - Demo"
    >
      {renderContent()}
    </ModernAppLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: 120,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: 120,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default ModernDemo; 