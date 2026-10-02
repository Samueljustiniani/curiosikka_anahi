"use client";

import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { slugify } from "@/lib/utils";

const BUCKET = "media";
/** Tamaño máximo del archivo original (las fotos se comprimen antes de subir) */
export const MAX_IMAGE_MB = 25;
export const MAX_VIDEO_MB = 50;
/** Lado más largo de la foto ya optimizada */
const MAX_SIDE = 2000;
const QUALITY = 0.85;

const COMPRESSIBLE = ["image/jpeg", "image/png", "image/webp", "image/avif"];

function canvasToBlob(canvas: HTMLCanvasElement, type: string) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, QUALITY));
}

/**
 * Reduce la foto a máx. 2000 px y la convierte a WebP (o JPG si el navegador no soporta WebP).
 * Una foto de celular de ~8 MB suele quedar en 300–600 KB sin pérdida visible.
 */
async function optimizeImage(file: File): Promise<{ blob: Blob; ext: string }> {
  if (!COMPRESSIBLE.includes(file.type)) return { blob: file, ext: file.name.split(".").pop()?.toLowerCase() || "jpg" };
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas");
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    let blob = await canvasToBlob(canvas, "image/webp");
    let ext = "webp";
    if (!blob || blob.type !== "image/webp") {
      // Safari antiguo no genera WebP: JPG con fondo blanco (por si había transparencia)
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      blob = await canvasToBlob(canvas, "image/jpeg");
      ext = "jpg";
    }
    bitmap.close();
    if (!blob || blob.size >= file.size) return { blob: file, ext: file.name.split(".").pop()?.toLowerCase() || "jpg" };
    return { blob, ext };
  } catch {
    return { blob: file, ext: file.name.split(".").pop()?.toLowerCase() || "jpg" };
  }
}

/** Sube un archivo al bucket público "media" y devuelve su URL pública */
export async function uploadMedia(file: File, folder: "products" | "site") {
  const isVideo = file.type.startsWith("video/");
  const limit = (isVideo ? MAX_VIDEO_MB : MAX_IMAGE_MB) * 1024 * 1024;
  if (file.size > limit) {
    throw new Error(`El archivo pesa más de ${isVideo ? MAX_VIDEO_MB : MAX_IMAGE_MB} MB.`);
  }

  const { blob, ext } = isVideo
    ? { blob: file as Blob, ext: file.name.split(".").pop()?.toLowerCase() || "mp4" }
    : await optimizeImage(file);

  const base = slugify(file.name.replace(/\.[^.]+$/, "")) || "archivo";
  const path = `${folder}/${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}-${base}.${ext}`;
  const sb = getSupabaseBrowser();
  const { error } = await sb.storage.from(BUCKET).upload(path, blob, {
    cacheControl: "31536000",
    contentType: blob.type || file.type || undefined,
    upsert: false,
  });
  if (error) throw error;
  return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Borra un archivo del bucket a partir de su URL pública (si es nuestro) */
export async function deleteMedia(publicUrl: string) {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const i = publicUrl.indexOf(marker);
  if (i === -1) return;
  const path = decodeURIComponent(publicUrl.slice(i + marker.length));
  await getSupabaseBrowser().storage.from(BUCKET).remove([path]);
}
