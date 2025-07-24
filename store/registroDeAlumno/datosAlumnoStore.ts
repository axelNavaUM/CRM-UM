import type { Alumno, Carrera, Ciclo, DocumentoAlumno, Pago } from '@/models/registroAlumnoModel';
import { RegistroAlumnoModel } from '@/models/registroAlumnoModel';
import { supabase } from '@/services/supabase/supaConf';
import { create } from 'zustand';

// Extiende los tipos de documento permitidos para incluir 'curp'
type TipoDocumentoExtendido = DocumentoAlumno['tipo_documento'] | 'curp';

/**
 * Estado del registro de alumno paso a paso.
 */
export interface RegistroAlumnoState {
  pasoActual: number;
  alumno: Partial<Alumno>;
  carreraSeleccionada?: Carrera;
  cicloSeleccionado?: Ciclo;
  documentos: Partial<Record<TipoDocumentoExtendido, DocumentoAlumno>>;
  pago?: Pago;
  contratoAceptado: boolean;
  carreras: Carrera[];
  ciclos: Ciclo[];
  fetchCarreras: () => Promise<void>;
  fetchCiclos: (carreraId: number) => Promise<void>;
  setPaso: (paso: number) => void;
  setAlumno: (alumno: Partial<Alumno>) => void;
  setCarrera: (carrera: Carrera) => void;
  setCiclo: (ciclo: Ciclo) => void;
  setDocumento: (tipo: DocumentoAlumno['tipo_documento'], doc: DocumentoAlumno) => void;
  setPago: (pago: Pago) => void;
  setContratoAceptado: (aceptado: boolean) => void;
  limpiarRegistro: () => void;
  generateMatriculaUnica: () => Promise<void>;
}

/**
 * Store Zustand para el registro de alumno.
 */
export const useRegistroAlumnoStore = create<RegistroAlumnoState>((set, get) => ({
  pasoActual: 1,
  alumno: {},
  carreraSeleccionada: undefined,
  cicloSeleccionado: undefined,
  documentos: {},
  pago: undefined,
  contratoAceptado: false,
  carreras: [],
  ciclos: [],
  fetchCarreras: async () => {
    const { data, error } = await supabase.from('carreras').select('*');
    if (!error) set({ carreras: data || [] });
  },
  fetchCiclos: async (carreraId: number) => {
    const { data, error } = await supabase.from('ciclos').select('*').eq('carrera_id', carreraId);
    if (!error) set({ ciclos: data || [] });
  },
  setPaso: (paso) => set({ pasoActual: paso }),
  setAlumno: (alumno) => set((state) => ({ alumno: { ...state.alumno, ...alumno } })),
  setCarrera: (carrera) => set({ carreraSeleccionada: carrera }),
  setCiclo: (ciclo) => set({ cicloSeleccionado: ciclo }),
  setDocumento: (tipo, doc) => set((state) => ({ documentos: { ...state.documentos, [tipo]: doc } })),
  setPago: (pago) => set({ pago }),
  setContratoAceptado: (aceptado) => set({ contratoAceptado: aceptado }),
  limpiarRegistro: () => set({
    pasoActual: 1,
    alumno: {},
    carreraSeleccionada: undefined,
    cicloSeleccionado: undefined,
    documentos: {},
    pago: undefined,
    contratoAceptado: false,
  }),
  generateMatriculaUnica: async () => {
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
    set((state) => ({ alumno: { ...state.alumno, matricula } }));
  },
}));
    

