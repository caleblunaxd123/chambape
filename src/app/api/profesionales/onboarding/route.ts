// POST /api/profesionales/onboarding — guarda cada paso del wizard
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"

// ─── Schemas por paso ──────────────────────────────────────────────

const step1Schema = z.object({
  step: z.literal(1),
  dni: z
    .string()
    .min(8, "El DNI debe tener 8 dígitos")
    .max(8, "El DNI debe tener 8 dígitos")
    .regex(/^\d+$/, "Solo números"),
  phone: z.string().min(9, "Teléfono inválido"),
})

const step2Schema = z.object({
  step: z.literal(2),
  categoryIds: z.array(z.string()).min(1, "Selecciona al menos una especialidad"),
})

const step3Schema = z.object({
  step: z.literal(3),
  districts: z.array(z.string()).min(1, "Selecciona al menos un distrito"),
})

const step4Schema = z.object({
  step: z.literal(4),
  dniFrontUrl: z.string().url("URL inválida"),
  dniBackUrl: z.string().url("URL inválida"),
  selfieDniUrl: z.string().url("URL inválida"),
})

const step5Schema = z.object({
  step: z.literal(5),
  bio: z.string().min(30, "Cuéntanos más sobre ti (mínimo 30 caracteres)").max(500),
  avatarUrl: z.string().url("URL inválida").optional(),
})

const step6Schema = z.object({
  step: z.literal(6),
  portfolioImages: z
    .array(
      z.object({
        url: z.string().url(),
        caption: z.string().max(100).optional(),
      })
    )
    .max(5, "Máximo 5 fotos"),
})

const stepSchema = z.discriminatedUnion("step", [
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
  step6Schema,
])

// ─── Handler ────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return new NextResponse("No autorizado", { status: 401 })

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: { professionalProfile: true },
  })

  if (!user || user.role !== "PROFESSIONAL") {
    return new NextResponse("No autorizado", { status: 403 })
  }

  if (!user.professionalProfile) {
    return new NextResponse("Perfil no encontrado", { status: 404 })
  }

  const body = await req.json()
  const parsed = stepSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const data = parsed.data
  const profileId = user.professionalProfile.id

  try {
    switch (data.step) {
      case 1: {
        // Verificar que el DNI no esté ya en uso por otro profesional
        const dniExistente = await db.professionalProfile.findFirst({
          where: { dni: data.dni, id: { not: profileId } },
        })
        if (dniExistente) {
          return NextResponse.json(
            { error: "Este DNI ya está registrado en ChambaPe" },
            { status: 409 }
          )
        }

        await db.professionalProfile.update({
          where: { id: profileId },
          data: {
            dni: data.dni,
            onboardingStep: 2,
          },
        })

        // Actualizar teléfono del usuario
        await db.user.update({
          where: { id: user.id },
          data: { phone: data.phone },
        })
        break
      }

      case 2: {
        // Eliminar categorías anteriores y agregar las nuevas
        await db.professionalCategory.deleteMany({
          where: { professionalId: profileId },
        })

        await db.professionalCategory.createMany({
          data: data.categoryIds.map((categoryId) => ({
            professionalId: profileId,
            categoryId,
          })),
        })

        await db.professionalProfile.update({
          where: { id: profileId },
          data: { onboardingStep: 3 },
        })
        break
      }

      case 3: {
        await db.professionalProfile.update({
          where: { id: profileId },
          data: {
            districts: data.districts,
            onboardingStep: 4,
          },
        })
        break
      }

      case 4: {
        await db.professionalProfile.update({
          where: { id: profileId },
          data: {
            dniFrontUrl: data.dniFrontUrl,
            dniBackUrl: data.dniBackUrl,
            selfieDniUrl: data.selfieDniUrl,
            onboardingStep: 5,
          },
        })
        break
      }

      case 5: {
        await db.professionalProfile.update({
          where: { id: profileId },
          data: {
            bio: data.bio,
            avatarUrl: data.avatarUrl,
            onboardingStep: 6,
          },
        })

        // Actualizar avatar en el usuario también
        if (data.avatarUrl) {
          await db.user.update({
            where: { id: user.id },
            data: { avatarUrl: data.avatarUrl },
          })
        }
        break
      }

      case 6: {
        // Eliminar portfolio anterior y crear nuevo
        await db.portfolioImage.deleteMany({
          where: { professionalId: profileId },
        })

        if (data.portfolioImages.length > 0) {
          await db.portfolioImage.createMany({
            data: data.portfolioImages.map((img, index) => ({
              professionalId: profileId,
              url: img.url,
              caption: img.caption,
              order: index,
            })),
          })
        }

        // Marcar onboarding como completado
        await db.professionalProfile.update({
          where: { id: profileId },
          data: { onboardingStep: 6 },
        })

        // 🎁 Regalar 25 créditos de bienvenida (solo la primera vez)
        const yaRecibioBonus = await db.creditTransaction.findFirst({
          where: { professionalId: profileId, type: "BONUS" },
        })

        if (!yaRecibioBonus) {
          const BONUS_CREDITS = 25
          await db.$transaction([
            db.professionalProfile.update({
              where: { id: profileId },
              data: { credits: { increment: BONUS_CREDITS } },
            }),
            db.creditTransaction.create({
              data: {
                professionalId: profileId,
                type: "BONUS",
                credits: BONUS_CREDITS,
                balance: (user.professionalProfile.credits ?? 0) + BONUS_CREDITS,
                description: "🎁 Bienvenido a ChambaPe — 25 créditos de regalo para comenzar",
              },
            }),
          ])
        }

        break
      }
    }

    return NextResponse.json({ ok: true, nextStep: data.step < 6 ? data.step + 1 : null })
  } catch (error) {
    console.error("[ONBOARDING]", error)
    return new NextResponse("Error interno del servidor", { status: 500 })
  }
}

// GET — obtiene el estado actual del onboarding
export async function GET() {
  const { userId } = await auth()
  if (!userId) return new NextResponse("No autorizado", { status: 401 })

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: {
      professionalProfile: {
        include: {
          categories: { include: { category: true } },
          portfolioImages: { orderBy: { order: "asc" } },
        },
      },
    },
  })

  if (!user?.professionalProfile) {
    return new NextResponse("Perfil no encontrado", { status: 404 })
  }

  return NextResponse.json(user.professionalProfile)
}
