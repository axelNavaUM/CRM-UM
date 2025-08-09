import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { EnhancedModalFirma } from './EnhancedModalFirma';
import RadixIcons from './RadixIcons';

interface AsidePanelProps {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  onApprove?: () => void;
  onReject?: () => void;
  onComment?: (comment: string) => void;
  onSign?: (signature: string) => void;
  showApprovalActions?: boolean;
  peticionInfo?: {
    id: number;
    alumno_nombre: string;
    alumno_apellidos: string;
    carrera_actual_nombre: string;
    carrera_nueva_nombre: string;
    fecha_creacion: string;
  };
}

const AsidePanel: React.FC<AsidePanelProps> = ({ 
  open, 
  onClose, 
  children, 
  onApprove, 
  onReject, 
  onComment, 
  onSign,
  showApprovalActions = false,
  peticionInfo
}) => {
  const translateX = useRef(new Animated.Value(400)).current;
  const [comment, setComment] = useState('');
  const [signature, setSignature] = useState('');
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [showSignatureInput, setShowSignatureInput] = useState(false);
  const [showEnhancedFirma, setShowEnhancedFirma] = useState(false);

  useEffect(() => {
    if (open) {
      Animated.timing(translateX, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateX, {
        toValue: 400,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [open]);

  const handleApprove = () => {
    if (showApprovalActions && peticionInfo) {
      setShowEnhancedFirma(true);
    } else if (onApprove) {
      onApprove();
    }
  };

  const handleReject = () => {
    if (showApprovalActions && peticionInfo) {
      setShowEnhancedFirma(true);
    } else if (onReject) {
      onReject();
    }
  };

  const handleEnhancedFirmar = async (estado: 'aprobada' | 'rechazada', metodo: 'biometrico' | 'password', password?: string, comentarios?: string) => {
    try {
      if (estado === 'aprobada' && onApprove) {
        onApprove();
      } else if (estado === 'rechazada' && onReject) {
        onReject();
      }
      setShowEnhancedFirma(false);
    } catch (error) {
      console.error('Error al firmar:', error);
    }
  };

  const handleComment = () => {
    if (comment.trim() && onComment) {
      onComment(comment);
      setComment('');
      setShowCommentInput(false);
    }
  };

  const handleSign = () => {
    if (signature.trim() && onSign) {
      onSign(signature);
      setSignature('');
      setShowSignatureInput(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={onClose}
        />
        <Animated.View 
          style={[
            styles.panel,
            {
              transform: [{ translateX }],
            },
          ]}
        >
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIcon}>
                <RadixIcons.Bell size={20} color="#3B82F6" />
              </View>
              <Text style={styles.title}>
                {children ? 'Información Detallada' : 'Nueva solicitud de cambio de carrera'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <RadixIcons.Close size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            style={styles.content} 
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.contentContainer}
          >
            {children || <DefaultContent />}
            
            {/* Timeline Section - Solo para peticiones */}
            {showApprovalActions && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <RadixIcons.Clock size={16} color="#6B7280" />
                  <Text style={styles.sectionTitle}>Línea de Tiempo</Text>
                </View>
                <View style={styles.timeline}>
                  <View style={styles.timelineItem}>
                    <View style={styles.timelineDot} />
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineText}>Axel creó la petición</Text>
                      <Text style={styles.timelineDate}>Hace 2 horas</Text>
                    </View>
                  </View>
                  <View style={styles.timelineItem}>
                    <View style={styles.timelineDot} />
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineText}>Control escolar firmado</Text>
                      <Text style={styles.timelineDate}>Hace 1 hora</Text>
                    </View>
                  </View>
                  <View style={styles.timelineItem}>
                    <View style={styles.timelineDot} />
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineText}>Pendiente de aprobación</Text>
                      <Text style={styles.timelineDate}>En espera</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Comments Section - Solo para peticiones */}
            {showApprovalActions && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <RadixIcons.Message size={16} color="#6B7280" />
                  <Text style={styles.sectionTitle}>Comentarios</Text>
                </View>
                {showCommentInput ? (
                  <View style={styles.commentInput}>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Escribe tu comentario..."
                      value={comment}
                      onChangeText={setComment}
                      multiline
                    />
                    <View style={styles.commentActions}>
                      <TouchableOpacity onPress={() => setShowCommentInput(false)} style={styles.cancelButton}>
                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={handleComment} style={styles.submitButton}>
                        <Text style={styles.submitButtonText}>Enviar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity onPress={() => setShowCommentInput(true)} style={styles.addCommentButton}>
                    <RadixIcons.Plus size={16} color="#6B7280" />
                    <Text style={styles.addCommentText}>Agregar comentario</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Action Buttons - Solo para peticiones */}
            {showApprovalActions && (
              <View style={styles.actionsSection}>
                <View style={styles.actionButtons}>
                  <TouchableOpacity onPress={handleApprove} style={styles.approveButton}>
                    <RadixIcons.Check size={16} color="#FFFFFF" />
                    <Text style={styles.approveButtonText}>Aprobar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleReject} style={styles.rejectButton}>
                    <RadixIcons.Close size={16} color="#FFFFFF" />
                    <Text style={styles.rejectButtonText}>Rechazar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </View>

      {/* Enhanced Modal de Firma */}
      {showEnhancedFirma && peticionInfo && (
        <EnhancedModalFirma
          visible={showEnhancedFirma}
          onClose={() => setShowEnhancedFirma(false)}
          onFirmar={handleEnhancedFirmar}
          loading={false}
          peticionInfo={peticionInfo}
        />
      )}
    </>
  );
};

const DefaultContent: React.FC = () => {
  return (
    <View style={styles.defaultContent}>
      {/* Información Personal */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información Personal</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Nombre:</Text>
          <Text style={styles.infoValue}>J S</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoValue}>axelhernandez20720@gmail.com</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Estado:</Text>
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>pendiente</Text>
          </View>
        </View>
      </View>

      {/* Información Académica */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información Actual</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Carrera:</Text>
          <Text style={styles.infoValue}>Ingeniería en Sistemas</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Ciclo:</Text>
          <Text style={styles.infoValue}>2025/2025-ECA-1</Text>
        </View>
      </View>

      {/* Estado de Trámites */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estado de Trámites</Text>
        <View style={styles.warningContainer}>
          <View style={styles.warningIcon}>
            <RadixIcons.Warning size={24} color="#F59E0B" />
          </View>
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>Trámites Pendientes</Text>
            <Text style={styles.warningText}>
              El alumno tiene los siguientes trámites pendientes:
            </Text>
            <Text style={styles.warningItem}>• Registro de alumno pendiente</Text>
          </View>
        </View>
      </View>

      {/* Acciones */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acciones</Text>
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <RadixIcons.Edit size={16} color="#3B82F6" />
            <Text style={styles.actionText}>Editar Información</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <RadixIcons.Download size={16} color="#10B981" />
            <Text style={styles.actionText}>Descargar Reporte</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <RadixIcons.Mail size={16} color="#8B5CF6" />
            <Text style={styles.actionText}>Enviar Notificación</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 99999, // Aumentar z-index para asegurar que esté por encima
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  panel: {
    position: 'absolute',
    top: 0,
    right: 0,
    height: Dimensions.get('window').height,
    width: 400,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: -2,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F8FAFC',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  defaultContent: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  timeline: {
    gap: 12,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    marginRight: 12,
  },
  timelineContent: {
    flex: 1,
  },
  timelineText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  timelineDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  commentInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  textInput: {
    fontSize: 14,
    color: '#111827',
    minHeight: 80,
    paddingTop: 0,
  },
  commentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  submitButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#3B82F6',
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  addCommentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  addCommentText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  signatureInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  signatureActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  addSignatureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  addSignatureText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  actionsSection: {
    marginTop: 32,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  approveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#10B981',
    borderRadius: 8,
    gap: 8,
  },
  approveButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  rejectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    gap: 8,
  },
  rejectButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  // Estilos para el contenido por defecto
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    flex: 2,
    textAlign: 'right',
  },
  statusContainer: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#D97706',
    textTransform: 'lowercase',
  },
  warningContainer: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  warningIcon: {
    marginBottom: 12,
  },
  warningContent: {
    gap: 8,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
  },
  warningText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  warningItem: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '500',
    marginLeft: 8,
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
});

export default AsidePanel; 