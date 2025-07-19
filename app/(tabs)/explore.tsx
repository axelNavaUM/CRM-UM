import Button from '@/components/inicio/Button';
import Card from '@/components/inicio/Card';
import Header from '@/components/inicio/Header';
import RecentActivitiesTable from '@/components/inicio/RecentActivitiesTable';
import { useAuth } from '@/context/AuthContext';
import { Alumno, RegistroAlumnoModel } from '@/models/registroAlumnoModel';
import { supabase } from '@/services/supabase/supaConf';
import { styles } from '@/style/inicio2';
import React, { useEffect, useState } from 'react';
import { Dimensions, FlatList, View } from 'react-native';

interface ListItem {
  id: string;
  type: 'header' | 'cards' | 'buttons' | 'table';
  activities?: any[];
}

const App = () => {
  const { user } = useAuth();
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [total, setTotal] = useState(0);
  const [pendientes, setPendientes] = useState(0);
  const [rol, setRol] = useState<string>('asesor');
  const isMobile = Dimensions.get('window').width < 768;

  useEffect(() => {
    const fetchData = async () => {
      let userRol = 'asesor';
      let asesor_id = null;
      if (user?.email) {
        // Buscar en usuariosum el rol y el id
        const { data: usuario } = await supabase
          .from('usuariosum')
          .select('idusuario, idarea')
          .eq('correoinstitucional', user.email)
          .single();
        asesor_id = usuario?.idusuario;
        // Buscar el rol en areas
        if (usuario?.idarea) {
          const { data: area } = await supabase
            .from('areas')
            .select('rolarea')
            .eq('idarea', usuario.idarea)
            .single();
          userRol = area?.rolarea || 'asesor';
        }
      }
      setRol(userRol);
      if (userRol === 'jefe de ventas') {
        // Jefe de ventas ve todos los pendientes
        const pendientesList = await RegistroAlumnoModel.getAlumnosPorStatus('pendiente');
        setAlumnos(pendientesList);
        setTotal(pendientesList.length);
        setPendientes(pendientesList.length);
      } else if (asesor_id) {
        // Asesor ve solo sus alumnos
        const misAlumnos = await RegistroAlumnoModel.getAlumnosPorAsesor(asesor_id);
        setAlumnos(misAlumnos);
        setTotal(misAlumnos.length);
        setPendientes(misAlumnos.filter(a => a.status === 'pendiente').length);
      }
    };
    fetchData();
  }, [user]);

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
        return (
          <View style={[styles.content, isMobile && styles.contentMobile]}>
            <Button title="Alta de Estudiante" onPress={() => {}} bgColor="#1383eb" textColor="#fff" />
            <Button title="Cambio de carrera" onPress={() => {}} bgColor="#e7edf3" textColor="#0d151b" />
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
    <View style={[styles.container, isMobile && styles.containerMobile]}>
      <Header darkMode={false} notificationCount={pendientes} />
      <FlatList
        data={listData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={isMobile ? { paddingBottom: 120 } : {}}
        style={{ flex: 1 }}
      />
    </View>
  );
};
export default App;