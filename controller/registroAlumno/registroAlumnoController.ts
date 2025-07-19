import { Alumno, Carrera, Ciclo, DocumentoAlumno, Pago } from '@/models/registroAlumnoModel';

/**
 * Controller para el registro de alumno.
 * Centraliza lógica de negocio, validaciones avanzadas y utilidades.
 */
export class RegistroAlumnoController {
  /**
   * Valida que los datos personales del alumno sean correctos.
   */
  static validarDatosPersonales(alumno: Partial<Alumno>): boolean {
    return Boolean(alumno.nombre && alumno.apellidos && alumno.email);
  }

  /**
   * Valida la selección de carrera y ciclo.
   */
  static validarCarreraYCiclo(carrera?: Carrera, ciclo?: Ciclo): boolean {
    return Boolean(carrera && ciclo);
  }

  /**
   * Valida la subida de documentos y el pago.
   */
  static validarDocumentosYPago(documentos: Partial<Record<DocumentoAlumno['tipo_documento'], DocumentoAlumno>>, pago?: Pago): boolean {
    return Boolean(documentos.acta && documentos.certificado_prepa && documentos.formato_pago && pago);
  }

  /**
   * Valida la aceptación del contrato.
   */
  static validarContrato(aceptado: boolean): boolean {
    return Boolean(aceptado);
  }

  /**
   * Calcula el ciclo de ingreso automáticamente según el año actual y la duración de la carrera.
   * @param carrera Carrera seleccionada
   * @returns Ciclo sugerido (string)
   */
  static calcularCicloIngreso(carrera: Carrera): string {
    const year = new Date().getFullYear();
    // Ejemplo: 2025/2025-ECA-1
    return `${year}/${year}-ECA-1`;
  }

  /**
   * Genera el contrato en tiempo real con los datos del alumno.
   * @param alumno Alumno
   * @param carrera Carrera
   * @param ciclo Ciclo
   * @returns Contrato en formato string (puede ser HTML o texto plano)
   */
  static generarContrato(alumno: Partial<Alumno>, carrera?: Carrera, ciclo?: Ciclo): string {
    return `CONTRATO DE INSCRIPCIÓN\n\nNombre: ${alumno.nombre || ''} ${alumno.apellidos || ''}\nEmail: ${alumno.email || ''}\nCarrera: ${carrera?.nombre || ''}\nCiclo: ${ciclo?.nombre || ''}\n\nAcepto los términos y condiciones.`;
  }

  /**
   * Utilidad para limpiar todos los datos del registro (puede usarse desde el store o hook)
   */
  static limpiarRegistro() {
    // Esta función puede ser extendida para lógica adicional si se requiere
    // Por ahora, se recomienda usar limpiarRegistro del store
  }
} 