import PrimaryButton from '@/components/ui/PrimaryButton';
import * as DocumentPicker from 'expo-document-picker';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface Paso3SubirDocumentosProps {
  fileCurp: any;
  setFileCurp: (f: any) => void;
  fileActa: any;
  setFileActa: (f: any) => void;
  fileCert: any;
  setFileCert: (f: any) => void;
  filePago: any;
  setFilePago: (f: any) => void;
  onSiguiente: () => void;
  onAtras: () => void;
}

const handlePickFile = async (setter: (file: File) => void, tipo: string) => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      type: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
      ],
      multiple: false,
    });
    
    if (!result.canceled && result.assets && result.assets[0]) {
      const file = result.assets[0];
      // Validar tamaño del archivo (máximo 10MB)
      if (file.size && file.size > 10 * 1024 * 1024) {
        alert(`El archivo ${tipo} es demasiado grande. Máximo 10MB permitido.`);
        return;
      }
      setter(file as any);
    }
  } catch (error) {
    console.error('Error al seleccionar archivo:', error);
    alert('Error al seleccionar el archivo. Intenta de nuevo.');
  }
};

const FileItem = ({ 
  file, 
  onPress, 
  label, 
  isRequired = false 
}: { 
  file: any; 
  onPress: () => void; 
  label: string; 
  isRequired?: boolean;
}) => (
  <View style={styles.fileItem}>
    <View style={styles.fileHeader}>
      <Text style={styles.fileLabel}>
        {label} {isRequired && <Text style={styles.required}>*</Text>}
      </Text>
      <Text style={styles.fileStatus}>
        {file ? '✅ Subido' : isRequired ? '❌ Requerido' : '📄 Opcional'}
      </Text>
    </View>
    <PrimaryButton 
      label={file ? `Cambiar ${label}` : `Subir ${label}`} 
      onPress={onPress}
      style={file ? styles.buttonChange : styles.buttonUpload}
    />
    {file && (
      <View style={styles.fileInfo}>
        <Text style={styles.fileName}>📄 {file.name}</Text>
        {file.size && (
          <Text style={styles.fileSize}>
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </Text>
        )}
      </View>
    )}
  </View>
);

const Paso3SubirDocumentos: React.FC<Paso3SubirDocumentosProps> = ({ 
  fileCurp, setFileCurp, 
  fileActa, setFileActa, 
  fileCert, setFileCert, 
  filePago, setFilePago, 
  onSiguiente, onAtras 
}) => {
  const canContinue = filePago; // Solo el pago es obligatorio

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📋 Subir Documentos</Text>
      
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          <Text style={styles.bold}>Importante:</Text> Solo el comprobante de pago es obligatorio para continuar. 
          Los demás documentos puedes entregarlos después con una prórroga de 3 meses.
        </Text>
      </View>

      <View style={styles.filesContainer}>
        <FileItem
          file={fileCurp}
          onPress={() => handlePickFile(setFileCurp, 'CURP')}
          label="CURP"
          isRequired={false}
        />

        <FileItem
          file={fileActa}
          onPress={() => handlePickFile(setFileActa, 'Acta de Nacimiento')}
          label="Acta de Nacimiento"
          isRequired={false}
        />

        <FileItem
          file={fileCert}
          onPress={() => handlePickFile(setFileCert, 'Certificado de Preparatoria')}
          label="Certificado de Preparatoria"
          isRequired={false}
        />

        <FileItem
          file={filePago}
          onPress={() => handlePickFile(setFilePago, 'Comprobante de Pago')}
          label="Comprobante de Pago"
          isRequired={true}
        />
      </View>

      <View style={styles.formatInfo}>
        <Text style={styles.formatTitle}>📎 Formatos permitidos:</Text>
        <Text style={styles.formatText}>PDF, DOC, DOCX, JPG, PNG (máximo 10MB por archivo)</Text>
      </View>

      <View style={styles.warningBox}>
        <Text style={styles.warningText}>
          ⚠️ <Text style={styles.bold}>Documentos faltantes:</Text> Si no subes todos los documentos ahora, 
          tendrás 3 meses para entregarlos. De lo contrario, se dará de baja al alumno.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <PrimaryButton 
          label="Atrás" 
          onPress={onAtras}
          style={styles.buttonBack}
        />
        <PrimaryButton 
          label="Continuar al Contrato" 
          onPress={onSiguiente}
          disabled={!canContinue}
          style={styles.buttonContinue}
        />
      </View>

      {!canContinue && (
        <Text style={styles.errorText}>
          ❌ Debes subir el comprobante de pago para continuar
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#121417',
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  infoText: {
    fontSize: 14,
    color: '#1565c0',
    lineHeight: 20,
  },
  bold: {
    fontWeight: 'bold',
  },
  filesContainer: {
    gap: 20,
    marginBottom: 24,
  },
  fileItem: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  fileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  fileLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#121417',
  },
  required: {
    color: '#dc3545',
  },
  fileStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  buttonUpload: {
    backgroundColor: '#007bff',
  },
  buttonChange: {
    backgroundColor: '#28a745',
  },
  fileInfo: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#ffffff',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  fileName: {
    fontSize: 12,
    color: '#495057',
    fontWeight: '500',
  },
  fileSize: {
    fontSize: 11,
    color: '#6c757d',
    marginTop: 2,
  },
  formatInfo: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  formatTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 4,
  },
  formatText: {
    fontSize: 12,
    color: '#6c757d',
  },
  warningBox: {
    backgroundColor: '#fff3cd',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  buttonBack: {
    flex: 1,
    backgroundColor: '#6c757d',
  },
  buttonContinue: {
    flex: 2,
    backgroundColor: '#28a745',
  },
  errorText: {
    fontSize: 14,
    color: '#dc3545',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default Paso3SubirDocumentos; 