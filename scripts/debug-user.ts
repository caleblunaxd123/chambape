import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function checkUser() {
  const email = "legadoancestral95@gmail.com"
  console.log(`Checking user: ${email}`)

  const users = await (prisma as any).user.findMany({
    where: { email },
    include: {
      professionalProfile: {
        include: {
          subscription: {
            include: { plan: true }
          },
          creditTransactions: {
            orderBy: { createdAt: 'desc' },
            take: 10
          }
        }
      }
    }
  })

  if (users.length === 0) {
    console.log("No users found with this email")
    return
  }

  for (const user of users) {
    console.log("--- USER ---")
    console.log("User ID:", user.id)
    console.log("Email:", user.email)
    console.log("Role:", user.role)
    if (user.professionalProfile) {
      console.log("Professional Profile ID:", user.professionalProfile.id)
      console.log("Credits:", user.professionalProfile.credits)
      console.log("Subscription:", JSON.stringify(user.professionalProfile.subscription, null, 2))
      console.log("Last Transactions:", JSON.stringify(user.professionalProfile.creditTransactions, null, 2))
    } else {
      console.log("No professional profile found for this user")
    }
  }

  console.log("\n--- RECENT SUBSCRIPTIONS ---")
  const subs = await (prisma as any).professionalSubscription.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      plan: true,
      professional: {
        include: { user: true }
      }
    }
  })

  if (subs.length === 0) {
    console.log("No subscriptions found in DB")
  } else {
    for (const sub of subs) {
      console.log(`ID: ${sub.id}, Plan: ${sub.plan.name}, Status: ${sub.status}, Email: ${sub.professional.user.email}`)
    }
  }
}

checkUser()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
