import { supabase } from '@/services/supabase/supaConf';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

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
      console.log(`[DEBUG] Intentando subir archivo #${i + 1}:`, fileUri);
      if (!fileUri?.trim()) throw new Error('URI del archivo no válido');
      let mimeType = 'application/octet-stream';
      let blob: Blob | null = null;
      let nativePathForUpload: string | null = null;
      if (fileUri.startsWith('data:')) {
        const matches = fileUri.match(/^data:([^;]+);base64,(.+)$/);
        if (!matches) throw new Error('Formato de data URI inválido');
        mimeType = matches[1];
        if (!allowedMimeTypes.includes(mimeType)) {
          throw new Error(`[DEBUG] Tipo de archivo no permitido: ${mimeType}`);
        }
        const byteCharacters = atob(matches[2]);
        const byteArray = new Uint8Array([...byteCharacters].map(c => c.charCodeAt(0)));
        blob = new Blob([byteArray], { type: mimeType });
      } else if (Platform.OS !== 'web' && (fileUri.startsWith('file://') || fileUri.startsWith('content://'))) {
        // Manejo nativo (Android/iOS): crear blob con fetch(fileUri) o usar RN file descargado en caché
        console.log('[DEBUG] Leyendo archivo nativo con FileSystem:', fileUri);
        const ext = (extension || (fileUri.split('.').pop() || 'pdf')).toLowerCase();
        const guessedMime = ext === 'pdf' ? 'application/pdf'
                          : ext === 'png' ? 'image/png'
                          : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg'
                          : 'application/octet-stream';
        mimeType = guessedMime;
        // Si es content://, descargar a caché para obtener uri file:// estable
        let pathToRead = fileUri;
        if (fileUri.startsWith('content://')) {
          const tmpFile = `${FileSystem.cacheDirectory}upload_${Date.now()}.${ext}`;
          const dl = await FileSystem.downloadAsync(fileUri, tmpFile);
          pathToRead = dl.uri;
        }
        // Obtener blob directamente con fetch sobre file:// (soportado por RN/Expo)
        const response = await fetch(pathToRead);
        blob = await response.blob();
        nativePathForUpload = pathToRead;
        console.log(`[DEBUG] Blob nativo creado con fetch(file): size=${blob.size}, type=${(blob as any).type}`);
        if (blob.size === 0) {
          throw new Error('No se pudo leer el archivo (tamaño 0)');
        }
        if (!allowedMimeTypes.includes(mimeType)) {
          throw new Error(`Tipo de archivo no permitido: ${mimeType}`);
        }
      } else {
        console.log(`[DEBUG] Fetching file from URI:`, fileUri);
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 90000); // 90s timeout móvil/web
          // En Expo Go Android, algunas URIs http(s) externas pueden fallar por CORS/red.
          // Si falla, reintentar 1 vez.
          let response = await fetch(fileUri, {
            method: 'GET',
            headers: {
              'Accept': '*/*',
            },
            signal: controller.signal,
          });
          if (!response.ok) {
            console.warn('[DEBUG] Reintento fetch de archivo por status:', response.status, response.statusText);
            response = await fetch(fileUri, { method: 'GET' });
          }
          clearTimeout(timeout);
          
          if (!response.ok) {
            console.error(`[DEBUG] HTTP Error: ${response.status} ${response.statusText}`);
            throw new Error(`Error al obtener el archivo: ${response.status} ${response.statusText}`);
          }
          
          blob = await response.blob();
          mimeType = blob.type || mimeType;
          
          console.log(`[DEBUG] Blob obtenido: size=${blob.size}, type=${blob.type}`);
          
          if (!allowedMimeTypes.includes(mimeType)) {
            throw new Error(`Tipo de archivo no permitido: ${mimeType}`);
          }
        } catch (fetchError: any) {
          console.error(`[DEBUG] Error en fetch:`, fetchError);
          if (fetchError.message.includes('Network request failed')) {
            throw new Error('Error de conexión. Verifica tu conexión a internet e intenta de nuevo.');
          }
          throw new Error(`Error al procesar el archivo: ${fetchError.message}`);
        }
      }
      console.log(`[DEBUG] Blob size: ${blob.size}, type: ${blob.type}`);
      if (blob.size > 10 * 1024 * 1024) {
        throw new Error('[DEBUG] El archivo es demasiado grande. Máximo 10MB permitido.');
      }
      const storagePath = `${safePath}/${tipoDocumento.toLowerCase()}_${Date.now()}.${extension}`;
      if (onProgress) onProgress(i, 10);
      console.log(`[DEBUG] Subiendo a Supabase Storage en: ${storagePath}`);
      let uploadError: any = null;
      try {
        const res = await supabase
          .storage
          .from('crmum')
          .upload(storagePath, (blob as Blob), {
            upsert: true,
            contentType: mimeType
          });
        uploadError = res.error || null;
      } catch (e: any) {
        uploadError = e;
      }
      
      // Fallback nativo en Android: usar Signed Upload + FileSystem.uploadAsync cuando falle por "Network request failed"
      if (uploadError && Platform.OS !== 'web' && nativePathForUpload) {
        const msg = String(uploadError?.message || uploadError);
        if (msg.includes('Network request failed')) {
          console.warn('[DEBUG] Intentando fallback con Signed Upload URL');
          const { data: signed, error: signedErr } = await supabase
            .storage
            .from('crmum')
            .createSignedUploadUrl(storagePath);
          if (signedErr) throw signedErr;
          const result = await FileSystem.uploadAsync(signed!.signedUrl, nativePathForUpload, {
            httpMethod: 'PUT',
            headers: {
              'Content-Type': mimeType,
              'x-upsert': 'true',
            },
            uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
          });
          if (result.status < 200 || result.status >= 300) {
            throw new Error(`Signed upload failed: ${result.status}`);
          }
          uploadError = null;
        }
      }
      if (uploadError) {
        throw uploadError;
      }
      if (onProgress) onProgress(i, 100);
      if (uploadError) {
        console.error(`[DEBUG] Error de subida Supabase:`, uploadError);
        if (uploadError.message.includes('Request Header Or Cookie Too Large')) {
          throw new Error('[DEBUG] El archivo es demasiado grande para subir. Intenta con un archivo menor a 5MB.');
        }
        throw uploadError;
      }
      // Asegurar URL pública (manejo de posibles timings en móvil)
      const { publicUrl } = supabase
        .storage
        .from('crmum')
        .getPublicUrl(storagePath).data;
      if (!publicUrl) {
        throw new Error('[DEBUG] No se pudo obtener la URL pública del archivo');
      }
      resultados.push({ url: publicUrl, error: null });
      console.log(`[DEBUG] ✅ Archivo subido correctamente: ${publicUrl}`);
    } catch (error: any) {
      resultados.push({ url: null, error: error.message });
      if (onProgress) onProgress(i, 0);
      console.error(`[DEBUG] ❌ Error al subir el archivo ${i + 1}:`, error.message || error);
    }
  }
  return resultados;
}
