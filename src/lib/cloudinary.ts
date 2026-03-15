import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export { cloudinary }

// Genera firma para upload directo desde el cliente (más seguro que subir desde server)
export async function generateUploadSignature(folder: string) {
  const timestamp = Math.round(new Date().getTime() / 1000)
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET!
  )
  return { timestamp, signature }
}

// Extrae el public_id de una URL de Cloudinary
// Ej: https://res.cloudinary.com/cloud/image/upload/v123/chambape/avatares/foto.jpg → chambape/avatares/foto
export function extractPublicId(url: string): string {
  if (!url || !url.includes("cloudinary.com")) return ""
  const uploadIdx = url.indexOf("/upload/")
  if (uploadIdx === -1) return ""
  const afterUpload = url.slice(uploadIdx + 8)
  // Quitar versión (v1234567890/)
  const withoutVersion = afterUpload.replace(/^v\d+\//, "")
  // Quitar extensión
  return withoutVersion.replace(/\.[^./]+$/, "")
}

// Elimina cualquier archivo de Cloudinary (imagen o PDF)
export async function deleteCloudinaryFile(url: string): Promise<void> {
  const publicId = extractPublicId(url)
  if (!publicId) return
  // Detectar si es raw (PDF) o imagen
  const isRaw = url.toLowerCase().endsWith(".pdf") || url.includes("/raw/upload/")
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: isRaw ? "raw" : "image",
    })
  } catch {
    // No bloquear si falla el borrado (la imagen puede no existir o ya fue borrada)
  }
}

// Elimina una imagen de Cloudinary (alias mantenido por compatibilidad)
export async function deleteCloudinaryImage(publicId: string) {
  return cloudinary.uploader.destroy(publicId)
}

// Carpetas por tipo de upload
export const CLOUDINARY_FOLDERS = {
  avatares: "chambape/avatares",
  dniFrente: "chambape/verificacion/dni-frente",
  dniReverso: "chambape/verificacion/dni-reverso",
  selfieDni: "chambape/verificacion/selfie-dni",
  portfolio: "chambape/portfolio",
  solicitudes: "chambape/solicitudes",
  documentos: "chambape/documentos",
  certificados: "chambape/certificados",
}
