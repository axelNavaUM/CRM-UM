import Card from '@/components/inicio/Card';
import AsidePanel from '@/components/ui/AsidePanel';
import BottomSheet from '@/components/ui/BottomSheet';
import { Input } from '@/components/ui/Input';
import PrimaryButton from '@/components/ui/PrimaryButton';
import TabNavigation, { TabItem } from '@/components/ui/TabNavigation';
import { useAreas } from '@/hooks/areas/useAreas';
import { usePermisos } from '@/hooks/permisos/usePermisos';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';

const tabs: TabItem[] = [
  {
    id: 'permisos',
    label: 'Permisos',
    icon: '🔐'
  },
  {
    id: 'politicas',
    label: 'Políticas RLS',
    icon: '🛡️'
  },
  {
    id: 'roles',
    label: 'Roles y Permisos',
    icon: '👥'
  },
  {
    id: 'areas',
    label: 'Áreas y Permisos',
    icon: '📊'
  }
];

export default function PermisosManager() {
  const {
    permisos,
    politicasRLS,
    areasConPermisos,
    isLoading,
    error,
    createPermiso,
    updatePermiso,
    deletePermiso,
    createPoliticaRLS,
    updatePoliticaRLS,
    deletePoliticaRLS,
    refreshPermisos,
    refreshPoliticasRLS,
    refreshAreasConPermisos,
    clearError,
    getTiposPermiso,
    getTablasDisponibles,
    formatTipoPermiso,
    generatePoliticaRLSExample,
    updateArea
  } = usePermisos();

  const { areas } = useAreas();

  const [activeTab, setActiveTab] = useState('permisos');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [form, setForm] = useState<any>({
    nombre: '',
    descripcion: '',
    tipo: 'pantalla',
    area_id: '',
    activo: true,
    tabla: '',
    politica: ''
  });

  // Estado para editar permisos de roles
  const [editingRoles, setEditingRoles] = useState<Record<number, Record<string, boolean>>>({});
  const [savingRole, setSavingRole] = useState<number | null>(null);

  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  // Inicializar permisos de roles para edición
  const initializeRolePermissions = (area: any) => {
    if (!editingRoles[area.idarea]) {
      const defaultPermisos = {
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
      };
      
      // Combinar con permisos existentes
      const existingPermisos = area.permisos || {};
      const combinedPermisos = { ...defaultPermisos, ...existingPermisos };
      
      setEditingRoles(prev => ({
        ...prev,
        [area.idarea]: combinedPermisos
      }));
    }
  };

  const handleRolePermissionChange = (areaId: number, permiso: string, value: boolean) => {
    setEditingRoles(prev => ({
      ...prev,
      [areaId]: {
        ...prev[areaId],
        [permiso]: value
      }
    }));
  };

  const handleSaveRolePermissions = async (areaId: number) => {
    setSavingRole(areaId);
    try {
      const permisosToUpdate = editingRoles[areaId];
      await updateArea(areaId, { permisos: permisosToUpdate });
      setSavingRole(null);
      refreshAreasConPermisos();
    } catch (error) {
      setSavingRole(null);
      console.error('Error al guardar permisos:', error);
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleEditItem = (item: any, type: 'permiso' | 'politica') => {
    setEditingItem({ ...item, type });
    setForm({
      nombre: item.nombre || '',
      descripcion: item.descripcion || '',
      tipo: item.tipo || 'pantalla',
      area_id: item.area_id?.toString() || '',
      activo: item.activo !== undefined ? item.activo : true,
      tabla: item.tabla || '',
      politica: item.politica || ''
    });
    setShowForm(true);
  };

  const handleDeleteItem = async (id: number, type: 'permiso' | 'politica') => {
    let result;
    if (type === 'permiso') {
      result = await deletePermiso(id);
    } else {
      result = await deletePoliticaRLS(id);
    }
    
    if (result.success) {
      if (type === 'permiso') {
        refreshPermisos();
      } else {
        refreshPoliticasRLS();
      }
    }
  };

  const handleSaveItem = async () => {
    let result;
    
    if (editingItem?.type === 'permiso') {
      const permisoData = {
        nombre: form.nombre,
        descripcion: form.descripcion,
        tipo: form.tipo,
        area_id: parseInt(form.area_id),
        activo: form.activo
      };

      if (editingItem.id) {
        result = await updatePermiso(editingItem.id, permisoData);
      } else {
        result = await createPermiso(permisoData);
      }
    } else {
      const politicaData = {
        nombre: form.nombre,
        tabla: form.tabla,
        politica: form.politica,
        area_id: parseInt(form.area_id),
        activo: form.activo
      };

      if (editingItem?.id) {
        result = await updatePoliticaRLS(editingItem.id, politicaData);
      } else {
        result = await createPoliticaRLS(politicaData);
      }
    }

    if (result.success) {
      setShowForm(false);
      setEditingItem(null);
      setForm({
        nombre: '',
        descripcion: '',
        tipo: 'pantalla',
        area_id: '',
        activo: true,
        tabla: '',
        politica: ''
      });
      
      if (editingItem?.type === 'permiso') {
        refreshPermisos();
      } else {
        refreshPoliticasRLS();
      }
    }
  };

  const handleOpenForm = (type: 'permiso' | 'politica') => {
    setEditingItem({ type });
    setForm({
      nombre: '',
      descripcion: '',
      tipo: 'pantalla',
      area_id: '',
      activo: true,
      tabla: '',
      politica: ''
    });
    setShowForm(true);
  };

  const renderPermisoForm = () => (
    <View style={{ marginVertical: 8 }}>
      <Input 
        placeholder="Nombre del permiso" 
        value={form.nombre} 
        onChangeText={(v: string) => handleInputChange('nombre', v)} 
      />
      <Input 
        placeholder="Descripción" 
        value={form.descripcion} 
        onChangeText={(v: string) => handleInputChange('descripcion', v)} 
      />
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Tipo:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {getTiposPermiso().map((tipo) => (
            <TouchableOpacity
              key={tipo}
              style={[styles.optionButton, form.tipo === tipo && styles.selectedOption]}
              onPress={() => handleInputChange('tipo', tipo)}
            >
              <Text style={[styles.optionText, form.tipo === tipo && styles.selectedOptionText]}>
                {formatTipoPermiso(tipo)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Área:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {areas.map((area) => (
            <TouchableOpacity
              key={area.idarea}
              style={[styles.optionButton, form.area_id === area.idarea.toString() && styles.selectedOption]}
              onPress={() => handleInputChange('area_id', area.idarea.toString())}
            >
              <Text style={[styles.optionText, form.area_id === area.idarea.toString() && styles.selectedOptionText]}>
                {area.nombrearea}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => handleInputChange('activo', (!form.activo).toString())}
      >
        <Text style={styles.checkboxText}>Activo</Text>
        <Text style={styles.checkboxIcon}>{form.activo ? '✅' : '❌'}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPoliticaForm = () => (
    <View style={{ marginVertical: 8 }}>
      <Input 
        placeholder="Nombre de la política" 
        value={form.nombre} 
        onChangeText={(v: string) => handleInputChange('nombre', v)} 
      />
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Tabla:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {getTablasDisponibles().map((tabla) => (
            <TouchableOpacity
              key={tabla}
              style={[styles.optionButton, form.tabla === tabla && styles.selectedOption]}
              onPress={() => handleInputChange('tabla', tabla)}
            >
              <Text style={[styles.optionText, form.tabla === tabla && styles.selectedOptionText]}>
                {tabla}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <Input 
        placeholder="Política SQL" 
        value={form.politica} 
        onChangeText={(v: string) => handleInputChange('politica', v)} 
        multiline
        numberOfLines={4}
      />
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Área:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {areas.map((area) => (
            <TouchableOpacity
              key={area.idarea}
              style={[styles.optionButton, form.area_id === area.idarea.toString() && styles.selectedOption]}
              onPress={() => handleInputChange('area_id', area.idarea.toString())}
            >
              <Text style={[styles.optionText, form.area_id === area.idarea.toString() && styles.selectedOptionText]}>
                {area.nombrearea}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => handleInputChange('activo', (!form.activo).toString())}
      >
        <Text style={styles.checkboxText}>Activo</Text>
        <Text style={styles.checkboxIcon}>{form.activo ? '✅' : '❌'}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderForm = () => (
    <View style={{ marginVertical: 8 }}>
      {editingItem?.type === 'politica' ? renderPoliticaForm() : renderPermisoForm()}
      <PrimaryButton 
        label={editingItem?.id ? "Actualizar" : "Guardar"} 
        onPress={handleSaveItem} 
      />
      <PrimaryButton 
        label="Cancelar" 
        onPress={() => { setShowForm(false); setEditingItem(null); }} 
      />
    </View>
  );

  const renderPermisosTable = () => (
    <View style={styles.table}>
      <View style={styles.tableHeader}>
        <Text style={styles.tableHeaderCell}>Nombre</Text>
        <Text style={styles.tableHeaderCell}>Tipo</Text>
        <Text style={styles.tableHeaderCell}>Área</Text>
        <Text style={styles.tableHeaderCell}>Estado</Text>
        <Text style={styles.tableHeaderCell}>Acciones</Text>
      </View>
      {permisos.map((permiso) => (
        <View style={styles.tableRow} key={permiso.id}>
          <Text style={styles.tableCell}>{permiso.nombre}</Text>
          <Text style={styles.tableCell}>{formatTipoPermiso(permiso.tipo)}</Text>
          <Text style={styles.tableCell}>
            {areas.find(a => a.idarea === permiso.area_id)?.nombrearea || 'N/A'}
          </Text>
          <Text style={styles.tableCell}>{permiso.activo ? 'Activo' : 'Inactivo'}</Text>
          <View style={[styles.tableCell, { flexDirection: 'row' }]}>
            <TouchableOpacity onPress={() => handleEditItem(permiso, 'permiso')}>
              <Text>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteItem(permiso.id, 'permiso')}>
              <Text>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );

  const renderPoliticasTable = () => (
    <View style={styles.table}>
      <View style={styles.tableHeader}>
        <Text style={styles.tableHeaderCell}>Nombre</Text>
        <Text style={styles.tableHeaderCell}>Tabla</Text>
        <Text style={styles.tableHeaderCell}>Área</Text>
        <Text style={styles.tableHeaderCell}>Estado</Text>
        <Text style={styles.tableHeaderCell}>Acciones</Text>
      </View>
      {politicasRLS.map((politica) => (
        <View style={styles.tableRow} key={politica.id}>
          <Text style={styles.tableCell}>{politica.nombre}</Text>
          <Text style={styles.tableCell}>{politica.tabla}</Text>
          <Text style={styles.tableCell}>
            {areas.find(a => a.idarea === politica.area_id)?.nombrearea || 'N/A'}
          </Text>
          <Text style={styles.tableCell}>{politica.activo ? 'Activo' : 'Inactivo'}</Text>
          <View style={[styles.tableCell, { flexDirection: 'row' }]}>
            <TouchableOpacity onPress={() => handleEditItem(politica, 'politica')}>
              <Text>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteItem(politica.id, 'politica')}>
              <Text>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );

  const renderAreasConPermisos = () => (
    <View>
      {areasConPermisos.map((area) => (
        <Card 
          key={area.idarea} 
          title={area.nombrearea} 
          value={`${area.permisos?.length || 0} permisos, ${area.politicas?.length || 0} políticas`} 
        />
      ))}
    </View>
  );

  const renderRolesTable = () => {
    const permisosDisponibles = [
      'alta_alumnos',
      'busqueda', 
      'editar',
      'leer',
      'actualizar',
      'alta_usuarios',
      'delete',
      'insert',
      'select',
      'update'
    ];

    return (
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderCell}>Rol/Área</Text>
          {permisosDisponibles.map(permiso => (
            <Text key={permiso} style={[styles.tableHeaderCell, styles.permisoHeader]}>
              {formatTipoPermiso(permiso)}
            </Text>
          ))}
          <Text style={styles.tableHeaderCell}>Acciones</Text>
        </View>
        {areas.map((area) => {
          // Inicializar permisos si no existen
          if (!editingRoles[area.idarea]) {
            initializeRolePermissions(area);
          }
          
          const areaPermisos = editingRoles[area.idarea] || {};
          
          return (
            <View style={styles.tableRow} key={area.idarea}>
              <Text style={styles.tableCell}>{area.nombrearea}</Text>
              {permisosDisponibles.map(permiso => (
                <View key={permiso} style={[styles.tableCell, styles.checkboxCell]}>
                  <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() => handleRolePermissionChange(area.idarea, permiso, !areaPermisos[permiso])}
                  >
                    <Text style={styles.tableCheckboxText}>
                      {areaPermisos[permiso] ? '☑️' : '⬜'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
              <View style={[styles.tableCell, { flexDirection: 'row' }]}>
                <TouchableOpacity 
                  onPress={() => handleSaveRolePermissions(area.idarea)}
                  disabled={savingRole === area.idarea}
                >
                  <Text>{savingRole === area.idarea ? '⏳' : '💾'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderActiveContent = () => {
    switch (activeTab) {
      case 'permisos':
        return (
          <View>
            <PrimaryButton 
              label="Añadir Permiso" 
              onPress={() => handleOpenForm('permiso')} 
            />
            {isMobile ? (
              <View>
                {permisos.map((permiso) => (
                  <Card 
                    key={permiso.id} 
                    title={permiso.nombre} 
                    value={`${formatTipoPermiso(permiso.tipo)} - ${permiso.activo ? 'Activo' : 'Inactivo'}`} 
                  />
                ))}
              </View>
            ) : (
              renderPermisosTable()
            )}
          </View>
        );
      case 'politicas':
        return (
          <View>
            <PrimaryButton 
              label="Añadir Política RLS" 
              onPress={() => handleOpenForm('politica')} 
            />
            {isMobile ? (
              <View>
                {politicasRLS.map((politica) => (
                  <Card 
                    key={politica.id} 
                    title={politica.nombre} 
                    value={`${politica.tabla} - ${politica.activo ? 'Activo' : 'Inactivo'}`} 
                  />
                ))}
              </View>
            ) : (
              renderPoliticasTable()
            )}
          </View>
        );
      case 'roles':
        return (
          <View>
            <Text style={styles.sectionTitle}>Editar Permisos por Rol</Text>
            <Text style={styles.sectionSubtitle}>
              Marca los checkboxes para asignar permisos a cada rol/área
            </Text>
            {isMobile ? (
              <View>
                {areas.map((area) => {
                  if (!editingRoles[area.idarea]) {
                    initializeRolePermissions(area);
                  }
                  const areaPermisos = editingRoles[area.idarea] || {};
                  
                  return (
                    <View key={area.idarea} style={styles.mobileRoleCard}>
                      <Text style={styles.mobileRoleTitle}>{area.nombrearea}</Text>
                      <View style={styles.mobilePermisosGrid}>
                        {Object.entries(areaPermisos).map(([permiso, valor]) => (
                          <TouchableOpacity
                            key={permiso}
                            style={styles.mobilePermisoItem}
                            onPress={() => handleRolePermissionChange(area.idarea, permiso, !valor)}
                          >
                            <Text style={styles.mobilePermisoText}>
                              {formatTipoPermiso(permiso)}
                            </Text>
                            <Text style={styles.mobileCheckbox}>
                              {valor ? '☑️' : '⬜'}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                      <TouchableOpacity
                        style={styles.mobileSaveButton}
                        onPress={() => handleSaveRolePermissions(area.idarea)}
                        disabled={savingRole === area.idarea}
                      >
                        <Text style={styles.mobileSaveText}>
                          {savingRole === area.idarea ? 'Guardando...' : 'Guardar Cambios'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            ) : (
              renderRolesTable()
            )}
          </View>
        );
      case 'areas':
        return (
          <View>
            <PrimaryButton 
              label="Actualizar Datos" 
              onPress={refreshAreasConPermisos} 
            />
            {renderAreasConPermisos()}
          </View>
        );
      default:
        return null;
    }
  };

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
        <TouchableOpacity onPress={clearError} style={styles.retryButton}>
          <Text style={styles.retryText}>Intentar de nuevo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Gestión de Roles y Permisos</Text>
      <Text style={styles.subheader}>Administra permisos avanzados y políticas RLS</Text>
      
      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Panel aside en desktop, bottom sheet en móvil */}
      {isMobile ? (
        <BottomSheet open={showForm} onClose={() => { setShowForm(false); setEditingItem(null); }}>
          {renderForm()}
        </BottomSheet>
      ) : (
        <AsidePanel open={showForm} onClose={() => { setShowForm(false); setEditingItem(null); }}>
          {renderForm()}
        </AsidePanel>
      )}

      <ScrollView style={styles.content}>
        {renderActiveContent()}
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
  permisoHeader: {
    fontSize: 14,
    color: '#555',
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
  checkboxCell: {
    flex: 0.5, // Para que los checkboxes ocupen menos espacio
    alignItems: 'center',
  },
  checkbox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableCheckboxText: {
    fontSize: 20,
  },
  pickerContainer: {
    marginVertical: 8,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  selectedOption: {
    backgroundColor: '#007AFF',
  },
  optionText: {
    color: '#333',
  },
  selectedOptionText: {
    color: '#fff',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
    marginVertical: 8,
  },
  checkboxText: {
    fontSize: 16,
  },
  checkboxIcon: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  mobileRoleCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mobileRoleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  mobilePermisosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  mobilePermisoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginVertical: 5,
    width: '45%', // Adjust as needed for grid layout
  },
  mobilePermisoText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  mobileCheckbox: {
    fontSize: 18,
  },
  mobileSaveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  mobileSaveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 