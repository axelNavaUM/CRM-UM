import { CareerChangePetitionsSection } from '@/app/exploreScreen/vista1/CareerChangePetitionsSection';
import { SystemLogsSection } from '@/app/exploreScreen/vista2/SystemLogsSection';
import { StudentsByGroupsSection } from '@/app/exploreScreen/vista3/StudentsByGroupsSection';
import { StudentsWithMissingDocumentsSection } from '@/app/exploreScreen/vista4/StudentsWithMissingDocumentsSection';
import { StudentsWithPendingPaymentsSection } from '@/app/exploreScreen/vista5/StudentsWithPendingPaymentsSection';
import { SalesMetricsSection } from '@/app/exploreScreen/vista6/SalesMetricsSection';
import { AsesorStudentsSection } from '@/app/exploreScreen/vista7/AsesorStudentsSection';
import AlumnoDetail from '@/components/alumnos/AlumnoDetail';
import Button from '@/components/inicio/Button';
import Card from '@/components/inicio/Card';
import AsidePanel from '@/components/ui/AsidePanel';
import BottomSheet from '@/components/ui/BottomSheet';
import MobileNativeHeaderActions from '@/components/ui/MobileNativeHeaderActions';
import { ScreenAccessControl } from '@/components/ui/ScreenAccessControl';
import { useAuth } from '@/context/AuthContext';
import { useRoleBasedContent } from '@/hooks/permisos/useRoleBasedContent';
import { Alumno } from '@/models/registroAlumnoModel';
import { styles } from '@/style/inicio2';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Text, useWindowDimensions, View } from 'react-native';

interface ListItem {
  id: string;
  type: 'header' | 'cards' | 'buttons' | 'grid' | 'table';
  activities?: any[];
}

const ExploreContent = () => {
  const { user } = useAuth();
  const { content, metrics, isLoading: roleLoading } = useRoleBasedContent();
  const [selectedAlumno, setSelectedAlumno] = useState<Alumno | null>(null);
  const [showAlumnoDetail, setShowAlumnoDetail] = useState(false);
  
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const router = useRouter();

  const RightActions = () => <MobileNativeHeaderActions />;

  console.log('[DEBUG] ExploreContent - user:', user);
  console.log('[DEBUG] ExploreContent - content:', content);
  console.log('[DEBUG] ExploreContent - roleLoading:', roleLoading);

  // Removed old role detection logic - now using useRoleBasedContent hook
  // The role-based content components will handle their own data fetching

  const handleAlumnoPress = (alumno: Alumno) => {
    setSelectedAlumno(alumno);
    setShowAlumnoDetail(true);
  };

  const handleCloseAlumnoDetail = () => {
    setShowAlumnoDetail(false);
    setSelectedAlumno(null);
  };

  // Adaptar datos para la tabla - ahora manejado por los componentes específicos
  const activities: any[] = [];

  // Renderizar contenido basado en el rol del usuario
  const renderRoleBasedContent = () => {
    console.log('[DEBUG] renderRoleBasedContent - roleLoading:', roleLoading);
    console.log('[DEBUG] renderRoleBasedContent - content:', content);
    
    if (roleLoading) {
      console.log('[DEBUG] Mostrando loading...');
      return (
        <View style={[styles.content, isMobile && styles.contentMobile, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ fontSize: 16, color: '#6B7280' }}>Cargando contenido...</Text>
        </View>
      );
    }

    // Contenido para Asesor (nueva vista)
    if (content.showAsesorStudents) {
      console.log('[DEBUG] Renderizando AsesorStudentsSection');
      return <AsesorStudentsSection userRole={content.role} />;
    }

    // Contenido para Asesor del área Ventas
    if (content.showCareerChangePetitions) {
      console.log('[DEBUG] Renderizando CareerChangePetitionsSection');
      return <CareerChangePetitionsSection userRole={content.role} />;
    }

    // Contenido para Super SU y Administrador
    if (content.showLogs) {
      console.log('[DEBUG] Renderizando SystemLogsSection');
      return <SystemLogsSection userRole={content.role} />;
    }

    // Contenido para Coordinador
    if (content.showStudentsByGroups) {
      console.log('[DEBUG] Renderizando StudentsByGroupsSection');
      return <StudentsByGroupsSection userRole={content.role} />;
    }

    // Contenido para Control Escolar
    if (content.showStudentsWithMissingDocuments) {
      console.log('[DEBUG] Renderizando StudentsWithMissingDocumentsSection');
      return <StudentsWithMissingDocumentsSection userRole={content.role} />;
    }

    // Contenido para Caja
    if (content.showStudentsWithPendingPayments) {
      console.log('[DEBUG] Renderizando StudentsWithPendingPaymentsSection');
      return <StudentsWithPendingPaymentsSection userRole={content.role} />;
    }

    // Contenido para Jefe de Ventas (incluye métricas + contenido por defecto)
    if (content.showMetrics) {
      console.log('[DEBUG] Renderizando SalesMetricsSection');
      return (
        <View style={{ flex: 1 }}>
          <SalesMetricsSection userRole={content.role} metrics={metrics} />
          {content.showDefaultContent && (
            <View style={{ borderTopWidth: 1, borderTopColor: '#E5E7EB' }}>
              {renderDefaultContent()}
            </View>
          )}
        </View>
      );
    }

    // Contenido por defecto para Asesor y otros roles
    if (content.showDefaultContent) {
      console.log('[DEBUG] Renderizando contenido por defecto');
      return renderDefaultContent();
    }
    console.log('[DEBUG] No se cumplió ninguna condición, mostrando mensaje de error');
    return (
      <View style={[styles.content, isMobile && styles.contentMobile, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 16, color: '#6B7280' }}>No hay contenido disponible para tu rol</Text>
      </View>
    );
  };

  const renderDefaultContent = () => {
    // Datos para FlatList
    const listData: ListItem[] = [
      { id: 'header', type: 'header' },
      { id: 'cards', type: 'cards' },
      { id: 'buttons', type: 'buttons' },
      { id: 'grid', type: 'grid' },
      { id: 'table', type: 'table', activities }
    ];

    const renderItem = ({ item }: { item: ListItem }) => {
      switch (item.type) {
        case 'header':
          return (
            <View style={[styles.content, isMobile && styles.contentMobile]}>
              <Card title="Registros Creados / Total" value="0" />
              <Card title="Tareas Pendientes" value="0" />
            </View>
          );
        case 'buttons':
          // Solo mostrar botones si el usuario es asesor o jefe de ventas
          if (content.role === 'asesor' || content.role === 'jefe de ventas') {
            return (
              <View style={[styles.content, isMobile && styles.contentMobile]}>
                <Button title="Alta de Estudiante" onPress={() => {}} bgColor="#1383eb" textColor="#fff" />
                <Button title="Cambio de carrera" onPress={() => {}} bgColor="#e7edf3" textColor="#0d151b" />
              </View>
            );
          }
          return null;
        case 'grid':
          return (
            <View style={[styles.content, isMobile && styles.contentMobile]}>
              <View style={{ padding: 24, alignItems: 'center' }}>
                <Text style={{ color: '#6B7280', fontSize: 16, textAlign: 'center' }}>
                  Contenido manejado por componentes específicos por rol
                </Text>
              </View>
            </View>
          );
        case 'table':
          return (
            <View style={[styles.content, isMobile && styles.contentMobile]}>
              <View style={{ padding: 24, alignItems: 'center' }}>
                <Text style={{ color: '#6B7280', fontSize: 16, textAlign: 'center' }}>
                  Tabla de actividades manejada por componentes específicos por rol
                </Text>
              </View>
            </View>
          );
        default:
          return null;
      }
    };

    return (
      <FlatList
        data={listData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={isMobile ? { paddingBottom: 120 } : {}}
        style={{ flex: 1 }}
      />
    );
  };

  return (
    <View style={[styles.container, isMobile && styles.containerMobile, { backgroundColor: '#FFFFFF' }]}>
      {renderRoleBasedContent()}

      {/* Panel/BottomSheet para detalle del alumno */}
      {selectedAlumno && (
        isMobile ? (
          <BottomSheet 
            open={showAlumnoDetail} 
            onClose={handleCloseAlumnoDetail}
            height="95%"
          >
            <AlumnoDetail 
              alumno={selectedAlumno} 
              onClose={handleCloseAlumnoDetail}
              user={user}
            />
          </BottomSheet>
        ) : (
          <AsidePanel 
            open={showAlumnoDetail} 
            onClose={handleCloseAlumnoDetail}
          >
            <AlumnoDetail 
              alumno={selectedAlumno} 
              onClose={handleCloseAlumnoDetail}
              user={user}
            />
          </AsidePanel>
        )
      )}
    </View>
  );
};

const Explore = () => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  // Shadow RightActions for header options
  const Right = () => <MobileNativeHeaderActions />;

  return (
    <>
      {isMobile && (
        <Stack.Screen options={{ headerShown: false }} />
      )}
      <ScreenAccessControl requiredScreen="explore" fallbackScreen="/(tabs)/notificaciones">
        <ExploreContent />
      </ScreenAccessControl>
    </>
  );
};

export default Explore;