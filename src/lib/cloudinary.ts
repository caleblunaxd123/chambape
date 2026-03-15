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

// Elimina una imagen de Cloudinary
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
