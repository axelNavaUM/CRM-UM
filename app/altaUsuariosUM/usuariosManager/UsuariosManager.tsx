import Card from '@/components/inicio/Card';
import AsidePanel from '@/components/ui/AsidePanel';
import BottomSheet from '@/components/ui/BottomSheet';
import { Input } from '@/components/ui/Input';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { UsuariosController } from '@/controller/usuarios/usuarios.controller';
import { userModel } from '@/models/usuarios/usuarios';
import { Picker } from '@react-native-picker/picker';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';

interface UsuariosManagerProps {
  onDataChange?: () => void;
}

export default function UsuariosManager({ onDataChange }: UsuariosManagerProps) {
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [areas, setAreas] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [form, setForm] = useState<any>({
    nombreusuario: '',
    apellido: '',
    correoinstitucional: '',
    password: '',
    matricula: '',
    telefono: '',
    idarea: '',
    reporta_a: '',
    pin: '',
    estado: 'Activo',
  });
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const fetchData = useCallback(async (showToast = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedEmployees = await UsuariosController.getAll();
      setEmployees(fetchedEmployees);
      if (showToast) console.log("Datos Actualizados");
    } catch (error) {
      console.error('[UsuariosManager] error en Carga de datos:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al cargar los datos';
      setError(`Error en la gestión de Usuarios: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    userModel.getAllAreas().then(setAreas);
    UsuariosController.getAll().then(setUsuarios);
  }, [fetchData]);

  const handleInputChange = (key: string, value: string) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setForm({ ...user, idarea: user.idarea?.toString() || '', reporta_a: user.reporta_a?.toString() || '' });
    setShowForm(true);
  };

  const handleDeleteUser = async (idusuario: number) => {
    try {
      await userModel.delete(idusuario);
      fetchData(true);
      onDataChange?.();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleSaveUser = async () => {
    try {
      if (editingUser) {
        // Edición: solo actualizar en la tabla usuariosum
        // Filtrar solo los campos válidos de la tabla usuariosum
        const validFields = {
          nombreusuario: form.nombreusuario,
          apellido: form.apellido,
          correoinstitucional: form.correoinstitucional,
          password: form.password,
          matricula: form.matricula ? parseInt(form.matricula) : 0,
          telefono: form.telefono ? parseInt(form.telefono) : 0,
          idarea: form.idarea ? parseInt(form.idarea) : 0,
          ...(form.reporta_a && { reporta_a: parseInt(form.reporta_a) }),
          ...(form.pin && { pin: form.pin }),
          ...(form.estado && { estado: form.estado }),
        };
        
        await UsuariosController.update(editingUser.idusuario, validFields);
      } else {
        // Alta nueva: crear en Supabase Auth y en usuariosum
        await userModel.registerWithAuth({
          email: form.correoinstitucional,
          password: form.password,
          nombreusuario: form.nombreusuario,
          apellido: form.apellido,
          matricula: form.matricula ? parseInt(form.matricula) : 0,
          telefono: form.telefono ? parseInt(form.telefono) : 0,
          idarea: form.idarea ? parseInt(form.idarea) : 0,
          ...(form.reporta_a && { reporta_a: parseInt(form.reporta_a) }),
          ...(form.pin && { pin: form.pin }),
          ...(form.estado && { estado: form.estado }),
        });
      }
      setShowForm(false);
      setEditingUser(null);
      setForm({ nombreusuario: '', apellido: '', correoinstitucional: '', password: '', matricula: '', telefono: '', idarea: '', reporta_a: '', pin: '', estado: 'Activo' });
      fetchData(true);
      onDataChange?.();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleOpenForm = () => {
    setEditingUser(null);
    setForm({ nombreusuario: '', apellido: '', correoinstitucional: '', password: '', matricula: '', telefono: '', idarea: '', reporta_a: '', pin: '', estado: 'Activo' });
    setShowForm(true);
  };

  const renderForm = () => (
    <View style={{ marginVertical: 8 }}>
      <Input placeholder="Nombre" value={form.nombreusuario} onChangeText={(v: string) => handleInputChange('nombreusuario', v)} />
      <Input placeholder="Apellido" value={form.apellido} onChangeText={(v: string) => handleInputChange('apellido', v)} />
      <Input placeholder="Correo institucional" value={form.correoinstitucional} onChangeText={(v: string) => handleInputChange('correoinstitucional', v)} />
      <Input placeholder="Contraseña" value={form.password} onChangeText={(v: string) => handleInputChange('password', v)} secureTextEntry />
      <Input placeholder="Matrícula" value={form.matricula} onChangeText={(v: string) => handleInputChange('matricula', v)} />
      <Input placeholder="Teléfono" value={form.telefono} onChangeText={(v: string) => handleInputChange('telefono', v)} />
      {/* Selector de área */}
      <View style={{ marginVertical: 8 }}>
        <Text style={{ marginBottom: 4 }}>Área</Text>
        <View style={{ borderWidth: 1, borderColor: '#e7edf3', borderRadius: 8, backgroundColor: '#f0f2f5' }}>
          <Picker
            selectedValue={form.idarea}
            onValueChange={(v: string) => handleInputChange('idarea', v)}>
            <Picker.Item label="Selecciona un área" value="" />
            {areas.map(area => (
              <Picker.Item key={area.idarea} label={area.nombrearea} value={area.idarea.toString()} />
            ))}
          </Picker>
        </View>
      </View>
      {/* Selector de jefe directo */}
      <View style={{ marginVertical: 8 }}>
        <Text style={{ marginBottom: 4 }}>Jefe Directo</Text>
        <View style={{ borderWidth: 1, borderColor: '#e7edf3', borderRadius: 8, backgroundColor: '#f0f2f5' }}>
          <Picker
            selectedValue={form.reporta_a}
            onValueChange={(v: string) => handleInputChange('reporta_a', v)}>
            <Picker.Item label="Selecciona un jefe" value="" />
            {usuarios.map(u => (
              <Picker.Item key={u.idusuario} label={`${u.nombreusuario} ${u.apellido}`} value={u.idusuario.toString()} />
            ))}
          </Picker>
        </View>
      </View>
      <Input placeholder="PIN" value={form.pin} onChangeText={(v: string) => handleInputChange('pin', v)} />
      <Input placeholder="Estado" value={form.estado} onChangeText={(v: string) => handleInputChange('estado', v)} />
      {/* Permisos del área seleccionada */}
      {form.idarea && (
        <View style={{ marginVertical: 8 }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Permisos del área:</Text>
          {areas.find(a => a.idarea.toString() === form.idarea)?.permisos &&
            Object.entries(areas.find(a => a.idarea.toString() === form.idarea)?.permisos || {}).map(([perm, val]) => (
              <View key={perm} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                <Text style={{ flex: 1 }}>{perm}</Text>
                <Text style={{ color: val ? '#0d80f2' : '#aaa' }}>{val ? '✔️' : '❌'}</Text>
              </View>
            ))}
        </View>
      )}
      <PrimaryButton label={editingUser ? "Actualizar" : "Guardar"} onPress={handleSaveUser} />
      <PrimaryButton label="Cancelar" onPress={() => { setShowForm(false); setEditingUser(null); }} />
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
        <TouchableOpacity onPress={() => fetchData(true)} style={styles.retryButton}>
          <Text style={styles.retryText}>Intentar de nuevo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- DESKTOP TABLE ---
  const renderTable = () => (
    <View style={styles.table}>
      <View style={styles.tableHeader}>
        <Text style={styles.tableHeaderCell}>Nombre Completo</Text>
        <Text style={styles.tableHeaderCell}>Puesto</Text>
        <Text style={styles.tableHeaderCell}>Reporta a</Text>
        <Text style={styles.tableHeaderCell}>Roles</Text>
        <Text style={styles.tableHeaderCell}>PIN</Text>
        <Text style={styles.tableHeaderCell}>Estado</Text>
        <Text style={styles.tableHeaderCell}>Acciones</Text>
      </View>
      {employees.map((emp) => (
        <View style={styles.tableRow} key={emp.idusuario}>
          <Text style={styles.tableCell}>{emp.nombreusuario} {emp.apellido}</Text>
          <Text style={styles.tableCell}>{emp.areas?.nombrearea || '-'}</Text>
          <Text style={styles.tableCell}>{emp.jefe ? `${emp.jefe.nombreusuario} ${emp.jefe.apellido}` : 'N/A'}</Text>
          <Text style={styles.tableCell}>{emp.areas?.rolarea || '-'}</Text>
          <Text style={styles.tableCell}>{emp.pin ? '****' : ''}</Text>
          <Text style={styles.tableCell}>{emp.estado || 'Activo'}</Text>
          <View style={[styles.tableCell, { flexDirection: 'row' }]}>
            <TouchableOpacity onPress={() => handleEditUser(emp)}><Text>✏️</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteUser(emp.idusuario)}><Text>🗑️</Text></TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );

  // --- MOBILE CARDS ---
  const renderCards = () => (
    <View>
      {employees.map((emp) => (
        <Card key={emp.idusuario} title={`${emp.nombreusuario} ${emp.apellido}`} value={emp.areas?.nombrearea || '-'} />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Gestión de Usuarios</Text>
      <Text style={styles.subheader}>Administra empleados</Text>
      <PrimaryButton label="Añadir Empleado" onPress={handleOpenForm} />
      {/* Panel aside en desktop, bottom sheet en móvil */}
      {isMobile ? (
        <BottomSheet open={showForm} onClose={() => { setShowForm(false); setEditingUser(null); }}>
          {renderForm()}
        </BottomSheet>
      ) : (
        <AsidePanel open={showForm} onClose={() => { setShowForm(false); setEditingUser(null); }}>
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