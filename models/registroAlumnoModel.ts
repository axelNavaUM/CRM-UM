import { supabase } from '@/services/supabase/supaConf';

/**
 * Representa una carrera universitaria.
 */
export interface Carrera {
  id: number;
  nombre: string;
  duracion_anios: number;
}

/**
 * Representa un ciclo escolar.
 */
export interface Ciclo {
  id: number;
  nombre: string; // Ejemplo: 2025/2025-ECA-1
  fecha_inicio: string; // ISO date
  fecha_fin: string; // ISO date
  carrera_id: number;
}

/**
 * Representa un documento subido por el alumno.
 */
export interface DocumentoAlumno {
  id?: number;
  alumno_id: number;
  tipo_documento: 'acta' | 'certificado_prepa' | 'formato_pago';
  url_archivo: string;
  fecha_subida?: string; // ISO date
}

/**
 * Representa un pago realizado por el alumno.
 */
export interface Pago {
  id?: number;
  alumno_id: number;
  modo_pago: 'tarjeta' | 'efectivo';
  status: 'pendiente' | 'autorizado' | 'rechazado';
  fecha_pago?: string; // ISO date
  pin_cajero?: string;
}

/**
 * Representa un alumno en el sistema.
 */
export interface Alumno {
  id?: number;
  nombre: string;
  apellidos: string;
  email: string;
  telefono?: string;
  carrera_id: number;
  ciclo_id: number;
  status?: string;
  fecha_alta?: string;
  asesor_id?: number;
}

/**
 * Métodos de acceso a datos para el registro de alumnos.
 */
export class RegistroAlumnoModel {
  /** Obtiene todas las carreras disponibles */
  static async getCarreras(): Promise<Carrera[]> {
    const { data, error } = await supabase.from('carreras').select('*');
    if (error) throw error;
    return data as Carrera[];
  }

  /** Obtiene los ciclos de una carrera */
  static async getCiclosPorCarrera(carrera_id: number): Promise<Ciclo[]> {
    const { data, error } = await supabase
      .from('ciclos')
      .select('*')
      .eq('carrera_id', carrera_id);
    if (error) throw error;
    return data as Ciclo[];
  }

  /** Registra un nuevo alumno */
  static async registrarAlumno(alumno: Alumno): Promise<Alumno> {
    const { data, error } = await supabase
      .from('alumnos')
      .insert(alumno)
      .select()
      .single();
    if (error) throw error;
    return data as Alumno;
  }

  /** Sube un documento del alumno */
  static async subirDocumento(documento: DocumentoAlumno): Promise<DocumentoAlumno> {
    const { data, error } = await supabase
      .from('documentos_alumno')
      .insert(documento)
      .select()
      .single();
    if (error) throw error;
    return data as DocumentoAlumno;
  }

  /** Registra un pago */
  static async registrarPago(pago: Pago): Promise<Pago> {
    const { data, error } = await supabase
      .from('pagos')
      .insert(pago)
      .select()
      .single();
    if (error) throw error;
    return data as Pago;
  }

  /** Obtiene los alumnos registrados por un asesor */
  static async getAlumnosPorAsesor(asesor_id: number): Promise<Alumno[]> {
    const { data, error } = await supabase
      .from('alumnos')
      .select('*')
      .eq('asesor_id', asesor_id);
    if (error) throw error;
    return data as Alumno[];
  }

  /** Obtiene los alumnos por status (ej: pendientes para jefe de ventas) */
  static async getAlumnosPorStatus(status: string): Promise<Alumno[]> {
    const { data, error } = await supabase
      .from('alumnos')
      .select('*')
      .eq('status', status);
    if (error) throw error;
    return data as Alumno[];
  }

  /** Registra un documento del alumno con ruta de bucket */
  static async registrarDocumentoRuta(alumno_id: number, tipo_documento: string, ruta: string): Promise<DocumentoAlumno> {
    const { data, error } = await supabase
      .from('documentos_alumno')
      .insert({ alumno_id, tipo_documento, url_archivo: ruta })
      .select()
      .single();
    if (error) throw error;
    return data as DocumentoAlumno;
  }

  /** Verifica si una matrícula ya existe */
  static async existeMatricula(matricula: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('alumnos')
      .select('id')
      .eq('matricula', matricula)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    return !!data;
  }

  /** Actualiza el status del alumno */
  static async actualizarStatusAlumno(alumno_id: number, status: string): Promise<boolean> {
    const { error } = await supabase
      .from('alumnos')
      .update({ status })
      .eq('id', alumno_id);
    
    if (error) throw error;
    return true;
  }

  /** Verifica si un alumno tiene todos los documentos requeridos */
  static async verificarDocumentosCompletos(alumno_id: number): Promise<boolean> {
    const documentosRequeridos = ['acta', 'certificado_prepa', 'formato_pago'];
    
    const { data: documentosSubidos, error } = await supabase
      .from('documentos_alumno')
      .select('tipo_documento')
      .eq('alumno_id', alumno_id);
    
    if (error) throw error;
    
    const tiposSubidos = documentosSubidos.map(doc => doc.tipo_documento);
    return documentosRequeridos.every(doc => tiposSubidos.includes(doc));
  }
} 