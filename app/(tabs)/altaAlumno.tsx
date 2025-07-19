import { useRegistroAlumno } from '@/hooks/registroAlumno/useRegistroAlumno';
import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Paso1DatosPersonales from '../altaAlumnosView/paso1';
import Paso2CarreraCiclo from '../altaAlumnosView/paso2';
import Paso3SubirDocumentos from '../altaAlumnosView/paso3';
import Paso4Contrato from '../altaAlumnosView/paso4';

const PASOS = [
  'Datos personales',
  'Carrera y ciclo',
  'Subir documentos',
  'Contrato',
];

const AltaAlumno = () => {
  const [pasoActual, setPasoActual] = useState(1);
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isWeb = Platform.OS === 'web';
  
  // Estado global del formulario
  const {
    form,
    setForm,
    generarMatriculaUnica,
    carreras,
    fetchCarreras,
    ciclos,
    fetchCiclos,
    registrarAlumno,
    // Archivos del hook
    fileCurp, setFileCurp,
    fileActa, setFileActa,
    fileCert, setFileCert,
    filePago, setFilePago,
  } = useRegistroAlumno();

  React.useEffect(() => {
    // Solo asignar matrícula si no existe
    if (!form.matricula) {
      generarMatriculaUnica().then(matricula => {
        setForm(prev => ({ ...prev, matricula }));
      }).catch(() => {
        setForm(prev => ({ ...prev, matricula: '' }));
      });
    }
    // Obtener carreras al montar
    fetchCarreras();
  }, []);

  // Cuando cambia la carrera seleccionada, obtener ciclos
  React.useEffect(() => {
    if (form.carreraId) {
      fetchCiclos(form.carreraId);
    }
  }, [form.carreraId]);

  // Cuando cambian los ciclos, asignar el primer ciclo automáticamente (siempre que haya ciclos)
  React.useEffect(() => {
    if (ciclos.length > 0) {
      setForm(prev => ({ ...prev, cicloAuto: ciclos[0].nombre }));
    } else {
      setForm(prev => ({ ...prev, cicloAuto: '' }));
    }
  }, [ciclos]);
  
  // Estado para feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState<string | undefined>(undefined);

  // Navegación entre pasos
  const siguientePaso = () => setPasoActual(p => Math.min(p + 1, PASOS.length));
  const pasoAnterior = () => setPasoActual(p => Math.max(p - 1, 1));

  // Finalizar registro (ahora sí guarda en Supabase con archivos)
  const finalizarRegistro = async () => {
    setLoading(true);
    setError(undefined);
    setSuccess(undefined);
    try {
      // Verificar que el pago esté subido (obligatorio)
      if (!filePago) {
        throw new Error('El comprobante de pago es obligatorio para completar el registro');
      }
      
      await registrarAlumno();
      setSuccess('¡Registro exitoso! Los documentos han sido subidos correctamente.');
    } catch (err: any) {
      setError(err.message || 'Error al registrar alumno');
    }
    setLoading(false);
  };

  // Render dinámico de pasos
  const renderPaso = () => {
    // No mostrar paso 1 hasta que la matrícula esté lista
    if (pasoActual === 1 && !form.matricula) {
      return <Text style={{marginTop: 32, fontSize: 16}}>Generando matrícula...</Text>;
    }
    switch (pasoActual) {
      case 1:
        return (
          <Paso1DatosPersonales
            datos={form}
            setDatos={setForm}
            onSiguiente={siguientePaso}
          />
        );
      case 2:
        return (
          <Paso2CarreraCiclo
            datos={form}
            setDatos={setForm}
            carreras={carreras}
            ciclos={ciclos}
            onSiguiente={siguientePaso}
            onAtras={pasoAnterior}
          />
        );
      case 3:
        return (
          <Paso3SubirDocumentos
            fileCurp={fileCurp}
            setFileCurp={setFileCurp}
            fileActa={fileActa}
            setFileActa={setFileActa}
            fileCert={fileCert}
            setFileCert={setFileCert}
            filePago={filePago}
            setFilePago={setFilePago}
            onSiguiente={siguientePaso}
            onAtras={pasoAnterior}
          />
        );
      case 4:
        return (
          <Paso4Contrato
            contrato={generarContrato()}
            contratoAceptado={form.contratoAceptado}
            setContratoAceptado={v => setForm(f => ({ ...f, contratoAceptado: v }))}
            onFinalizar={finalizarRegistro}
            onAtras={pasoAnterior}
            loading={loading}
            error={error}
            success={success}
          />
        );
      default:
        return null;
    }
  };

  // Generar contrato con información de documentos
  const generarContrato = () => {
    const documentosSubidos = [];
    if (fileCurp) documentosSubidos.push('CURP');
    if (fileActa) documentosSubidos.push('Acta de nacimiento');
    if (fileCert) documentosSubidos.push('Certificado de preparatoria');
    if (filePago) documentosSubidos.push('Comprobante de pago');

    const documentosFaltantes = [];
    if (!fileCurp) documentosFaltantes.push('CURP');
    if (!fileActa) documentosFaltantes.push('Acta de nacimiento');
    if (!fileCert) documentosFaltantes.push('Certificado de preparatoria');

    let prorroga = '';
    if (documentosFaltantes.length > 0) {
      prorroga = `\n\n⚠️ DOCUMENTOS PENDIENTES: ${documentosFaltantes.join(', ')}.\nSe otorga una prórroga de 3 meses para entregarlos. De lo contrario, se dará de baja al alumno.`;
    }

    return `CONTRATO DE INSCRIPCIÓN

DATOS DEL ALUMNO:
Nombre: ${form.nombre} ${form.apellidos}
Email: ${form.email}
Matrícula: ${form.matricula}
Carrera: ${carreras.find(c => c.id === form.carreraId)?.nombre || 'No seleccionada'}
Ciclo: ${form.cicloAuto}
Grupo: ${form.grupo}

DOCUMENTOS ENTREGADOS:
${documentosSubidos.length > 0 ? documentosSubidos.join(', ') : 'Ninguno'}

${prorroga}

TÉRMINOS Y CONDICIONES:
- El alumno se compromete a entregar los documentos faltantes en un plazo máximo de 3 meses
- La falta de entrega de documentos en el plazo establecido resultará en la baja automática
- El comprobante de pago es obligatorio para la inscripción
- El alumno acepta cumplir con el reglamento interno de la institución

FECHA: ${new Date().toLocaleDateString('es-MX')}`;
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={[styles.scroll, isMobile && styles.scrollMobile]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, isMobile && styles.contentMobile]}>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Registro de Alumno</Text>

            <View style={styles.progressContainer}>
              <Text style={styles.stepText}>
                Paso {pasoActual} de {PASOS.length}: {PASOS[pasoActual - 1]}
              </Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${(pasoActual / PASOS.length) * 100}%` }]} />
              </View>
            </View>

            {renderPaso()}
          </View>

          {/* Documento dinámico - solo en web */}
          {!isMobile && (
            <View style={styles.documentContainer}>
              {/* Aquí puedes agregar el componente de documento si lo necesitas */}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scroll: {
    padding: 20,
  },
  scrollMobile: {
    paddingBottom: 120, // Espacio para la tab bar en móvil
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contentMobile: {
    flexDirection: 'column',
  },
  formContainer: {
    flex: 1,
    marginRight: 24,
    alignItems: 'flex-start',
  },
  documentContainer: {
    width: 300,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#121417',
  },
  progressContainer: {
    marginBottom: 24,
    width: 280,
  },
  stepText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#121417',
  },
  progressBar: {
    height: 4,
    width: '100%',
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
  },
  progressFill: {
    height: 4,
    backgroundColor: '#121417',
    borderRadius: 2,
  },
});

export default AltaAlumno;
