import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useUsuarioStore } from '@/store/usuario/usuario';
import { UsuariosController } from '@/controller/usuarios/usuarios.controller';

const ManageEmployees = ({ allRoles, allPositions, onDataChange }) => {
  const { usuario, setUsuario, isLoading, setIsLoading, setError } = useUsuarioStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({
    nombreusuario: '',
    matricula: '',
    idarea: '',
    telefono: '',
    correoinstitucional: '',
    password: '',
    apellido: '',
  });
  const [editId, setEditId] = useState<number | null>(null);

  const fetchUsuarios = async () => {
    try {
      setIsLoading(true);
      const data = await UsuariosController.getAll();
      setUsuario(data);
    } catch (error: any) {
      setError(error.message || 'Error al cargar usuarios');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleSave = async () => {
    try {
      if (editId !== null) {
        await UsuariosController.update(editId, form);
      } else {
        await UsuariosController.create(form);
      }
      setModalVisible(false);
      setForm({
        nombreusuario: '',
        matricula: '',
        idarea: '',
        telefono: '',
        correoinstitucional: '',
        password: '',
        apellido: '',
      });
      setEditId(null);
      fetchUsuarios();
      onDataChange?.();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el usuario');
    }
  };

  const handleEdit = (user) => {
    setForm(user);
    setEditId(user.idusuario);
    setModalVisible(true);
  };

  const handleDelete = async (idusuario: number) => {
    Alert.alert('Eliminar Usuario', '¿Estás seguro de eliminar este usuario?', [
      { text: 'Cancelar' },
      {
        text: 'Eliminar',
        onPress: async () => {
          try {
            await UsuariosController.delete(idusuario);
            fetchUsuarios();
            onDataChange?.();
          } catch (error) {
            Alert.alert('Error', 'No se pudo eliminar el usuario');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemRow}>
      <Text style={styles.itemText}>{item.nombreusuario} {item.apellido}</Text>
      <Text style={styles.itemText}>Mat: {item.matricula}</Text>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => handleEdit(item)} style={styles.editButton}>
          <Text style={styles.buttonText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.idusuario)} style={styles.deleteButton}>
          <Text style={styles.buttonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <Text style={styles.header}>Empleados</Text>

        {isLoading ? (
          <ActivityIndicator size="large" />
        ) : (
          <FlatList
            data={Array.isArray(usuario) ? usuario : []}
            keyExtractor={(item) => item.idusuario.toString()}
            renderItem={renderItem}
            ListEmptyComponent={<Text style={styles.emptyText}>No hay empleados registrados</Text>}
          />
        )}

        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
          <Text style={styles.buttonText}>Agregar Empleado</Text>
        </TouchableOpacity>

        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{editId ? 'Editar Empleado' : 'Nuevo Empleado'}</Text>

              <TextInput
                style={styles.input}
                placeholder="Nombre"
                value={form.nombreusuario}
                onChangeText={(text) => setForm({ ...form, nombreusuario: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Apellido"
                value={form.apellido}
                onChangeText={(text) => setForm({ ...form, apellido: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Correo institucional"
                value={form.correoinstitucional}
                onChangeText={(text) => setForm({ ...form, correoinstitucional: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Teléfono"
                keyboardType="phone-pad"
                value={form.telefono}
                onChangeText={(text) => setForm({ ...form, telefono: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Matrícula"
                keyboardType="numeric"
                value={form.matricula}
                onChangeText={(text) => setForm({ ...form, matricula: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                secureTextEntry
                value={form.password}
                onChangeText={(text) => setForm({ ...form, password: text })}
              />

              <Picker
                selectedValue={form.idarea}
                onValueChange={(value) => setForm({ ...form, idarea: value })}
                style={styles.input}
              >
                <Picker.Item label="Seleccione un área" value="" />
                {allPositions.map((p) => (
                  <Picker.Item key={p.idarea} label={p.nombrearea} value={p.idarea} />
                ))}
              </Picker>

              <View style={styles.modalActions}>
                <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                  <Text style={styles.buttonText}>Guardar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
};
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    height: '100%',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    padding: 10,
    marginBottom: 8,
    borderRadius: 6,
  },
  itemText: {
    flex: 1,
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  editButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  deleteButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  addButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    marginTop: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
    color: '#888',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '85%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 6,
    flex: 1,
    marginRight: 5,
  },
  cancelButton: {
    backgroundColor: '#888',
    padding: 10,
    borderRadius: 6,
    flex: 1,
    marginLeft: 5,
  },
});

export default ManageEmployees;
