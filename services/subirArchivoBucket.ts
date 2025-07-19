import { supabase } from '@/services/supabase/supaConf';

type ArchivoInfo = {
  fileUri: string;
  area: string;
  carrera: string;
  ciclo: string;
  grupo: string;
  matricula: string;
  tipoDocumento: string;
  extension?: string;
};

/**
 * Sube uno o varios archivos a Supabase Storage, asegurando que la carpeta del alumno exista y reportando progreso.
 * @param archivos - Lista de archivos con metadatos
 * @param onProgress - Callback para progreso por archivo (index, porcentaje)
 * @returns Lista de resultados por archivo: {url, error}
 */
export async function subirArchivosBucket(
  archivos: ArchivoInfo[],
  onProgress?: (index: number, porcentaje: number) => void
): Promise<{url: string|null, error: string|null}[]> {
  const resultados: {url: string|null, error: string|null}[] = [];

  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png'
  ];

  if (!archivos.length) return resultados;

  // 1. Determinar la carpeta del alumno
  const { area, carrera, ciclo, grupo, matricula } = archivos[0];
  const safePath = [
    area, carrera, ciclo, grupo || 'sin_grupo', matricula
  ].map(s => s.replace(/\s+/g, '_').toLowerCase()).join('/');

  // 2. Verificar si la carpeta existe (list)
  try {
    const { data: folderFiles, error: folderError } = await supabase
      .storage
      .from('crmum')
      .list(safePath, { limit: 1 });
    if (folderError) {
      console.warn('⚠️ Error al verificar carpeta, se intentará crear placeholder:', folderError.message);
    }
    // 3. Si la carpeta no existe (o está vacía), subir un placeholder
    if (!folderFiles || folderFiles.length === 0) {
      const placeholderPath = `${safePath}/.placeholder.txt`;
      const { error: placeholderError } = await supabase
        .storage
        .from('crmum')
        .upload(placeholderPath, new Blob(['placeholder']), {
          upsert: true,
          contentType: 'text/plain'
        });
      if (placeholderError) {
        console.warn('⚠️ No se pudo crear placeholder:', placeholderError.message);
      } else {
        console.log('📁 Carpeta del alumno creada con placeholder:', placeholderPath);
      }
    }
  } catch (e) {
    console.warn('⚠️ Error inesperado al crear/verificar carpeta:', e);
  }

  // 4. Subir archivos uno por uno, reportando progreso
  for (let i = 0; i < archivos.length; i++) {
    const {
      fileUri,
      area,
      carrera,
      ciclo,
      grupo,
      matricula,
      tipoDocumento,
      extension = 'pdf'
    } = archivos[i];
    try {
      if (!fileUri?.trim()) throw new Error('URI del archivo no válido');
      let mimeType = 'application/octet-stream';
      let blob: Blob;
      if (fileUri.startsWith('data:')) {
        const matches = fileUri.match(/^data:([^;]+);base64,(.+)$/);
        if (!matches) throw new Error('Formato de data URI inválido');
        mimeType = matches[1];
        if (!allowedMimeTypes.includes(mimeType)) {
          throw new Error(`Tipo de archivo no permitido: ${mimeType}`);
        }
        const byteCharacters = atob(matches[2]);
        const byteArray = new Uint8Array([...byteCharacters].map(c => c.charCodeAt(0)));
        blob = new Blob([byteArray], { type: mimeType });
      } else {
        const response = await fetch(fileUri);
        if (!response.ok) {
          throw new Error(`Error al obtener el archivo: ${response.statusText}`);
        }
        blob = await response.blob();
        mimeType = blob.type || mimeType;
        if (!allowedMimeTypes.includes(mimeType)) {
          throw new Error(`Tipo de archivo no permitido: ${mimeType}`);
        }
      }
      if (blob.size > 10 * 1024 * 1024) {
        throw new Error('El archivo es demasiado grande. Máximo 10MB permitido.');
      }
      const storagePath = `${safePath}/${tipoDocumento.toLowerCase()}_${Date.now()}.${extension}`;
      // Progreso simulado (ya que Supabase JS no da progreso real en upload)
      if (onProgress) onProgress(i, 10);
      const { error: uploadError } = await supabase
        .storage
        .from('crmum')
        .upload(storagePath, blob, {
          upsert: true,
          contentType: mimeType
        });
      if (onProgress) onProgress(i, 100);
      if (uploadError) {
        if (uploadError.message.includes('Request Header Or Cookie Too Large')) {
          throw new Error('El archivo es demasiado grande para subir. Intenta con un archivo menor a 5MB.');
        }
        throw uploadError;
      }
      const { publicUrl } = supabase
        .storage
        .from('crmum')
        .getPublicUrl(storagePath).data;
      if (!publicUrl) {
        throw new Error('No se pudo obtener la URL pública del archivo');
      }
      resultados.push({ url: publicUrl, error: null });
      console.log(`✅ Archivo subido correctamente: ${publicUrl}`);
    } catch (error: any) {
      resultados.push({ url: null, error: error.message });
      if (onProgress) onProgress(i, 0);
      console.error(`❌ Error al subir el archivo ${i + 1}:`, error.message || error);
    }
  }
  return resultados;
}
