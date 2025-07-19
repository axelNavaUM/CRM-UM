import { useAuth } from '@/context/AuthContext';
import { RegistroAlumnoModel } from '@/models/registroAlumnoModel';
import { subirArchivosBucket } from '@/services/subirArchivoBucket';
import { useState } from 'react';
import { supabase } from '../../services/supabase/supaConf';

export function useRegistroAlumno() {
  // Estado del formulario extendido
  const [form, setForm] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    matricula: '',
    carreraId: undefined as number | undefined,
    cicloAuto: '',
    grupo: 'A',
    plantel: 'principal', // NUEVO: default plantel
    area: 'ventas',
    pasoActual: 1,
    contratoAceptado: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Archivos por tipo
  const [fileCurp, setFileCurp] = useState<any>(null);
  const [fileActa, setFileActa] = useState<any>(null);
  const [fileCert, setFileCert] = useState<any>(null);
  const [filePago, setFilePago] = useState<any>(null);
  // Puedes agregar más tipos si lo necesitas

  // Carreras y ciclos
  const [carreras, setCarreras] = useState<any[]>([]);
  const [ciclos, setCiclos] = useState<any[]>([]);

  const { user } = useAuth();

  /**
   * Maneja el cambio de campos del formulario
   */
  const handleChange = (field: string) => (value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  /**
   * Cambia el paso actual del formulario
   */
  const setPaso = (paso: number) => {
    setForm((prev) => ({ ...prev, pasoActual: paso }));
  };
  const siguientePaso = () => setPaso(form.pasoActual + 1);
  const pasoAnterior = () => setPaso(form.pasoActual - 1);

  /**
   * Cambia el estado de contratoAceptado
   */
  const setContratoAceptado = (aceptado: boolean) => {
    setForm((prev) => ({ ...prev, contratoAceptado: aceptado }));
  };

  /**
   * Obtiene las carreras desde Supabase
   */
  const fetchCarreras = async () => {
    const { data, error } = await supabase.from('carreras').select('*');
    if (!error) setCarreras(data || []);
  };

  /**
   * Obtiene los ciclos de una carrera desde Supabase
   */
  const fetchCiclos = async (carreraId: number) => {
    const { data, error } = await supabase.from('ciclos').select('*').eq('carrera_id', carreraId);
    if (!error) setCiclos(data || []);
  };

  /**
   * Genera el contrato como string (puedes cambiar a PDF si lo necesitas)
   */
  const generarContrato = () => {
    // Detectar documentos faltantes
    const faltantes: string[] = [];
    if (!fileCurp) faltantes.push('CURP');
    if (!fileActa) faltantes.push('Acta de nacimiento');
    if (!fileCert) faltantes.push('Certificado');
    let prorroga = '';
    if (faltantes.length > 0) {
      prorroga = `\n\nFaltan los siguientes documentos: ${faltantes.join(', ')}. Se otorga una prórroga de 3 meses para entregarlos. De lo contrario, se dará de baja al alumno.`;
    }
    return `CONTRATO DE INSCRIPCIÓN\n\nNombre: ${form.nombre} ${form.apellidos}\nEmail: ${form.email}\nCarrera: ${carreras.find(c => c.id === form.carreraId)?.nombre || ''}\nCiclo: ${form.cicloAuto}\nGrupo: ${form.grupo}\n\nAcepto los términos y condiciones.${prorroga}`;
  };

  /**
   * Genera una matrícula única automáticamente
   */
  const generarMatriculaUnica = async (): Promise<string> => {
    let matricula = '';
    let existe = true;
    let intentos = 0;
    while (existe && intentos < 10) {
      const year = new Date().getFullYear().toString().slice(-2);
      const random = Math.floor(100000 + Math.random() * 900000); // 6 dígitos aleatorios
      matricula = `62${year}${random}`;
      existe = await RegistroAlumnoModel.existeMatricula(matricula);
      intentos++;
    }
    if (existe) throw new Error('No se pudo generar una matrícula única.');
    return matricula;
  };

  /**
   * Registra al alumno y sube los archivos uno por uno (incluyendo el contrato)
   * - Obtiene el usuario de la sesión
   * - Consulta Supabase para obtener el id del asesor usando el email
   * - Inserta ese id en el campo asesor_id al registrar el alumno
   */
  const registrarAlumno = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      console.log('Intentando guardar alumno en Supabase:', form);
      // Buscar el ciclo_id correspondiente al cicloAuto
      const cicloSeleccionado = ciclos.find(c => c.nombre === form.cicloAuto);
      // 1. Obtener el id del asesor desde Supabase usando el email de la sesión
      let asesor_id = null;
      if (user?.email) {
        let usuario = null;
        let usuarioError = null;
        try {
          const res = await supabase
            .from('usuariosum')
            .select('idusuario')
            .eq('correoinstitucional', user.email)
            .single();
          usuario = res.data;
          usuarioError = res.error;
        } catch (e) {
          usuarioError = e;
        }
        if (usuarioError || !usuario) {
          throw new Error('El usuario asesor no está registrado en el sistema. Contacta a soporte.');
        } else {
          asesor_id = usuario.idusuario;
        }
      } else {
        throw new Error('No hay usuario en sesión.');
      }
      if (!form.carreraId) throw new Error('Debes seleccionar una carrera.');
      if (!cicloSeleccionado) throw new Error('Debes seleccionar un ciclo.');
      // 2. Registrar alumno en la tabla 'alumnos' con asesor_id y status
      const alumnoData = {
        nombre: form.nombre,
        apellidos: form.apellidos,
        email: form.email,
        matricula: form.matricula,
        carrera_id: Number(form.carreraId),
        ciclo_id: Number(cicloSeleccionado.id),
        status: 'pendiente',
        asesor_id: asesor_id, // <-- Se inserta el id del asesor
      };
      console.log('Datos a guardar:', alumnoData);
      const alumno = await RegistroAlumnoModel.registrarAlumno(alumnoData);
      console.log('Alumno guardado en Supabase:', alumno);

      // Subir archivos al bucket de Supabase
      const archivos = [];
      
      if (fileCurp) {
        archivos.push({
          fileUri: fileCurp.uri || fileCurp,
          area: form.area,
          carrera: carreras.find(c => c.id === form.carreraId)?.nombre || '',
          ciclo: form.cicloAuto,
          grupo: form.grupo,
          matricula: form.matricula,
          tipoDocumento: 'curp',
          extension: 'pdf',
        });
      }
      
      if (fileActa) {
        archivos.push({
          fileUri: fileActa.uri || fileActa,
          area: form.area,
          carrera: carreras.find(c => c.id === form.carreraId)?.nombre || '',
          ciclo: form.cicloAuto,
          grupo: form.grupo,
          matricula: form.matricula,
          tipoDocumento: 'acta',
          extension: 'pdf',
        });
      }
      
      if (fileCert) {
        archivos.push({
          fileUri: fileCert.uri || fileCert,
          area: form.area,
          carrera: carreras.find(c => c.id === form.carreraId)?.nombre || '',
          ciclo: form.cicloAuto,
          grupo: form.grupo,
          matricula: form.matricula,
          tipoDocumento: 'certificado_prepa',
          extension: 'pdf',
        });
      }
      
      if (filePago) {
        archivos.push({
          fileUri: filePago.uri || filePago,
          area: form.area,
          carrera: carreras.find(c => c.id === form.carreraId)?.nombre || '',
          ciclo: form.cicloAuto,
          grupo: form.grupo,
          matricula: form.matricula,
          tipoDocumento: 'formato_pago',
          extension: 'pdf',
        });
      }

      if (archivos.length > 0) {
        const resultados = await subirArchivosBucket(archivos);
        console.log('Resultados de subida de archivos:', resultados);
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Error desconocido');
      console.error('Error al guardar alumno:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    setForm,
    handleChange,
    loading,
    error,
    success,
    registrarAlumno,
    setPaso,
    siguientePaso,
    pasoAnterior,
    setContratoAceptado,
    // Archivos por tipo
    fileCurp, setFileCurp,
    fileActa, setFileActa,
    fileCert, setFileCert,
    filePago, setFilePago,
    // Carreras y ciclos
    carreras, fetchCarreras,
    ciclos, fetchCiclos,
    // Contrato
    generarContrato,
    // Matricula
    generarMatriculaUnica,
  };
} 