// // Expo version of ManagePositions
// import React, { useEffect, useState } from 'react';
// import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
// import { Feather, MaterialIcons } from '@expo/vector-icons';
// import { addPosition, updatePosition, deletePosition } from '../../services/user-management-service';
// import type { Position } from '../../types/user-management-types';

// interface ManagePositionsProps {
//   initialPositions: Position[];
//   onDataChange: () => Promise<void>;
// }

// export default function ManagePositions({ initialPositions, onDataChange }: ManagePositionsProps) {
//   const [positions, setPositions] = useState<Position[]>(initialPositions);
//   const [isFormOpen, setIsFormOpen] = useState(false);
//   const [editingPosition, setEditingPosition] = useState<Position | null>(null);
//   const [formName, setFormName] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isDeleting, setIsDeleting] = useState<string | null>(null);

//   useEffect(() => {
//     setPositions(initialPositions);
//   }, [initialPositions]);

//   const openForm = (pos: Position | null = null) => {
//     setEditingPosition(pos);
//     setFormName(pos?.name || '');
//     setIsFormOpen(true);
//   };

//   const handleSubmit = async () => {
//     if (!formName.trim()) return Alert.alert('Error', 'El nombre del puesto es requerido.');
//     setIsSubmitting(true);
//     try {
//       if (editingPosition) {
//         await updatePosition(editingPosition.id, { name: formName });
//         Alert.alert('Éxito', 'Puesto actualizado.');
//       } else {
//         await addPosition({ name: formName });
//         Alert.alert('Éxito', 'Puesto añadido.');
//       }
//       setIsFormOpen(false);
//       onDataChange();
//     } catch (err: any) {
//       Alert.alert('Error', `No se pudo guardar el puesto. ${err?.message || ''}`);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleDelete = async (id: string, name: string) => {
//     Alert.alert('Confirmar', `¿Eliminar puesto "${name}"?`, [
//       { text: 'Cancelar', style: 'cancel' },
//       {
//         text: 'Eliminar', style: 'destructive', onPress: async () => {
//           setIsDeleting(id);
//           try {
//             await deletePosition(id);
//             onDataChange();
//           } catch (err: any) {
//             Alert.alert('Error', `No se pudo eliminar el puesto. ${err?.message || ''}`);
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
//         <Text style={styles.title}>Puestos</Text>
//         <TouchableOpacity onPress={() => openForm()} style={styles.addButton}>
//           <Feather name="plus" size={16} color="#fff" />
//           <Text style={styles.addButtonText}>Añadir Puesto</Text>
//         </TouchableOpacity>
//       </View>
//       <Text style={styles.description}>Crea y gestiona los diferentes puestos de trabajo en tu negocio.</Text>

//       <ScrollView>
//         {positions.length === 0 ? (
//           <Text style={styles.noItems}>No hay puestos definidos.</Text>
//         ) : (
//           positions.map(pos => (
//             <View key={pos.id} style={styles.card}>
//               <View style={styles.row}>
//                 <Text style={styles.name}>{pos.name}</Text>
//                 <View style={styles.actions}>
//                   <TouchableOpacity onPress={() => openForm(pos)} style={styles.iconButton}>
//                     <Feather name="edit" size={18} color="#333" />
//                   </TouchableOpacity>
//                   <TouchableOpacity onPress={() => handleDelete(pos.id, pos.name)} style={styles.iconButton}>
//                     {isDeleting === pos.id ? <ActivityIndicator size="small" /> : <Feather name="trash" size={18} color="red" />}
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             </View>
//           ))
//         )}
//       </ScrollView>

//       {isFormOpen && (
//         <View style={styles.modal}>
//           <Text style={styles.modalTitle}>{editingPosition ? 'Editar Puesto' : 'Nuevo Puesto'}</Text>
//           <TextInput
//             placeholder="Nombre del puesto"
//             value={formName}
//             onChangeText={setFormName}
//             style={styles.input}
//           />
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
//   container: { flex: 1, padding: 16 },
//   headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
//   title: { fontSize: 18, fontWeight: 'bold' },
//   addButton: { flexDirection: 'row', backgroundColor: '#007AFF', padding: 8, borderRadius: 6, alignItems: 'center' },
//   addButtonText: { color: '#fff', marginLeft: 6 },
//   description: { color: '#555', marginBottom: 10 },
//   noItems: { textAlign: 'center', color: '#888', marginTop: 40 },
//   card: { backgroundColor: '#f1f1f1', padding: 12, borderRadius: 8, marginBottom: 10 },
//   row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
//   name: { fontSize: 16, fontWeight: '500' },
//   actions: { flexDirection: 'row' },
//   iconButton: { marginLeft: 12 },
//   modal: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#fff', padding: 20 },
//   modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
//   input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginBottom: 12 },
//   modalActions: { flexDirection: 'row', justifyContent: 'space-between' },
//   modalButton: { flex: 1, padding: 12, borderRadius: 6, alignItems: 'center' },
//   cancelButton: { backgroundColor: '#eee', marginRight: 10 },
//   saveButton: { backgroundColor: '#007AFF' },
//   saveText: { color: '#fff', fontWeight: 'bold' },
// });
