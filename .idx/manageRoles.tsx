// // src/screens/components/ManageRoles.tsx
// import React, { useState, useEffect } from 'react';
// import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
// import { Feather, MaterialIcons } from '@expo/vector-icons';
// import { Role, Permission } from '../../types/user-management-types';
// import { addRole, updateRole, deleteRole } from '../../services/user-management-service';

// interface ManageRolesProps {
//   initialRoles: Role[];
//   allPermissions: Permission[];
//   onDataChange: () => Promise<void>;
// }

// export default function ManageRoles({ initialRoles, allPermissions, onDataChange }: ManageRolesProps) {
//   const [roles, setRoles] = useState<Role[]>(initialRoles);
//   const [isFormOpen, setIsFormOpen] = useState(false);
//   const [editingRole, setEditingRole] = useState<Role | null>(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isDeleting, setIsDeleting] = useState<string | null>(null);
//   const [formName, setFormName] = useState('');
//   const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

//   useEffect(() => {
//     setRoles(initialRoles);
//   }, [initialRoles]);

//   const openForm = (role: Role | null = null) => {
//     setEditingRole(role);
//     setFormName(role ? role.name : '');
//     setSelectedPermissions(role?.permissions?.map(p => p.id) || []);
//     setIsFormOpen(true);
//   };

//   const togglePermission = (id: string) => {
//     setSelectedPermissions(prev =>
//       prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
//     );
//   };

//   const handleSubmit = async () => {
//     if (!formName.trim()) return Alert.alert('Error', 'Nombre del rol es requerido.');
//     setIsSubmitting(true);
//     try {
//       if (editingRole) {
//         await updateRole(editingRole.id, { name: formName }, selectedPermissions);
//         Alert.alert('Éxito', 'Rol actualizado.');
//       } else {
//         await addRole({ name: formName }, selectedPermissions);
//         Alert.alert('Éxito', 'Rol añadido.');
//       }
//       setIsFormOpen(false);
//       onDataChange();
//     } catch (err: any) {
//       Alert.alert('Error', `No se pudo guardar el rol. ${err?.message || ''}`);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleDelete = async (id: string, name: string) => {
//     Alert.alert('Confirmar', `¿Eliminar rol "${name}"?`, [
//       { text: 'Cancelar', style: 'cancel' },
//       {
//         text: 'Eliminar', style: 'destructive', onPress: async () => {
//           setIsDeleting(id);
//           try {
//             await deleteRole(id);
//             onDataChange();
//           } catch (err: any) {
//             Alert.alert('Error', `No se pudo eliminar el rol. ${err?.message || ''}`);
//           } finally {
//             setIsDeleting(null);
//           }
//         }
//       }
//     ]);
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.headerRow}>
//         <Text style={styles.title}>Roles y Permisos</Text>
//         <TouchableOpacity onPress={() => openForm()} style={styles.addButton}>
//           <Feather name="plus" size={16} color="#fff" />
//           <Text style={styles.addButtonText}>Añadir Rol</Text>
//         </TouchableOpacity>
//       </View>

//       <ScrollView>
//         {roles.map(role => (
//           <View key={role.id} style={styles.roleCard}>
//             <View style={styles.roleRow}>
//               <Text style={styles.roleName}>{role.name}</Text>
//               <View style={styles.actions}>
//                 <TouchableOpacity onPress={() => openForm(role)} style={styles.iconButton}>
//                   <Feather name="edit" size={18} color="#333" />
//                 </TouchableOpacity>
//                 <TouchableOpacity onPress={() => handleDelete(role.id, role.name)} style={styles.iconButton}>
//                   {isDeleting === role.id ? <ActivityIndicator size="small" /> : <Feather name="trash" size={18} color="red" />}
//                 </TouchableOpacity>
//               </View>
//             </View>
//             <View style={styles.permissionTags}>
//               {role.permissions?.length ? role.permissions.map(p => (
//                 <View key={p.id} style={styles.permissionBadge}>
//                   <Text style={styles.permissionText}>{p.name}</Text>
//                 </View>
//               )) : <Text style={styles.noPerms}>Sin permisos</Text>}
//             </View>
//           </View>
//         ))}
//       </ScrollView>

//       {isFormOpen && (
//         <View style={styles.formModal}>
//           <Text style={styles.modalTitle}>{editingRole ? 'Editar Rol' : 'Nuevo Rol'}</Text>
//           <TextInput
//             placeholder="Nombre del rol"
//             value={formName}
//             onChangeText={setFormName}
//             style={styles.input}
//           />
//           <ScrollView style={styles.permissionList}>
//             {allPermissions.map(permission => (
//               <TouchableOpacity
//                 key={permission.id}
//                 onPress={() => togglePermission(permission.id)}
//                 style={styles.permissionRow}
//               >
//                 <MaterialIcons
//                   name={selectedPermissions.includes(permission.id) ? 'check-box' : 'check-box-outline-blank'}
//                   size={20}
//                   color="#007AFF"
//                 />
//                 <View>
//                   <Text style={styles.permissionName}>{permission.name}</Text>
//                   {permission.description && <Text style={styles.permissionDesc}>{permission.description}</Text>}
//                 </View>
//               </TouchableOpacity>
//             ))}
//           </ScrollView>
//           <View style={styles.modalActions}>
//             <TouchableOpacity onPress={() => setIsFormOpen(false)} style={[styles.modalButton, styles.cancelButton]}>
//               <Text>Cancelar</Text>
//             </TouchableOpacity>
//             <TouchableOpacity onPress={handleSubmit} style={[styles.modalButton, styles.saveButton]} disabled={isSubmitting}>
//               {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Guardar</Text>}
//             </TouchableOpacity>
//           </View>
//         </View>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
//   title: { fontSize: 18, fontWeight: 'bold' },
//   addButton: { flexDirection: 'row', backgroundColor: '#007AFF', padding: 8, borderRadius: 6, alignItems: 'center' },
//   addButtonText: { color: '#fff', marginLeft: 6 },
//   roleCard: { backgroundColor: '#f9f9f9', padding: 12, borderRadius: 8, marginBottom: 10 },
//   roleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
//   roleName: { fontWeight: 'bold', fontSize: 16 },
//   actions: { flexDirection: 'row' },
//   iconButton: { marginLeft: 10 },
//   permissionTags: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
//   permissionBadge: { backgroundColor: '#e1e1e1', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4, marginRight: 6, marginBottom: 6 },
//   permissionText: { fontSize: 12 },
//   noPerms: { fontSize: 12, color: '#888', marginTop: 4 },
//   formModal: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#fff', padding: 20 },
//   modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
//   input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginBottom: 12 },
//   permissionList: { maxHeight: 250, marginBottom: 12 },
//   permissionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
//   permissionName: { fontWeight: '500' },
//   permissionDesc: { fontSize: 12, color: '#666' },
//   modalActions: { flexDirection: 'row', justifyContent: 'space-between' },
//   modalButton: { flex: 1, padding: 12, borderRadius: 6, alignItems: 'center' },
//   cancelButton: { backgroundColor: '#eee', marginRight: 10 },
//   saveButton: { backgroundColor: '#007AFF' },
//   saveText: { color: '#fff', fontWeight: 'bold' },
// });
