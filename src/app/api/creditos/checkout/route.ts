// POST /api/creditos/checkout
// Procesa el pago con Culqi y acredita los créditos al profesional
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"

const schema = z.object({
  token: z.string().min(1, "Token de pago requerido"),
  packageId: z.string().min(1, "Paquete requerido"),
})

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return new NextResponse("No autorizado", { status: 401 })

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: { professionalProfile: true },
  })

  if (!user || user.role !== "PROFESSIONAL" || !user.professionalProfile) {
    return NextResponse.json({ error: "Solo profesionales pueden comprar créditos" }, { status: 403 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
  }

  const { token, packageId } = parsed.data

  // Obtener el paquete de créditos
  const pkg = await db.creditPackage.findUnique({ where: { id: packageId } })
  if (!pkg || !pkg.active) {
    return NextResponse.json({ error: "Paquete no válido" }, { status: 400 })
  }

  // ─── Llamada a la API de Culqi ─────────────────────────────────
  // Culqi cobra en centimos de sol (PEN). S/.15 = 1500, S/.35 = 3500, etc.
  const amountInCentimos = Math.round(pkg.pricePen * 100)

  const culqiRes = await fetch("https://api.culqi.com/v2/charges", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.CULQI_PRIVATE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amountInCentimos,
      currency_code: "PEN",
      email: user.email,
      source_id: token,
      description: `ChambaPe — ${pkg.name}: ${pkg.credits} créditos`,
      metadata: {
        userId: user.id,
        packageId: pkg.id,
        professionalId: user.professionalProfile.id,
      },
    }),
  })

  const culqiData = await culqiRes.json()

  if (!culqiRes.ok || culqiData.object !== "charge") {
    console.error("[CULQI_ERROR]", culqiData)
    const userMessage =
      culqiData?.user_message ?? culqiData?.merchant_message ?? "Error al procesar el pago"
    return NextResponse.json({ error: userMessage }, { status: 400 })
  }

  // ─── Éxito: acreditar créditos ──────────────────────────────────
  const prof = user.professionalProfile

  const [updatedProfile] = await db.$transaction([
    db.professionalProfile.update({
      where: { id: prof.id },
      data: { credits: { increment: pkg.credits } },
    }),
    db.creditTransaction.create({
      data: {
        professionalId: prof.id,
        type: "PURCHASE",
        credits: pkg.credits,
        amountPen: amountInCentimos,
        balance: prof.credits + pkg.credits,
        description: `Compra: ${pkg.name} (${pkg.credits} créditos)`,
        culqiChargeId: culqiData.id,
      },
    }),
  ])

  return NextResponse.json({
    ok: true,
    credits: pkg.credits,
    newBalance: updatedProfile.credits,
    chargeId: culqiData.id,
  })
}
