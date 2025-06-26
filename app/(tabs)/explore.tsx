import React from 'react';
import { SafeAreaView, ScrollView } from 'react-native';
import Header from '@/components/inicio/Header';
import Card from '@/components/inicio/Card';
import Button from '@/components/inicio/Button';
import RecentActivitiesTable from '@/components/inicio/RecentActivitiesTable';
import { styles } from '@/style/inicio2';
const App = () => {
  const activities = [
    { id: '1', activity: 'Nuevo Estuadiante', date: '2025-09-15', details: 'Axel Nava registrado correctamente en ING. en Sistemas.' },
    { id: '2', activity: 'Cambio de Carrera Aprobado', date: '2025-09-14', details: 'Luis - Solicitud de cambio ING en Sistemas a Psicologia.' },
    //-- Ejemplos de datos, se deben casmbiar por datos obtenidos por BD SUPABASE 
    //-- Creacion de Modelo Vista y Controlador HOOKS intermediarios de VISTA Y CONTROLADOR junto con Store Zustand para manejo de datos
  ];
  return (
    <SafeAreaView style={styles.container}>
       <Header title="Inicio" notificationCount={3} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card title="Registros Creados / Mensual" value="350" />
        <Card title="Total de Registros por Carrera" value="25" />
        <Card title="Tareas Pendientes" value="5" />
        <Button title="Alta de Estudiante" onPress={() => {}} bgColor="#1383eb" textColor="#fff" />
        <Button title="Cambio de carrera" onPress={() => {}} bgColor="#e7edf3" textColor="#0d151b" />
        <RecentActivitiesTable activities={activities} />
      </ScrollView>
    </SafeAreaView>
  );
};
export default App;