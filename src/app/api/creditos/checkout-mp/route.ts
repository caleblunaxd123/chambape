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

    // Detectar la URL real de la app desde el host de la request
    // Esto garantiza que back_urls y notification_url siempre apunten al dominio correcto
    // sin depender de que NEXT_PUBLIC_APP_URL esté actualizado en cada deploy.
    const reqHost = req.headers.get("host") ?? ""
    const reqProto = req.headers.get("x-forwarded-proto") ?? (reqHost.startsWith("localhost") ? "http" : "https")
    const APP_URL = process.env.NEXT_PUBLIC_APP_URL?.startsWith("https")
      ? process.env.NEXT_PUBLIC_APP_URL
      : `${reqProto}://${reqHost}`

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
          notification_url: `${APP_URL}/api/webhooks/mercadopago`,
        },
      })

      return NextResponse.json({ initPoint: response.init_point })
    }

    // ─── TIPO 2: SUSCRIPCIÓN MENSUAL ───────────────────────
    if (type === "SUBSCRIPTION") {
      // ── Seguridad: no permitir nueva suscripción si ya hay una activa ──────────
      // Esto evita que el usuario cree suscripciones duplicadas en MP pulsando
      // varias veces el botón o abriendo varias pestañas.
      const existingSub = await (db as any).professionalSubscription.findFirst({
        where: { professionalId: professionalAuth.id, status: "ACTIVE" },
      })
      if (existingSub) {
        return NextResponse.json({
          error: "Ya tienes una suscripción activa. Cancélala primero antes de cambiar de plan.",
        }, { status: 400 })
      }

      // packageId corresponds to the SubscriptionPlan.id in the DB
      const plan = await (db as any).subscriptionPlan.findUnique({
        where: { id: packageId },
      })

      if (!plan || !plan.active) {
        return NextResponse.json({ error: "Plan inválido o inactivo" }, { status: 400 })
      }

      if (!plan.mpPlanId) {
        return NextResponse.json({ error: "El plan no está configurado en MercadoPago" }, { status: 500 })
      }

      // Retornar el link estático del plan pre-aprobado en MP.
      // Así MP aloja el formulario donde el cliente pondrá su tarjeta.
      const initPoint = `https://www.mercadopago.com.pe/subscriptions/checkout?preapproval_plan_id=${plan.mpPlanId}`

      return NextResponse.json({ initPoint })
    }

    return NextResponse.json({ error: "Tipo de pago no soportado" }, { status: 400 })
  } catch (error) {
    console.error("[MP_CHECKOUT_ERROR]", error)
    return NextResponse.json({ error: "Error interno al generar el checkout" }, { status: 500 })
  }
}
