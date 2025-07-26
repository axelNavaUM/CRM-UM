import AlumnoDetail from '@/components/alumnos/AlumnoDetail';
import AlumnosGrid from '@/components/alumnos/AlumnosGrid';
import Button from '@/components/inicio/Button';
import Card from '@/components/inicio/Card';
import RecentActivitiesTable from '@/components/inicio/RecentActivitiesTable';
import AsidePanel from '@/components/ui/AsidePanel';
import BottomSheet from '@/components/ui/BottomSheet';
import { useAuth } from '@/context/AuthContext';
import { Alumno, RegistroAlumnoModel } from '@/models/registroAlumnoModel';
import { supabase } from '@/services/supabase/supaConf';
import { styles } from '@/style/inicio2';
import React, { useEffect, useState } from 'react';
import { FlatList, Text, View, useWindowDimensions } from 'react-native';

interface ListItem {
  id: string;
  type: 'header' | 'cards' | 'buttons' | 'grid' | 'table';
  activities?: any[];
}

const App = () => {
  const { user } = useAuth();
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [total, setTotal] = useState(0);
  const [pendientes, setPendientes] = useState(0);
  const [rol, setRol] = useState<string>('lector');
  const [selectedAlumno, setSelectedAlumno] = useState<Alumno | null>(null);
  const [showAlumnoDetail, setShowAlumnoDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      let userRol = 'lector';
      let asesor_id = null;
      try {
        let usuario = null;
        if (user?.email) {
          // Buscar en usuariosum el rol y el id
          const { data: usuarioData, error: usuarioError } = await supabase
            .from('usuariosum')
            .select('idusuario, idarea')
            .eq('correoinstitucional', user.email)
            .single();
          usuario = usuarioData;
          if (!usuarioError && usuario) {
            asesor_id = usuario.idusuario;
            // Buscar el rol en areas
            if (usuario.idarea) {
              const { data: area, error: areaError } = await supabase
                .from('areas')
                .select('rolarea')
                .eq('idarea', usuario.idarea)
                .single();
              if (!areaError && area) {
                userRol = area.rolarea || 'asesor';
              } else {
                userRol = 'asesor';
              }
            } else {
              userRol = 'asesor';
            }
          } else {
            userRol = 'lector';
          }
        } else {
          setError('No hay usuario autenticado.');
          setAlumnos([]);
          setTotal(0);
          setPendientes(0);
          setIsLoading(false);
          return;
        }
        setRol(userRol);
        if (userRol === 'jefe de ventas') {
          // Jefe de ventas ve todos los pendientes
          const pendientesList = await RegistroAlumnoModel.getAlumnosPorStatus('pendiente');
          setAlumnos(pendientesList);
          setTotal(pendientesList.length);
          setPendientes(pendientesList.length);
        } else if (userRol === 'asesor' && asesor_id) {
          // Asesor ve solo sus alumnos
          const misAlumnos = await RegistroAlumnoModel.getAlumnosPorAsesor(asesor_id);
          setAlumnos(misAlumnos);
          setTotal(misAlumnos.length);
          setPendientes(misAlumnos.filter(a => a.status === 'pendiente').length);
        } else {
          // Lector: puede ver todos los alumnos
          const { data: allAlumnos, error: alumnosError } = await supabase
            .from('alumnos')
            .select('*');
          if (alumnosError) {
            setError('Error al obtener alumnos: ' + alumnosError.message);
            setAlumnos([]);
            setTotal(0);
            setPendientes(0);
          } else {
            setAlumnos(allAlumnos || []);
            setTotal((allAlumnos || []).length);
            setPendientes((allAlumnos || []).filter(a => a.status === 'pendiente').length);
          }
        }
      } catch (err: any) {
        setError('Error al cargar los registros: ' + (err.message || err.toString()));
        setAlumnos([]);
        setTotal(0);
        setPendientes(0);
      }
      setIsLoading(false);
    };
    fetchData();
  }, [user]);

  const handleAlumnoPress = (alumno: Alumno) => {
    setSelectedAlumno(alumno);
    setShowAlumnoDetail(true);
  };

  const handleCloseAlumnoDetail = () => {
    setShowAlumnoDetail(false);
    setSelectedAlumno(null);
  };

  // Adaptar datos para la tabla
  const activities = alumnos.map(a => ({
    id: a.id?.toString() || '',
    activity: a.status === 'pendiente' ? 'Registro Pendiente' : 'Registrado',
    date: a.fecha_alta ? a.fecha_alta.split('T')[0] : '',
    details: `${a.nombre} ${a.apellidos} - ${(a.email || a.id || '')}`,
  }));

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
            <Card title="Registros Creados / Total" value={total.toString()} />
            <Card title="Tareas Pendientes" value={pendientes.toString()} />
          </View>
        );
      case 'buttons':
        // Solo mostrar botones si el usuario es asesor o jefe de ventas
        if (rol === 'asesor' || rol === 'jefe de ventas') {
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
            {error ? (
              <View style={{ padding: 24, alignItems: 'center' }}>
                <Text style={{ color: '#DC2626', fontSize: 16, textAlign: 'center' }}>{error}</Text>
              </View>
            ) : (
              <AlumnosGrid 
                alumnos={alumnos} 
                onAlumnoPress={handleAlumnoPress}
                isLoading={isLoading}
              />
            )}
          </View>
        );
      case 'table':
        return (
          <View style={[styles.content, isMobile && styles.contentMobile]}>
            <RecentActivitiesTable activities={item.activities} />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, isMobile && styles.containerMobile, { backgroundColor: '#FFFFFF' }]}>      
      <FlatList
        data={listData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={isMobile ? { paddingBottom: 120 } : {}}
        style={{ flex: 1 }}
      />

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

export default App;