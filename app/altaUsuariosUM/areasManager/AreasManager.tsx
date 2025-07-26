import Card from '@/components/inicio/Card';
import AsidePanel from '@/components/ui/AsidePanel';
import BottomSheet from '@/components/ui/BottomSheet';
import { Input } from '@/components/ui/Input';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { useAreas } from '@/hooks/areas/useAreas';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';

interface AreasManagerProps {
  onDataChange?: () => void;
}

export default function AreasManager({ onDataChange }: AreasManagerProps) {
  const {
    areas,
    isLoading,
    error,
    createArea,
    updateArea,
    deleteArea,
    refreshAreas,
    clearError,
    getPermisosDisponibles,
    formatPermisoName
  } = useAreas();

  const [showForm, setShowForm] = useState(false);
  const [editingArea, setEditingArea] = useState<any | null>(null);
  const [form, setForm] = useState<any>({
    nombrearea: '',
    rolarea: '',
    permisos: {
      alta_alumnos: false,
      busqueda: false,
      editar: false,
      leer: false,
      actualizar: false,
      alta_usuarios: false,
      delete: false,
      insert: false,
      select: false,
      update: false,
    }
  });
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const handleInputChange = (key: string, value: string) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  const handlePermisoChange = (permiso: string, value: boolean) => {
    setForm((prev: any) => ({
      ...prev,
      permisos: {
        ...prev.permisos,
        [permiso]: value
      }
    }));
  };

  const handleEditArea = (area: any) => {
    setEditingArea(area);
    setForm({
      nombrearea: area.nombrearea || '',
      rolarea: area.rolarea || '',
      permisos: area.permisos || {
        alta_alumnos: false,
        busqueda: false,
        editar: false,
        leer: false,
        actualizar: false,
        alta_usuarios: false,
        delete: false,
        insert: false,
        select: false,
        update: false,
      }
    });
    setShowForm(true);
  };

  const handleDeleteArea = async (idarea: number) => {
    const result = await deleteArea(idarea);
    if (result.success) {
      onDataChange?.();
    }
  };

  const handleSaveArea = async () => {
    let result;
    if (editingArea) {
      result = await updateArea(editingArea.idarea, form);
    } else {
      result = await createArea(form);
    }
    
    if (result.success) {
      setShowForm(false);
      setEditingArea(null);
      setForm({
        nombrearea: '',
        rolarea: '',
        permisos: {
          alta_alumnos: false,
          busqueda: false,
          editar: false,
          leer: false,
          actualizar: false,
          alta_usuarios: false,
          delete: false,
          insert: false,
          select: false,
          update: false,
        }
      });
      onDataChange?.();
    }
  };

  const handleOpenForm = () => {
    setEditingArea(null);
    setForm({
      nombrearea: '',
      rolarea: '',
      permisos: {
        alta_alumnos: false,
        busqueda: false,
        editar: false,
        leer: false,
        actualizar: false,
        alta_usuarios: false,
        delete: false,
        insert: false,
        select: false,
        update: false,
      }
    });
    setShowForm(true);
  };

  const renderPermisosCheckboxes = () => (
    <View style={{ marginVertical: 8 }}>
      <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Permisos:</Text>
      {Object.entries(form.permisos).map(([permiso, valor]) => (
        <TouchableOpacity
          key={permiso}
          style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}
          onPress={() => handlePermisoChange(permiso, !valor)}
        >
          <Text style={{ flex: 1, textTransform: 'capitalize' }}>
            {formatPermisoName(permiso)}
          </Text>
          <Text style={{ color: valor ? '#0d80f2' : '#aaa' }}>
            {valor ? '✔️' : '❌'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderForm = () => (
    <View style={{ marginVertical: 8 }}>
      <Input 
        placeholder="Nombre del área" 
        value={form.nombrearea} 
        onChangeText={(v: string) => handleInputChange('nombrearea', v)} 
      />
      <Input 
        placeholder="Rol del área" 
        value={form.rolarea} 
        onChangeText={(v: string) => handleInputChange('rolarea', v)} 
      />
      {renderPermisosCheckboxes()}
      <PrimaryButton label={editingArea ? "Actualizar" : "Guardar"} onPress={handleSaveArea} />
      <PrimaryButton label="Cancelar" onPress={() => { setShowForm(false); setEditingArea(null); }} />
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={() => refreshAreas()} style={styles.retryButton}>
          <Text style={styles.retryText}>Intentar de nuevo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- DESKTOP TABLE ---
  const renderTable = () => (
    <View style={styles.table}>
      <View style={styles.tableHeader}>
        <Text style={styles.tableHeaderCell}>Nombre del Área</Text>
        <Text style={styles.tableHeaderCell}>Rol</Text>
        <Text style={styles.tableHeaderCell}>Permisos</Text>
        <Text style={styles.tableHeaderCell}>Acciones</Text>
      </View>
      {areas.map((area) => (
        <View style={styles.tableRow} key={area.idarea}>
          <Text style={styles.tableCell}>{area.nombrearea}</Text>
          <Text style={styles.tableCell}>{area.rolarea}</Text>
          <Text style={styles.tableCell}>
            {area.permisos ? 
              Object.entries(area.permisos)
                .filter(([_, value]) => value)
                .map(([key, _]) => formatPermisoName(key))
                .join(', ') || 'Sin permisos'
              : 'Sin permisos'
            }
          </Text>
          <View style={[styles.tableCell, { flexDirection: 'row' }]}>
            <TouchableOpacity onPress={() => handleEditArea(area)}><Text>✏️</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteArea(area.idarea)}><Text>🗑️</Text></TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );

  // --- MOBILE CARDS ---
  const renderCards = () => (
    <View>
      {areas.map((area) => (
        <Card 
          key={area.idarea} 
          title={area.nombrearea} 
          value={area.rolarea} 
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Gestión de Áreas</Text>
      <Text style={styles.subheader}>Administra áreas, roles y permisos</Text>
      <PrimaryButton label="Añadir Área" onPress={handleOpenForm} />
      {/* Panel aside en desktop, bottom sheet en móvil */}
      {isMobile ? (
        <BottomSheet open={showForm} onClose={() => { setShowForm(false); setEditingArea(null); }}>
          {renderForm()}
        </BottomSheet>
      ) : (
        <AsidePanel open={showForm} onClose={() => { setShowForm(false); setEditingArea(null); }}>
          {renderForm()}
        </AsidePanel>
      )}
      <ScrollView style={styles.content}>
        {isMobile ? renderCards() : renderTable()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  subheader: { fontSize: 16, color: '#555', marginBottom: 16 },
  content: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: 'red', marginBottom: 10 },
  retryButton: { backgroundColor: '#007AFF', padding: 10, borderRadius: 6 },
  retryText: { color: '#fff', fontWeight: 'bold' },
  table: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tableHeaderCell: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
  },
}); 