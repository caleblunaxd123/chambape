import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import { PAQUETES_CREDITOS } from "@/constants/paquetes"
import { MercadoPagoConfig, Preference, PreApproval } from "mercadopago"

export async function POST(req: Request) {
  try {
    const user = await requireAuth()

    const body = await req.json()
    const { packageId, type } = body

    if (!packageId || !type) {
      return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 })
    }

    const professionalAuth = await db.professionalProfile.findUnique({
      where: { userId: user.id },
    })

    if (!professionalAuth) {
      return NextResponse.json({ error: "Perfil profesional no encontrado" }, { status: 404 })
    }

    // Configuración de MercadoPago
    const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN
    
    if (!MP_ACCESS_TOKEN) {
      return NextResponse.json({ error: "MercadoPago no está configurado" }, { status: 500 })
    }
    
    const client = new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN })
    
    const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    // ─── TIPO 1: PAGO ÚNICO (RECARGA DE CRÉDITOS) ─────────
    if (type === "ONE_TIME") {
      const pkg = PAQUETES_CREDITOS.find((p: any) => p.id === packageId)
      if (!pkg) {
        return NextResponse.json({ error: "Paquete inválido" }, { status: 400 })
      }

      // Crear API Preference de MP
      const preference = new Preference(client)
      
      const response = await preference.create({
        body: {
          items: [
            {
              id: pkg.id,
              title: `Paquete de ${pkg.credits} Créditos - ChambaPe`,
              quantity: 1,
              unit_price: pkg.pricePen,
              currency_id: "PEN",
            },
          ],
          payer: {
            email: user.email,
            name: user.name,
          },
          external_reference: `${professionalAuth.id}_${pkg.id}_ONE_TIME_${Date.now()}`,
          back_urls: {
            success: `${APP_URL}/profesional/creditos?status=success`,
            failure: `${APP_URL}/profesional/creditos?status=failure`,
            pending: `${APP_URL}/profesional/creditos?status=pending`,
          },
          auto_return: "approved",
          statement_descriptor: "CHAMBAPE",
        },
      })

      return NextResponse.json({ initPoint: response.init_point })
    }

    // ─── TIPO 2: SUSCRIPCIÓN MENSUAL ───────────────────────
    if (type === "SUBSCRIPTION") {
      // packageId actually corresponds to the SubscriptionPlan.id in the DB
      const plan = await db.subscriptionPlan.findUnique({
        where: { id: packageId },
      })

      if (!plan || !plan.active) {
        return NextResponse.json({ error: "Plan inválido o inactivo" }, { status: 400 })
      }
      
      if (!plan.mpPlanId) {
        return NextResponse.json({ error: "El plan no está configurado en MercadoPago" }, { status: 500 })
      }

      // Crear API PreApproval de MP (Suscripción)
      const preApproval = new PreApproval(client)

      const response = await preApproval.create({
        body: {
          preapproval_plan_id: plan.mpPlanId,
          payer_email: user.email,
          back_url: `${APP_URL}/profesional/creditos?status=success_sub`,
          external_reference: `${professionalAuth.id}_${plan.id}_SUBSCRIPTION_${Date.now()}`,
          reason: `Suscripción Mensual - ${plan.name} - ChambaPe`,
        },
      })

      return NextResponse.json({ initPoint: response.init_point })
    }

    return NextResponse.json({ error: "Tipo de pago no soportado" }, { status: 400 })
  } catch (error) {
    console.error("[MP_CHECKOUT_ERROR]", error)
    return NextResponse.json({ error: "Error interno al generar el checkout" }, { status: 500 })
  }
}
