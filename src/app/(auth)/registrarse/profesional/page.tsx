import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { OnboardingWizard } from "@/components/profesionales/OnboardingWizard"

export const metadata = { title: "Registro de profesional" }

export default async function RegistrarseProfesionalPage() {
  const { userId } = await auth()
  if (!userId) redirect("/iniciar-sesion")

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

  // Si no existe en la BD aún (webhook demorado), redirigir a tipo
  if (!user) redirect("/registrarse/tipo")

  // Si ya completó el onboarding, ir al dashboard
  if (user.professionalProfile?.onboardingStep === 6 &&
      user.professionalProfile?.status !== "PENDING_VERIFICATION") {
    redirect("/profesional/dashboard")
  }

  // Cargar categorías de la BD para mapear slug → id
  const categories = await db.serviceCategory.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  })

  const categoryMap = Object.fromEntries(
    categories.map((c) => [c.slug, c.id])
  )

  const currentStep = user.professionalProfile?.onboardingStep ?? 1
  const profile = user.professionalProfile

  return (
    <div className="w-full max-w-lg">
      <OnboardingWizard
        currentStep={currentStep}
        categoryMap={categoryMap}
        initialData={{
          step1: profile ? { dni: profile.dni ?? "", phone: user.phone ?? "" } : undefined,
          step2: profile ? { selectedCategoryIds: profile.categories.map((c) => c.categoryId) } : undefined,
          step3: profile ? { districts: profile.districts } : undefined,
          step4: profile ? {
            dniFrontUrl: profile.dniFrontUrl ?? undefined,
            dniBackUrl: profile.dniBackUrl ?? undefined,
            selfieDniUrl: profile.selfieDniUrl ?? undefined,
          } : undefined,
          step5: profile ? {
            bio: profile.bio ?? "",
            avatarUrl: profile.avatarUrl ?? "",
          } : undefined,
          step6: {
            portfolioImages: profile?.portfolioImages.map((p) => ({
              url: p.url,
              caption: p.caption ?? undefined,
            })) ?? [],
          },
        }}
      />
    </div>
  )
}
