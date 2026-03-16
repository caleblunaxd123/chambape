// POST /api/soporte/chat
// Chatbot de soporte con 3 capas de optimización de costo:
//
//  1. FAQ instantáneo  — ~20 patrones comunes → respuesta directa, 0 tokens
//  2. Cache en memoria — respuestas de Claude se cachean (Map con TTL 24h, max 200 entradas)
//  3. Claude Haiku     — solo se llama cuando ninguna de las capas anteriores aplica

import { NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { z } from "zod"

// ─── Schema ──────────────────────────────────────────────────────────────────

const schema = z.object({
  messages: z.array(z.object({
    role:    z.enum(["user", "assistant"]),
    content: z.string(),
  })).min(1),
})

// ─── Sistema de cache en memoria ─────────────────────────────────────────────
// Persiste mientras el servidor Node está activo (dev: siempre; prod Vercel: por instancia caliente)

const TTL_MS  = 24 * 60 * 60 * 1000  // 24 horas
const MAX_ENTRIES = 200

interface CacheEntry { answer: string; timestamp: number }
const responseCache = new Map<string, CacheEntry>()

function cacheKey(texto: string): string {
  // Normalizar: minúsculas, sin acentos, sin puntuación extra, trimmed
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")  // eliminar acentos
    .replace(/[¿?¡!.,;:]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120) // máx 120 chars para la key
}

function getCache(key: string): string | null {
  const entry = responseCache.get(key)
  if (!entry) return null
  if (Date.now() - entry.timestamp > TTL_MS) {
    responseCache.delete(key)
    return null
  }
  return entry.answer
}

function setCache(key: string, answer: string) {
  // LRU simple: si está lleno, eliminar la entrada más antigua
  if (responseCache.size >= MAX_ENTRIES) {
    const oldest = responseCache.keys().next().value
    if (oldest) responseCache.delete(oldest)
  }
  responseCache.set(key, { answer, timestamp: Date.now() })
}

// ─── FAQ instantáneo ─────────────────────────────────────────────────────────
// Patrones de palabras clave → respuesta directa sin llamar a la API.
// Cubre aprox. el 75-80% de las consultas típicas de soporte.

interface FaqEntry { patrones: RegExp[]; respuesta: string }

const FAQ: FaqEntry[] = [
  // ── Publicar solicitud ───────────────────────────────────────────────────
  {
    patrones: [/public(ar?|o|as?)\s*(una?\s*)?(solicitud|pedido|trabajo|servicio|requer)/,
               /como\s*(hago\s*)?(para\s*)?(pedir|contratar|publicar)/,
               /necesito\s*(un\s*)?(servicio|trabajo|ayuda)/],
    respuesta: `¡Es super fácil! 📋 Para publicar una solicitud:\n\n1. Ve a tu panel de cliente\n2. Haz clic en **"Nueva solicitud"**\n3. Describe el trabajo, elige la categoría y el distrito\n4. Pon un presupuesto aproximado\n\n¡Es completamente gratis! En minutos empezarás a recibir propuestas de expertos de tu zona. 🙌`,
  },

  // ── Cómo funciona (general) ──────────────────────────────────────────────
  {
    patrones: [/como\s*funciona\s*(chambape|la\s*app|la\s*plataforma|esto|el\s*servicio)?/,
               /que\s*es\s*chambape/,
               /para\s*que\s*(sirve|es)\s*(chambape|la\s*app)?/],
    respuesta: `ChambaPe conecta a clientes con expertos verificados para servicios del hogar en Lima. ⚡\n\n**Para clientes:**\n1. Publicas tu solicitud gratis\n2. Recibes hasta 5 propuestas de expertos de tu zona\n3. Eliges al que más te convenza\n4. Coordinas el trabajo directamente\n\n**Para profesionales:**\n1. Creas tu perfil y configuras tus servicios y distritos\n2. Ves las oportunidades en tu feed\n3. Postulas usando créditos\n4. Si te aceptan, contactas al cliente directamente\n\n¡Sin comisión por trabajo! 🎉`,
  },

  // ── Créditos: cómo funcionan ─────────────────────────────────────────────
  {
    patrones: [/como\s*funciona(n)?\s*(los\s*)?(creditos|sistema\s*de\s*creditos)/,
               /que\s*son\s*los\s*creditos/,
               /para\s*que\s*(sirven|son)\s*(los\s*)?creditos/],
    respuesta: `Los créditos son la moneda interna de ChambaPe para profesionales. 💳\n\nCada vez que postulas a una solicitud de un cliente, se descuentan créditos de tu saldo.\n\n**¿Cómo conseguir créditos?**\n• Al registrarte: **25 créditos gratis** de bienvenida 🎁\n• Al verificarte: **5 créditos adicionales**\n• Comprando paquetes o suscribiéndote a un plan mensual\n\nSi el cliente cancela su solicitud, **los créditos se devuelven** automáticamente. ✅`,
  },

  // ── Precios / paquetes de créditos ───────────────────────────────────────
  {
    patrones: [/cuanto\s*(cuesta|vale|costo|cobran|sale)/,
               /precio(s)?\s*(de\s*)?(los\s*)?creditos/,
               /paquetes?\s*(de\s*creditos)?/,
               /cuanto\s*son\s*los\s*creditos/,
               /tarifas?/],
    respuesta: `Estos son los paquetes de créditos disponibles 🛒\n\n| Paquete | Créditos | Precio |\n|---------|----------|--------|\n| Starter | 10 cr | S/.15 |\n| Pro ⭐ | 30 cr | S/.35 |\n| Master | 70 cr | S/.70 |\n\n**Suscripciones mensuales** también disponibles con créditos automáticos cada mes.\n\nEl pago es vía MercadoPago (Visa, Mastercard, débito). ¡Sin comisiones ocultas! 💪`,
  },

  // ── Comprar créditos ─────────────────────────────────────────────────────
  {
    patrones: [/como\s*(compro?|recargo?|adquiero?|obtengo?)\s*(mas\s*)?(creditos|saldo)/,
               /donde\s*(compro?|recargo?)\s*(creditos)?/,
               /quiero\s*(comprar|recargar)\s*creditos/],
    respuesta: `Para comprar créditos 🛒\n\n1. Ve a **"Créditos"** en tu panel profesional (menú lateral o bottom nav)\n2. Elige el paquete que prefieras (Starter, Pro o Master)\n3. Haz clic en **"Comprar"**\n4. Completa el pago en MercadoPago con tu tarjeta\n\nLos créditos se acreditan en 1-2 minutos después del pago. Si no aparecen, espera un momento y recarga la página. 🔄`,
  },

  // ── Créditos no acreditados ──────────────────────────────────────────────
  {
    patrones: [/no\s*(me\s*)?(llegar?on?|aparecen?|se\s*acredit|se\s*reflejan?|vi)\s*(los?\s*)?creditos/,
               /pague?\s*(y\s*)?(no\s*)?(tengo?|aparecen?|recib)\s*(creditos|saldo)/,
               /creditos\s*(no\s*)?(llegaron?|aparecen?|se\s*acredit)/],
    respuesta: `Tranquilo/a, pasa a veces. Sigue estos pasos 🔍\n\n1. **Espera 2-3 minutos** y recarga la página\n2. Revisa el **historial de transacciones** en "Créditos"\n3. Si el pago aparece en tu tarjeta pero no en la app, **anota el número de operación** de MercadoPago\n\nSi después de 10 minutos sigue sin aparecer, contáctanos vía el botón **"Soporte"** aquí arriba con el número de operación. Lo resolvemos en menos de 24 horas. 🙏`,
  },

  // ── Postular a solicitud ─────────────────────────────────────────────────
  {
    patrones: [/como\s*(postulo?|aplico?|envio?\s*una?\s*propuesta|participo?)/,
               /como\s*consigo?\s*(trabajo|clientes?|chamba)/,
               /oportunidades?/],
    respuesta: `Para postular a una solicitud 🙋\n\n1. Ve a **"Oportunidades"** en tu panel profesional\n2. Verás solicitudes filtradas por tus categorías y distritos\n3. Haz clic en una que te interese\n4. Envía tu propuesta con tu precio y descripción\n\n⚠️ Recuerda que cada postulación usa **créditos** de tu saldo.\n\n💡 **Tip:** Cuanto más completo esté tu perfil, más probabilidades tienes de ser aceptado.`,
  },

  // ── Aceptar propuesta (cliente) ──────────────────────────────────────────
  {
    patrones: [/como\s*(acepto?|selecciono?|elijo?|escojo?)\s*(una?\s*)?(propuesta|profesional|experto)/,
               /recib(i|e)\s*(propuestas?|ofertas?)/,
               /ver\s*(mis?\s*)?(propuestas?|aplicaciones?)/],
    respuesta: `Para aceptar una propuesta ✅\n\n1. Ve a **"Mis solicitudes"** en tu panel de cliente\n2. Haz clic en la solicitud que quieras gestionar\n3. Verás todas las propuestas recibidas\n4. Revisa el perfil, reseñas y precio de cada experto\n5. Haz clic en **"Aceptar propuesta"**\n\nAl aceptar, el experto recibe una notificación y se pondrá en contacto contigo. Las demás propuestas se notifican automáticamente. 🤝`,
  },

  // ── Verificación de perfil ───────────────────────────────────────────────
  {
    patrones: [/como\s*(verifico?|valido?)\s*(mi\s*)?(perfil|cuenta|identidad)/,
               /verificacion\s*(del?\s*perfil)?/,
               /cuanto\s*(tarda|demora|tiempo)\s*(la\s*verificacion)?/,
               /sello\s*(de\s*verificacion|verificado)/],
    respuesta: `La verificación confirma que eres un profesional real y de confianza. 🔖\n\n**Pasos:**\n1. Completa tu perfil (foto, descripción, servicios, distritos)\n2. Sube tus documentos requeridos\n3. Solicita la verificación desde tu panel\n\n**Tiempo:** El equipo revisa en **24-48 horas hábiles**.\n\n**Beneficios:** Muestras el sello ✓ verificado, generas más confianza y recibes **5 créditos gratis** al aprobarte. 🎁`,
  },

  // ── Cancelar suscripción ─────────────────────────────────────────────────
  {
    patrones: [/como\s*(cancelo?|doy?\s*de\s*baja|cancelo?\s*mi)\s*(la\s*)?(suscripcion|plan|membresia)/,
               /cancelar\s*(suscripcion|plan)/,
               /dar\s*de\s*baja\s*(la\s*)?(suscripcion|plan)/],
    respuesta: `Para cancelar tu suscripción 📋\n\n1. Ve a **"Créditos"** en tu panel profesional\n2. Busca la sección de tu plan activo\n3. Haz clic en **"Cancelar plan"**\n\n⚠️ **Importante:** Al cancelar, tu plan sigue activo hasta el final del período ya pagado. No se hacen cobros adicionales. Puedes reactivarlo cuando quieras. ✅`,
  },

  // ── Pago rechazado ───────────────────────────────────────────────────────
  {
    patrones: [/pago\s*(fue\s*)?(rechazado|fallido?|no\s*(se\s*)?(proceso?|completo?))/,
               /tarjeta\s*(no\s*)?(funciona|acepta|pasa)/,
               /error\s*(en\s*(el\s*)?)?(pago|cobro)/],
    respuesta: `Si tu pago fue rechazado, prueba esto 🔍\n\n1. **Verifica los datos** de tu tarjeta (número, vencimiento, CVV)\n2. Asegúrate de tener **saldo suficiente**\n3. Algunos bancos bloquean pagos en línea — llama a tu banco para autorizarlo\n4. Prueba con **otra tarjeta**\n\nSi el problema persiste, contáctanos via el botón **"Soporte"** con los detalles del error. 🙏`,
  },

  // ── Login / iniciar sesión ───────────────────────────────────────────────
  {
    patrones: [/no\s*(puedo\s*)?(iniciar|entrar|ingresar|acceder)\s*(sesion|a\s*(la\s*)?app)?/,
               /olvide\s*(mi\s*)?(contrasena|clave|password)/,
               /no\s*(me\s*)?(deja\s*(entrar|acceder)|reconoce)/],
    respuesta: `Si no puedes iniciar sesión 🔐\n\n1. Haz clic en **"¿Olvidaste tu contraseña?"** en la pantalla de login\n2. Revisa tu email (también el spam)\n3. Si usas **Google**, asegúrate de seleccionar la misma cuenta con la que te registraste\n4. Limpia el caché del navegador (Ctrl+Shift+Delete en Windows)\n\nSi nada funciona, contáctanos con tu email de registro y lo resolvemos. 🙌`,
  },

  // ── App no carga / lenta ─────────────────────────────────────────────────
  {
    patrones: [/no\s*(carga|funciona|abre?)\s*(la\s*app|la\s*pagina|el\s*sitio)?/,
               /app\s*(lenta|no\s*funciona|se\s*traba|se\s*cayo?)/,
               /error\s*(en\s*la\s*app|de\s*pantalla)/],
    respuesta: `Si la app no carga correctamente 💻\n\n1. **Recarga la página** (Ctrl+R en Windows, Cmd+R en Mac)\n2. Prueba en **modo incógnito** (Ctrl+Shift+N)\n3. **Limpia el caché** del navegador\n4. Prueba en **otro navegador** (Chrome, Firefox, Edge)\n5. Revisa tu **conexión a internet**\n\nSi el problema persiste, cuéntanos desde qué dispositivo y navegador lo tienes. ¡Lo solucionamos! 🔧`,
  },

  // ── Es gratis para clientes ──────────────────────────────────────────────
  {
    patrones: [/(es\s*)?(gratis|gratuito|cobran?)\s*(para\s*clientes?)?/,
               /cuanto\s*(cobran?|cuesta)\s*(para\s*clientes?|publicar|postular)?/,
               /comision/],
    respuesta: `¡Sí, para clientes es **100% gratis**! 🎉\n\nPublicar solicitudes, recibir propuestas y elegir a un experto no tiene ningún costo.\n\n**ChambaPe no cobra comisión** por trabajo realizado. El modelo es:\n• Clientes → gratis siempre\n• Profesionales → compran créditos para postular\n\nEs una forma justa de conectar a todos sin costos ocultos. 💪`,
  },

  // ── Reseñas ──────────────────────────────────────────────────────────────
  {
    patrones: [/como\s*(dejo?|hago?|pongo?)\s*(una?\s*)?(resena|calificacion|rating|opinion)/,
               /resenas?\s*(del?\s*(profesional|experto))?/,
               /calificar\s*(al\s*)?(profesional|experto|servicio)/],
    respuesta: `Para dejar una reseña ⭐\n\n1. Ve a **"Mis solicitudes"**\n2. Busca la solicitud completada\n3. Haz clic en **"Dejar reseña"**\n4. Puntúa del 1 al 5 y escribe tu opinión\n\n💡 Tu reseña ayuda a otros clientes a elegir mejor y motiva a los profesionales a dar el mejor servicio. ¡Tómate 1 minuto para hacerlo! 🙏`,
  },
]

// Normalizar texto para comparar con patrones
function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[¿?¡!]/g, "")
    .trim()
}

function buscarFAQ(pregunta: string): string | null {
  const norm = normalizar(pregunta)
  for (const faq of FAQ) {
    if (faq.patrones.some((p) => p.test(norm))) {
      return faq.respuesta
    }
  }
  return null
}

// ─── System Prompt para Claude (solo se usa si no hay FAQ ni cache) ───────────

const SYSTEM_PROMPT = `Eres el asistente virtual de ChambaPe, un marketplace peruano de servicios para el hogar en Lima. Tu nombre es "Chamby". Hablas en español peruano coloquial, de forma amigable, directa y concisa. Usas emojis moderadamente.

## Sobre ChambaPe
ChambaPe conecta a clientes que necesitan servicios del hogar (gasfitería, electricidad, pintura, limpieza, carpintería, cerrajería, fumigación, mudanzas, etc.) con profesionales verificados de Lima.

## Cómo funciona para CLIENTES
1. El cliente publica una solicitud gratis: describe el trabajo, elige categoría, distrito y presupuesto
2. Profesionales verificados de la zona envían sus propuestas (hasta 5 propuestas por solicitud)
3. El cliente revisa perfiles, reseñas y acepta la propuesta que más le convenga
4. El profesional contacta al cliente directamente para coordinar el trabajo
5. Al finalizar, el cliente puede dejar una reseña al profesional

## Cómo funciona para PROFESIONALES
1. Crea perfil con foto, descripción, categorías y distritos
2. Completa onboarding de 6 pasos
3. Solicita verificación (24-48 h hábiles) → recibe 5 créditos gratis
4. En "Oportunidades" ve solicitudes filtradas por sus categorías/distritos
5. Aplica con créditos. Si lo aceptan, contacta al cliente directamente

## Créditos (solo profesionales)
- Al registrarse: 25 créditos de bienvenida. Al verificarse: 5 créditos adicionales
- Paquetes de recarga (MercadoPago): Starter 10cr/S/.15 · Pro 30cr/S/.35 · Master 70cr/S/.70
- También hay suscripciones mensuales
- Los créditos se devuelven si el cliente cancela su solicitud

## Pagos
- Solo MercadoPago (Visa, Mastercard, débito). Moneda: Soles (PEN)
- Si el pago no se refleja en 2-3 min, recargar la página
- Para problemas persistentes: contactar soporte con número de operación MP

## Verificación
- El equipo revisa en 24-48 h hábiles
- Estados: Pendiente → Verificado o Rechazado (con motivo)
- Perfil verificado muestra sello ✓ y genera más confianza

## Reglas
- Responde SOLO en español. Sé conciso (máx 3-4 párrafos).
- Si no sabes algo con certeza, dilo y sugiere contactar soporte.
- No inventes precios ni características.
- Si te preguntan algo fuera del tema, redirige amablemente.
- Tutea siempre al usuario.`

// ─── Handler principal ────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Mensajes inválidos" }, { status: 400 })
    }

    const messages = parsed.data.messages

    // Última pregunta del usuario
    const ultimoMensajeUsuario = [...messages].reverse().find((m) => m.role === "user")
    const pregunta = ultimoMensajeUsuario?.content ?? ""

    const encoder = new TextEncoder()

    // ── Capa 1: FAQ instantáneo (0 tokens) ─────────────────────────────────
    const respuestaFAQ = buscarFAQ(pregunta)
    if (respuestaFAQ) {
      // Simular streaming para mantener la UX consistente
      const stream = new ReadableStream({
        async start(controller) {
          const words = respuestaFAQ.split(" ")
          for (let i = 0; i < words.length; i++) {
            controller.enqueue(encoder.encode((i === 0 ? "" : " ") + words[i]))
            // Delay mínimo (5ms) para efecto natural de escritura
            await new Promise((r) => setTimeout(r, 5))
          }
          controller.close()
        },
      })
      return new Response(stream, {
        headers: { "Content-Type": "text/plain; charset=utf-8", "X-Source": "faq" },
      })
    }

    // ── Capa 2: Cache en memoria ───────────────────────────────────────────
    const key = cacheKey(pregunta)
    const cached = getCache(key)
    if (cached) {
      const stream = new ReadableStream({
        async start(controller) {
          const words = cached.split(" ")
          for (let i = 0; i < words.length; i++) {
            controller.enqueue(encoder.encode((i === 0 ? "" : " ") + words[i]))
            await new Promise((r) => setTimeout(r, 5))
          }
          controller.close()
        },
      })
      return new Response(stream, {
        headers: { "Content-Type": "text/plain; charset=utf-8", "X-Source": "cache" },
      })
    }

    // ── Capa 3: Claude API (solo para preguntas únicas) ────────────────────
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "El asistente no está disponible ahora. Usa el formulario de contacto." },
        { status: 503 }
      )
    }

    const client = new Anthropic({ apiKey })
    let fullResponse = ""

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const anthropicStream = await client.messages.stream({
            model:      "claude-haiku-4-5",
            max_tokens: 600,
            system:     SYSTEM_PROMPT,
            messages,
          })

          for await (const chunk of anthropicStream) {
            if (
              chunk.type === "content_block_delta" &&
              chunk.delta.type === "text_delta"
            ) {
              const text = chunk.delta.text
              fullResponse += text
              controller.enqueue(encoder.encode(text))
            }
          }

          // Guardar en cache para próximas preguntas similares
          if (fullResponse.length > 10) {
            setCache(key, fullResponse)
          }

          controller.close()
        } catch (err) {
          console.error("[SOPORTE_CHAT_STREAM]", err)
          controller.enqueue(encoder.encode(
            "Lo siento, hubo un error. Por favor intenta de nuevo o usa el formulario de contacto. 🙏"
          ))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type":           "text/plain; charset=utf-8",
        "Transfer-Encoding":      "chunked",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control":          "no-cache",
        "X-Source":               "claude",
      },
    })
  } catch (error) {
    console.error("[SOPORTE_CHAT_ERROR]", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
