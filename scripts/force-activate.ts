import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function forceActivate() {
  const email = "legadoancestral95@gmail.com"
  const planId = "plan-basico" // El de 19 soles
  
  console.log(`Forcing activation for: ${email}`)

  const user = await prisma.user.findUnique({
    where: { email },
    include: { professionalProfile: true }
  })

  if (!user?.professionalProfile) {
    console.log("User or professional profile not found")
    return
  }

  const profileId = user.professionalProfile.id
  const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } })

  if (!plan) {
    console.log("Plan not found")
    return
  }

  console.log(`Found plan: ${plan.name} (${plan.creditsPerMonth} credits)`)

  await prisma.$transaction([
    // 1. Crear/Actualizar suscripción
    (prisma as any).professionalSubscription.upsert({
      where: { professionalId: profileId },
      update: {
        planId: plan.id,
        status: "ACTIVE",
        updatedAt: new Date()
      },
      create: {
        professionalId: profileId,
        planId: plan.id,
        status: "ACTIVE"
      }
    }),
    // 2. Sumar créditos
    prisma.professionalProfile.update({
      where: { id: profileId },
      data: { credits: { increment: plan.creditsPerMonth } }
    }),
    // 3. Registrar transacción
    prisma.creditTransaction.create({
      data: {
        professionalId: profileId,
        type: "SUBSCRIPTION_PAYMENT",
        credits: plan.creditsPerMonth,
        amountPen: plan.pricePen,
        balance: (user.professionalProfile.credits ?? 0) + plan.creditsPerMonth,
        description: `Activación manual - Mensualidad Plan ${plan.name} (Sincronización segura)`,
      }
    })
  ])

  console.log("SUCCESS: Subscription and credits applied.")
}

forceActivate()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
