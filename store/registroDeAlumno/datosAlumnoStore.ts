import type { Alumno, Carrera, Ciclo, DocumentoAlumno, Pago } from '@/models/registroAlumnoModel';
import { create } from 'zustand';

/**
 * Estado del registro de alumno paso a paso.
 */
export interface RegistroAlumnoState {
  pasoActual: number;
  alumno: Partial<Alumno>;
  carreraSeleccionada?: Carrera;
  cicloSeleccionado?: Ciclo;
  documentos: Partial<Record<DocumentoAlumno['tipo_documento'], DocumentoAlumno>>;
  pago?: Pago;
  contratoAceptado: boolean;
  setPaso: (paso: number) => void;
  setAlumno: (alumno: Partial<Alumno>) => void;
  setCarrera: (carrera: Carrera) => void;
  setCiclo: (ciclo: Ciclo) => void;
  setDocumento: (tipo: DocumentoAlumno['tipo_documento'], doc: DocumentoAlumno) => void;
  setPago: (pago: Pago) => void;
  setContratoAceptado: (aceptado: boolean) => void;
  limpiarRegistro: () => void;
}

/**
 * Store Zustand para el registro de alumno.
 */
export const useRegistroAlumnoStore = create<RegistroAlumnoState>((set) => ({
  pasoActual: 1,
  alumno: {},
  carreraSeleccionada: undefined,
  cicloSeleccionado: undefined,
  documentos: {},
  pago: undefined,
  contratoAceptado: false,
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
}));
    

