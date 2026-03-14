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
  const params: any = { timestamp, folder }
  
  // Si es el frente del DNI, solicitamos OCR de Google
  if (parsed.data.folder === "dniFrente") {
    params.ocr = "adv_ocr"
  }

  const signature = cloudinary.utils.api_sign_request(
    params,
    apiSecret
  )

  return NextResponse.json({
    signature,
    timestamp,
    folder,
    cloudName,
    apiKey,
    ocr: params.ocr,
  })
}
