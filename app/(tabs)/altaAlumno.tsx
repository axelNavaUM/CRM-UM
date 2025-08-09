import { ScreenAccessControl } from '@/components/ui/ScreenAccessControl';
import { useAuth } from '@/context/AuthContext';
import { RegistroAlumnoModel } from '@/models/registroAlumnoModel';
import { subirArchivosBucket } from '@/services/subirArchivoBucket';
import { supabase } from '@/services/supabase/supaConf';
import { useRegistroAlumnoStore } from '@/store/registroDeAlumno/datosAlumnoStore';
import { Stack } from 'expo-router';
import React, { useRef, useState } from 'react';
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

const AltaAlumnoContent = () => {
  // Usar Zustand store para persistencia real
  const pasoActual = useRegistroAlumnoStore(state => state.pasoActual);
  const setPaso = useRegistroAlumnoStore(state => state.setPaso);
  const alumno = useRegistroAlumnoStore(state => state.alumno);
  const setAlumno = useRegistroAlumnoStore(state => state.setAlumno);
  const documentos = useRegistroAlumnoStore(state => state.documentos);
  const setDocumento = useRegistroAlumnoStore(state => state.setDocumento);
  const pago = useRegistroAlumnoStore(state => state.pago);
  const setPago = useRegistroAlumnoStore(state => state.setPago);
  const contratoAceptado = useRegistroAlumnoStore(state => state.contratoAceptado);
  const setContratoAceptado = useRegistroAlumnoStore(state => state.setContratoAceptado);
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isWeb = Platform.OS === 'web';

  // Carreras y ciclos del store
  const carreras = useRegistroAlumnoStore(state => state.carreras);
  const ciclos = useRegistroAlumnoStore(state => state.ciclos);
  const fetchCarreras = useRegistroAlumnoStore(state => state.fetchCarreras);
  const fetchCiclos = useRegistroAlumnoStore(state => state.fetchCiclos);

  const { user } = useAuth();

  React.useEffect(() => {
    // Solo asignar matrícula si no existe
    if (!(alumno as any).matricula) {
      useRegistroAlumnoStore.getState().generateMatriculaUnica().catch(() => {});
    }
    // Obtener carreras al montar
    fetchCarreras();
  }, []);

  // Cuando cambia la carrera seleccionada, obtener ciclos
  React.useEffect(() => {
    if ((alumno as any).carreraId) {
      fetchCiclos(Number((alumno as any).carreraId));
    }
  }, [(alumno as any).carreraId]);

  // Cuando cambian los ciclos, asignar el primer ciclo automáticamente (siempre que haya ciclos)
  React.useEffect(() => {
    if (ciclos.length > 0) {
      setAlumno({ ...(alumno as any), cicloAuto: ciclos[0].nombre });
    } else {
      setAlumno({ ...(alumno as any), cicloAuto: '' });
    }
  }, [ciclos]);
  
  // Estado para feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState<string | undefined>(undefined);
  const isSubmittingRef = useRef(false);

  // Navegación entre pasos
  const siguientePaso = () => setPaso(Math.min(pasoActual + 1, PASOS.length));
  const pasoAnterior = () => setPaso(Math.max(pasoActual - 1, 1));

  // Finalizar registro usando los datos y archivos del store
  const finalizarRegistro = async () => {
    if (loading || isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setLoading(true);
    setError(undefined);
    setSuccess(undefined);
    try {
      // LOG para depuración
      console.log('[DEBUG] documentos:', documentos);
      console.log('[DEBUG] documentos["formato_pago"]:', documentos['formato_pago']);
      if (!documentos['formato_pago']) {
        throw new Error('El comprobante de pago es obligatorio para completar el registro');
      }

      // 1. Registrar alumno en la tabla 'alumnos'
      // Obtener el id del asesor desde la tabla usuariosum
      let asesor_id = null;
      if (user?.email) {
        const { data: usuario, error: usuarioError } = await supabase
          .from('usuariosum')
          .select('idusuario')
          .eq('correoinstitucional', user.email)
          .single();
        if (!usuarioError && usuario) {
          asesor_id = usuario.idusuario;
        }
      }
      
      const alumnoData = {
        nombre: (alumno as any).nombre,
        apellidos: (alumno as any).apellidos,
        email: (alumno as any).email,
        matricula: (alumno as any).matricula,
        carrera_id: Number((alumno as any).carreraId),
        ciclo_id: Number(ciclos.find(c => c.nombre === (alumno as any).cicloAuto)?.id),
        status: 'pendiente',
        asesor_id: asesor_id,
      };
      const alumnoRegistrado = await RegistroAlumnoModel.registrarAlumno(alumnoData);

      // 2. Construir array de archivos a subir
      const archivos = [];
      if (documentos['curp']) {
        archivos.push({
          fileUri: documentos['curp'].uri || documentos['curp'],
          tipoDocumento: 'curp',
          extension: 'pdf',
          area: 'alumnos',
          carrera: (useRegistroAlumnoStore.getState().carreras.find((c:any) => c.id === (alumno as any).carreraId)?.nombre || String((alumno as any).carreraId) || '').toString(),
          ciclo: (alumno as any).cicloAuto || '',
          grupo: (alumno as any).grupo || 'sin_grupo',
          matricula: (alumno as any).matricula || '',
        });
      }
      if (documentos['acta']) {
        archivos.push({
          fileUri: documentos['acta'].uri || documentos['acta'],
          tipoDocumento: 'acta',
          extension: 'pdf',
          area: 'alumnos',
          carrera: (useRegistroAlumnoStore.getState().carreras.find((c:any) => c.id === (alumno as any).carreraId)?.nombre || String((alumno as any).carreraId) || '').toString(),
          ciclo: (alumno as any).cicloAuto || '',
          grupo: (alumno as any).grupo || 'sin_grupo',
          matricula: (alumno as any).matricula || '',
        });
      }
      if (documentos['certificado_prepa']) {
        archivos.push({
          fileUri: documentos['certificado_prepa'].uri || documentos['certificado_prepa'],
          tipoDocumento: 'certificado_prepa',
          extension: 'pdf',
          area: 'alumnos',
          carrera: (useRegistroAlumnoStore.getState().carreras.find((c:any) => c.id === (alumno as any).carreraId)?.nombre || String((alumno as any).carreraId) || '').toString(),
          ciclo: (alumno as any).cicloAuto || '',
          grupo: (alumno as any).grupo || 'sin_grupo',
          matricula: (alumno as any).matricula || '',
        });
      }
      if (documentos['formato_pago']) {
        archivos.push({
          fileUri: documentos['formato_pago'].uri || documentos['formato_pago'],
          tipoDocumento: 'formato_pago',
          extension: 'pdf',
          area: 'alumnos',
          carrera: (useRegistroAlumnoStore.getState().carreras.find((c:any) => c.id === (alumno as any).carreraId)?.nombre || String((alumno as any).carreraId) || '').toString(),
          ciclo: (alumno as any).cicloAuto || '',
          grupo: (alumno as any).grupo || 'sin_grupo',
          matricula: (alumno as any).matricula || '',
        });
      }

      // 3. Subir archivos
      let resultados: {url: string|null, error: string|null}[] = [];
      if (archivos.length > 0) {
        try {
          console.log('[DEBUG] Iniciando subida de archivos:', archivos.length);
          resultados = await subirArchivosBucket(archivos);
          const errores = resultados.filter(r => r.error);
          if (errores.length > 0) {
            console.error('[DEBUG] Errores en subida:', errores);
            throw new Error('Error al subir uno o más archivos: ' + errores.map(e => e.error).join(', '));
          }
          console.log('[DEBUG] Todos los archivos subidos correctamente');
        } catch (uploadError: any) {
          console.error('[DEBUG] Error en subida de archivos:', uploadError);
          if (uploadError.message.includes('Network request failed')) {
            throw new Error('Error de conexión al subir archivos. Verifica tu conexión a internet e intenta de nuevo.');
          }
          throw new Error(`Error al subir archivos: ${uploadError.message}`);
        }
      }

      // 4. Registrar documentos en la tabla documentos_alumno
      for (let i = 0; i < resultados.length; i++) {
        const resultado = resultados[i];
        if (resultado.url) {
          await RegistroAlumnoModel.subirDocumento({
            alumno_id: alumnoRegistrado.id,
            tipo_documento: archivos[i].tipoDocumento,
            url_archivo: resultado.url,
          });
        }
      }

      // 5. Registrar pago en la tabla pagos
      await RegistroAlumnoModel.registrarPago({
        alumno_id: alumnoRegistrado.id,
        modo_pago: 'efectivo', // O usa el modo real si lo tienes en el formulario
        status: 'pendiente',
      });

      // 6. Verificar si todos los documentos están completos y actualizar status
      const documentosCompletos = await RegistroAlumnoModel.verificarDocumentosCompletos(alumnoRegistrado.id);
      
      if (documentosCompletos) {
        await RegistroAlumnoModel.actualizarStatusAlumno(alumnoRegistrado.id, 'activo');
        console.log('✅ Alumno registrado con todos los documentos - Status actualizado a "activo"');
      } else {
        console.log('⚠️ Alumno registrado con documentos pendientes - Status permanece "pendiente"');
      }

      setSuccess('¡Registro exitoso! Los documentos han sido subidos y registrados correctamente.');

      // Resetear flujo para nuevo ingreso
      try {
        useRegistroAlumnoStore.getState().limpiarRegistro();
        setPaso(1);
        // Generar nueva matrícula para el siguiente registro
        await useRegistroAlumnoStore.getState().generateMatriculaUnica();
      } catch {}
    } catch (err: any) {
      console.error('[DEBUG] Error completo en registro:', err);
      
      let errorMessage = 'Error al registrar alumno';
      
      if (err.message) {
        if (err.message.includes('Network request failed')) {
          errorMessage = 'Error de conexión. Verifica tu conexión a internet e intenta de nuevo.';
        } else if (err.message.includes('fetch')) {
          errorMessage = 'Error al procesar archivos. Verifica que los archivos sean válidos.';
        } else if (err.message.includes('Supabase')) {
          errorMessage = 'Error en la base de datos. Intenta de nuevo en unos momentos.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  // Render dinámico de pasos usando el store
  const renderPaso = () => {
    // Asegura que los campos requeridos existen
    const fileActa = (documentos['acta'] as any) || null;
    const fileCert = (documentos['certificado_prepa'] as any) || null;
    const filePago = (documentos['formato_pago'] as any) || (pago as any) || null;
    const contrato = generarContrato();
    return {
      1: (
        <Paso1DatosPersonales
          datos={{
            nombre: (alumno as any).nombre || '',
            apellidos: (alumno as any).apellidos || '',
            email: (alumno as any).email || '',
            matricula: (alumno as any).matricula || '',
          }}
          setDatos={setAlumno}
          onSiguiente={siguientePaso}
        />
      ),
      2: (
        <Paso2CarreraCiclo
          datos={alumno as any}
          setDatos={setAlumno}
          carreras={carreras as any}
          ciclos={ciclos as any}
          onSiguiente={siguientePaso}
          onAtras={pasoAnterior}
        />
      ),
      3: (
        <Paso3SubirDocumentos
          fileCurp={(documentos['curp'] as any) || null}
          setFileCurp={file => setDocumento('curp', file)}
          fileActa={fileActa}
          setFileActa={file => setDocumento('acta', file)}
          fileCert={fileCert}
          setFileCert={file => setDocumento('certificado_prepa', file)}
          filePago={filePago}
          setFilePago={file => setDocumento('formato_pago', file)}
          onSiguiente={siguientePaso}
          onAtras={pasoAnterior}
        />
      ),
      4: (
        <Paso4Contrato
          contrato={contrato}
          contratoAceptado={contratoAceptado}
          setContratoAceptado={setContratoAceptado}
          onFinalizar={finalizarRegistro}
          onAtras={pasoAnterior}
          loading={loading}
          error={error}
          success={success}
        />
      ),
    }[pasoActual] || null;
  };

  // Generar contrato con información de documentos
  const generarContrato = () => {
    const documentosSubidos = [];
    if (documentos['acta']) documentosSubidos.push('Acta de nacimiento');
    if (documentos['certificado_prepa']) documentosSubidos.push('Certificado de preparatoria');
    if (documentos['formato_pago'] || pago) documentosSubidos.push('Comprobante de pago');

    const documentosFaltantes = [];
    if (!documentos['acta']) documentosFaltantes.push('Acta de nacimiento');
    if (!documentos['certificado_prepa']) documentosFaltantes.push('Certificado de preparatoria');

    let prorroga = '';
    if (documentosFaltantes.length > 0) {
      prorroga = `\n\n⚠️ DOCUMENTOS PENDIENTES: ${documentosFaltantes.join(', ')}.\nSe otorga una prórroga de 3 meses para entregarlos. De lo contrario, se dará de baja al alumno.`;
    }

    return `CONTRATO DE INSCRIPCIÓN

DATOS DEL ALUMNO:
Nombre: ${(alumno as any).nombre} ${(alumno as any).apellidos}
Email: ${(alumno as any).email}
Matrícula: ${(alumno as any).matricula}
Carrera: ${'No seleccionada'}
Ciclo: ${(alumno as any).cicloAuto}
Grupo: ${(alumno as any).grupo}

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
              <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#111827' }}>
                Vista previa de contrato
              </Text>
              <View style={{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, backgroundColor: '#FAFAFA', padding: 12, maxHeight: 520 }}>
                <ScrollView showsVerticalScrollIndicator>
                  <Text style={{ fontFamily: Platform.OS === 'web' ? 'monospace' as any : undefined, whiteSpace: 'pre-wrap' as any, lineHeight: 20, color: '#111827' }}>
                    {generarContrato()}
                  </Text>
                </ScrollView>
              </View>
              <Text style={{ marginTop: 8, fontSize: 12, color: '#6B7280' }}>
                Esta vista previa se actualiza en tiempo real conforme llenas el formulario.
              </Text>
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
    width: 360,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    alignSelf: 'flex-start',
    maxHeight: 640,
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

const AltaAlumno = () => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  return (
    <>
      {isMobile && (
        <Stack.Screen options={{ headerShown: false }} />
      )}
      <ScreenAccessControl requiredScreen="altaAlumno" fallbackScreen="/">
        <AltaAlumnoContent />
      </ScreenAccessControl>
    </>
  );
};

export default AltaAlumno;
