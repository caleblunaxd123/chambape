// POST /api/upload — genera firma para upload directo a Cloudinary desde el cliente
// El cliente sube directamente a Cloudinary (no pasa por nuestro servidor → más rápido)
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { z } from "zod"
import { cloudinary, CLOUDINARY_FOLDERS } from "@/lib/cloudinary"

const schema = z.object({
  folder: z.enum([
    "avatares",
    "dniFrente",
    "dniReverso",
    "selfieDni",
    "portfolio",
    "solicitudes",
    "documentos",
    "certificados",
  ]),
})

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return new NextResponse("No autorizado", { status: 401 })

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    console.error("[UPLOAD] Faltan variables de entorno de Cloudinary:", {
      cloudName: !!cloudName,
      apiKey: !!apiKey,
      apiSecret: !!apiSecret,
    })
    return new NextResponse(
      "Cloudinary no configurado. Agrega NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET al .env",
      { status: 500 }
    )
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return new NextResponse("Carpeta inválida", { status: 400 })

  const folder = CLOUDINARY_FOLDERS[parsed.data.folder]
  const timestamp = Math.round(Date.now() / 1000)

  // Límites por carpeta (en bytes)
  const MAX_FILE_SIZES: Record<string, number> = {
    avatares:       5 * 1024 * 1024,   // 5 MB
    dniFrente:      5 * 1024 * 1024,
    dniReverso:     5 * 1024 * 1024,
    selfieDni:      5 * 1024 * 1024,
    portfolio:      8 * 1024 * 1024,   // 8 MB
    solicitudes:    8 * 1024 * 1024,
    documentos:    10 * 1024 * 1024,   // 10 MB
    certificados:  10 * 1024 * 1024,
  }
  const maxFileSize = MAX_FILE_SIZES[parsed.data.folder] ?? 5 * 1024 * 1024

  // Nota: max_file_size NO va en la firma — solo es válido en upload presets (unsigned).
  // Para signed uploads se valida solo del lado cliente antes de subir.
  const params: Record<string, string | number> = { timestamp, folder }

  // Si es el frente del DNI, solicitamos OCR de Google
  if (parsed.data.folder === "dniFrente") {
    params.ocr = "adv_ocr"
  }

  const signature = cloudinary.utils.api_sign_request(
    params as Record<string, string>,
    apiSecret
  )

  // documentos y certificados usan resource_type "auto" para soportar PDFs
  const isDocument = ["documentos", "certificados"].includes(parsed.data.folder)

  return NextResponse.json({
    signature,
    timestamp,
    folder,
    cloudName,
    apiKey,
    maxFileSize,
    ocr: params.ocr,
    resourceType: isDocument ? "auto" : "image",
  })
}
