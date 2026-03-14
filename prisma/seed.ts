// prisma/seed.ts
// Ejecutar con: npx prisma db seed

import { PrismaClient } from "@prisma/client"
import { CATEGORIAS } from "../src/constants/categorias"
import { PAQUETES_CREDITOS } from "../src/constants/paquetes"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Iniciando seed de ChambaPe...")

  // ─── 1. Categorías y subcategorías ────────────────────────────────
  console.log("📂 Creando categorías...")
  for (const [index, cat] of CATEGORIAS.entries()) {
    const categoria = await prisma.serviceCategory.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        icon: cat.icon,
        description: cat.description,
        creditCost: cat.creditCost,
        order: index,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        description: cat.description,
        creditCost: cat.creditCost,
        order: index,
        active: true,
      },
    })

    for (const [subIndex, sub] of cat.subcategorias.entries()) {
      await prisma.serviceSubcategory.upsert({
        where: { slug: sub.slug },
        update: { name: sub.name, order: subIndex },
        create: {
          name: sub.name,
          slug: sub.slug,
          categoryId: categoria.id,
          order: subIndex,
          active: true,
        },
      })
    }
  }
  console.log(`✅ ${CATEGORIAS.length} categorías creadas`)

  // ─── 2. Paquetes de créditos ───────────────────────────────────────
  console.log("💳 Creando paquetes de créditos...")
  for (const paquete of PAQUETES_CREDITOS) {
    await prisma.creditPackage.upsert({
      where: { id: paquete.id },
      update: {
        name: paquete.name,
        credits: paquete.credits,
        pricePen: paquete.pricePen,
        savings: paquete.savings,
        popular: paquete.popular,
        order: paquete.order,
      },
      create: {
        id: paquete.id,
        name: paquete.name,
        credits: paquete.credits,
        pricePen: paquete.pricePen,
        savings: paquete.savings,
        popular: paquete.popular,
        order: paquete.order,
        active: true,
      },
    })
  }
  console.log(`✅ ${PAQUETES_CREDITOS.length} paquetes creados`)

  // ─── 2.5 Planes de Suscripción ─────────────────────────────────────
  console.log("💎 Creando planes de suscripción...")
  const planesSuscripcion = [
    {
      id: "plan-basico",
      name: "Básico",
      creditsPerMonth: 20,
      pricePen: 19,
      features: ["20 créditos al mes", "Sin comisiones", "Soporte básico"],
      mpPlanId: "51c5da418ce24a9bb2cd4fcf9b8b05cb",
    },
    {
      id: "plan-pro",
      name: "Pro",
      creditsPerMonth: 50,
      pricePen: 39,
      features: ["50 créditos al mes", "Insignia Profesional Pro", "Soporte prioritario 24/7"],
      mpPlanId: "89e079cfaa0942228cd4f4a6886a3255",
    },
  ]

  for (const plan of planesSuscripcion) {
    await prisma.subscriptionPlan.upsert({
      where: { id: plan.id },
      update: {
        name: plan.name,
        creditsPerMonth: plan.creditsPerMonth,
        pricePen: plan.pricePen,
        features: plan.features,
        mpPlanId: plan.mpPlanId,
      },
      create: {
        id: plan.id,
        name: plan.name,
        creditsPerMonth: plan.creditsPerMonth,
        pricePen: plan.pricePen,
        features: plan.features,
        mpPlanId: plan.mpPlanId,
        active: true,
      },
    })
  }
  console.log(`✅ ${planesSuscripcion.length} planes creados`)

  // ─── 3. Insignias ─────────────────────────────────────────────────
  console.log("🏅 Creando insignias...")
  const badges = [
    {
      slug: "responde-rapido",
      name: "Responde rápido",
      description: "Contesta en menos de 1 hora",
      icon: "⚡",
    },
    {
      slug: "muy-puntual",
      name: "Muy puntual",
      description: "Siempre llega a tiempo",
      icon: "⏰",
    },
    {
      slug: "top-categoria",
      name: "Top en su categoría",
      description: "Entre los mejor calificados de su especialidad",
      icon: "🏆",
    },
    {
      slug: "super-pro",
      name: "Super Profesional",
      description: "Más de 50 trabajos completados con 5 estrellas",
      icon: "⭐",
    },
    {
      slug: "verificado-plus",
      name: "Verificado Plus",
      description: "Identidad y referencias verificadas",
      icon: "✅",
    },
  ]

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { slug: badge.slug },
      update: badge,
      create: badge,
    })
  }
  console.log(`✅ ${badges.length} insignias creadas`)

  // ─── 4. Usuarios de prueba ─────────────────────────────────────────
  // NOTA: En producción, los usuarios se crean vía webhook de Clerk.
  // Estos son solo para desarrollo local con Clerk en modo test.
  console.log("👤 Creando usuarios de prueba...")

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@chambape.pe" },
    update: {},
    create: {
      clerkId: "dev_admin_001",
      email: "admin@chambape.pe",
      name: "Admin ChambaPe",
      role: "ADMIN",
      active: true,
    },
  })

  const clienteUser = await prisma.user.upsert({
    where: { email: "rosa.quispe@gmail.com" },
    update: {},
    create: {
      clerkId: "dev_client_001",
      email: "rosa.quispe@gmail.com",
      name: "Rosa Quispe",
      phone: "+51 987 654 321",
      role: "CLIENT",
      active: true,
    },
  })

  const clienteUser2 = await prisma.user.upsert({
    where: { email: "mario.condori@gmail.com" },
    update: {},
    create: {
      clerkId: "dev_client_002",
      email: "mario.condori@gmail.com",
      name: "Mario Condori",
      phone: "+51 976 543 210",
      role: "CLIENT",
      active: true,
    },
  })

  const profesional1 = await prisma.user.upsert({
    where: { email: "carlos.mamani@gmail.com" },
    update: {},
    create: {
      clerkId: "dev_pro_001",
      email: "carlos.mamani@gmail.com",
      name: "Carlos Mamani",
      phone: "+51 965 432 109",
      role: "PROFESSIONAL",
      active: true,
    },
  })

  const profesional2 = await prisma.user.upsert({
    where: { email: "juan.huanca@gmail.com" },
    update: {},
    create: {
      clerkId: "dev_pro_002",
      email: "juan.huanca@gmail.com",
      name: "Juan Huanca",
      phone: "+51 954 321 098",
      role: "PROFESSIONAL",
      active: true,
    },
  })

  const profesional3 = await prisma.user.upsert({
    where: { email: "luz.flores@gmail.com" },
    update: {},
    create: {
      clerkId: "dev_pro_003",
      email: "luz.flores@gmail.com",
      name: "Luz Flores",
      phone: "+51 943 210 987",
      role: "PROFESSIONAL",
      active: true,
    },
  })

  console.log("✅ 6 usuarios de prueba creados")

  // ─── 5. Perfiles profesionales de prueba ──────────────────────────
  console.log("🔧 Creando perfiles profesionales...")

  const catGasfiteria = await prisma.serviceCategory.findUnique({
    where: { slug: "gasfiteria" },
  })
  const catElectricidad = await prisma.serviceCategory.findUnique({
    where: { slug: "electricidad" },
  })
  const catLimpieza = await prisma.serviceCategory.findUnique({
    where: { slug: "limpieza-hogar" },
  })

  // Perfil 1: Carlos Mamani — Gasfitero verificado
  const perfil1 = await prisma.professionalProfile.upsert({
    where: { userId: profesional1.id },
    update: {},
    create: {
      userId: profesional1.id,
      dni: "47234567",
      bio: "Gasfitero con 8 años de experiencia en Lima. Especializado en filtraciones, instalación de sanitarios y termas. Trabajo garantizado. Atiendo San Isidro, Miraflores, Surco y alrededores.",
      districts: ["san-isidro", "miraflores", "surco", "barranco", "surquillo"],
      avgRating: 4.8,
      totalJobs: 47,
      credits: 12,
      status: "ACTIVE",
      verifiedAt: new Date("2025-06-15"),
      onboardingStep: 6,
    },
  })

  if (catGasfiteria) {
    await prisma.professionalCategory.upsert({
      where: {
        professionalId_categoryId: {
          professionalId: perfil1.id,
          categoryId: catGasfiteria.id,
        },
      },
      update: {},
      create: {
        professionalId: perfil1.id,
        categoryId: catGasfiteria.id,
      },
    })
  }

  // Perfil 2: Juan Huanca — Electricista verificado
  const perfil2 = await prisma.professionalProfile.upsert({
    where: { userId: profesional2.id },
    update: {},
    create: {
      userId: profesional2.id,
      dni: "46123456",
      bio: "Electricista certificado con 12 años en instalaciones residenciales y comerciales. Tableros, tomacorrientes, iluminación LED. Garantía en todos mis trabajos. Cubro Lima Norte y Centro.",
      districts: ["los-olivos", "san-martin-de-porres", "independencia", "comas", "rimac"],
      avgRating: 4.9,
      totalJobs: 83,
      credits: 28,
      status: "ACTIVE",
      verifiedAt: new Date("2025-04-20"),
      onboardingStep: 6,
    },
  })

  if (catElectricidad) {
    await prisma.professionalCategory.upsert({
      where: {
        professionalId_categoryId: {
          professionalId: perfil2.id,
          categoryId: catElectricidad.id,
        },
      },
      update: {},
      create: {
        professionalId: perfil2.id,
        categoryId: catElectricidad.id,
      },
    })
  }

  // Perfil 3: Luz Flores — Diarista/Limpieza verificada
  const perfil3 = await prisma.professionalProfile.upsert({
    where: { userId: profesional3.id },
    update: {},
    create: {
      userId: profesional3.id,
      dni: "45987654",
      bio: "Profesional de limpieza con 5 años de experiencia. Ofrezco limpieza general, profunda y post-obra. Puntual, confiable y con referencias comprobadas. Disponible de lunes a sábado.",
      districts: ["miraflores", "san-borja", "la-molina", "san-isidro", "surco"],
      avgRating: 4.7,
      totalJobs: 62,
      credits: 8,
      status: "ACTIVE",
      verifiedAt: new Date("2025-08-10"),
      onboardingStep: 6,
    },
  })

  if (catLimpieza) {
    await prisma.professionalCategory.upsert({
      where: {
        professionalId_categoryId: {
          professionalId: perfil3.id,
          categoryId: catLimpieza.id,
        },
      },
      update: {},
      create: {
        professionalId: perfil3.id,
        categoryId: catLimpieza.id,
      },
    })
  }

  console.log("✅ 3 perfiles profesionales creados")

  // ─── 6. Solicitud de prueba ────────────────────────────────────────
  console.log("📋 Creando solicitudes de prueba...")

  const catGasfit = await prisma.serviceCategory.findUnique({ where: { slug: "gasfiteria" } })
  const subcat = await prisma.serviceSubcategory.findUnique({ where: { slug: "filtraciones" } })

  if (catGasfit && subcat) {
    await prisma.serviceRequest.upsert({
      where: { id: "seed_request_001" },
      update: {},
      create: {
        id: "seed_request_001",
        clientId: clienteUser.id,
        categoryId: catGasfit.id,
        subcategoryId: subcat.id,
        title: "Filtración en el baño principal",
        description:
          "Tengo una filtración en la pared del baño que está manchando la sala del vecino de abajo. Es urgente. El problema viene del inodoro o la tubería detrás de la pared.",
        district: "miraflores",
        urgency: "TODAY",
        budgetMin: 80,
        budgetMax: 200,
        preferredTime: "Mañanas (8am - 12pm)",
        status: "OPEN",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })
  }

  console.log("✅ 1 solicitud de prueba creada")

  // ─── 7. Insignias para profesionales ──────────────────────────────
  const badgeRapido = await prisma.badge.findUnique({ where: { slug: "responde-rapido" } })
  const badgeTop = await prisma.badge.findUnique({ where: { slug: "top-categoria" } })

  if (badgeRapido) {
    await prisma.professionalBadge.upsert({
      where: { professionalId_badgeId: { professionalId: perfil2.id, badgeId: badgeRapido.id } },
      update: {},
      create: { professionalId: perfil2.id, badgeId: badgeRapido.id },
    })
  }

  if (badgeTop) {
    await prisma.professionalBadge.upsert({
      where: { professionalId_badgeId: { professionalId: perfil2.id, badgeId: badgeTop.id } },
      update: {},
      create: { professionalId: perfil2.id, badgeId: badgeTop.id },
    })
  }

  console.log("\n🎉 Seed completado exitosamente!")
  console.log("─────────────────────────────────")
  console.log(`📂 ${CATEGORIAS.length} categorías`)
  console.log(`💳 ${PAQUETES_CREDITOS.length} paquetes de créditos`)
  console.log(`🏅 ${badges.length} insignias`)
  console.log("👤 6 usuarios (1 admin, 2 clientes, 3 profesionales)")
  console.log("📋 1 solicitud de prueba")
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
