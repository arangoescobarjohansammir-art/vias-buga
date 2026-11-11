import { supabase } from "../supabaseClient.js";

export const BUCKET = "fotos-reportes";
export const MAX_FOTO_BYTES = 5 * 1024 * 1024; // mismo límite del bucket
export const MAX_FOTO_ORIGINAL_BYTES = 25 * 1024 * 1024; // se optimiza antes de subir
export const TIPOS_FOTO = ["image/jpeg", "image/png", "image/webp"];

// Reduce la foto (máx. 1600 px, JPEG). Sube mucho más rápido en datos móviles y,
// de paso, elimina los metadatos EXIF (como la ubicación GPS del teléfono).
export async function optimizarFoto(archivo, maxLado = 1600, calidad = 0.82) {
  try {
    const imagen = await createImageBitmap(archivo);
    const escala = Math.min(1, maxLado / Math.max(imagen.width, imagen.height));
    const ancho = Math.round(imagen.width * escala);
    const alto = Math.round(imagen.height * escala);
    const lienzo = document.createElement("canvas");
    lienzo.width = ancho;
    lienzo.height = alto;
    const ctx = lienzo.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, ancho, alto);
    ctx.drawImage(imagen, 0, 0, ancho, alto);
    imagen.close?.();
    const blob = await new Promise((resolver) => lienzo.toBlob(resolver, "image/jpeg", calidad));
    if (blob && (blob.size < archivo.size || archivo.size > MAX_FOTO_BYTES)) return blob;
  } catch {
    // Si el navegador no puede procesarla, se sube tal cual.
  }
  return archivo;
}

export function urlFoto(ruta) {
  return supabase.storage.from(BUCKET).getPublicUrl(ruta).data.publicUrl;
}

// Sube el archivo a Storage y lo registra en fotos_reporte.
export async function subirFoto(reporteId, archivo, tipo = "antes") {
  const blob = await optimizarFoto(archivo);
  if (blob.size > MAX_FOTO_BYTES) throw new Error("exceeded the maximum allowed size");

  const extension = blob.type === "image/png" ? "png" : blob.type === "image/webp" ? "webp" : "jpg";
  const ruta = `${reporteId}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(ruta, blob, { contentType: blob.type || "image/jpeg", cacheControl: "31536000" });
  if (error) throw error;

  const { error: errorRegistro } = await supabase
    .from("fotos_reporte")
    .insert({ reporte_id: reporteId, tipo, ruta });
  if (errorRegistro) throw errorRegistro;
}
