import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function awardRecharge() {
  const email = "legadoancestral95@gmail.com"
  const packageId = "starter" // S/ 15 -> 10 créditos
  const creditsToAward = 10
  const price = 15
  
  console.log(`Awarding recharge for: ${email}`)

  const user = await prisma.user.findUnique({
    where: { email },
    include: { professionalProfile: true }
  })

  if (!user?.professionalProfile) {
    console.log("User or professional profile not found")
    return
  }

  const profileId = user.professionalProfile.id

  await prisma.$transaction([
    // 1. Sumar créditos
    prisma.professionalProfile.update({
      where: { id: profileId },
      data: { credits: { increment: creditsToAward } }
    }),
    // 2. Registrar transacción
    prisma.creditTransaction.create({
      data: {
        professionalId: profileId,
        type: "PURCHASE",
        credits: creditsToAward,
        amountPen: price,
        balance: (user.professionalProfile.credits ?? 0) + creditsToAward,
        description: `Sincronización manual - Recarga Starter (S/ 15.00)`,
        packageId: packageId
      }
    })
  ])

  console.log(`SUCCESS: ${creditsToAward} credits applied. New balance will be ${(user.professionalProfile.credits ?? 0) + creditsToAward}`)
}

awardRecharge()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
