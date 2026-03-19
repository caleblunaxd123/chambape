import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, CheckCircle2, Star, Shield, MapPin, Wrench } from "lucide-react"
import { CATEGORIAS } from "@/constants/categorias"
import { DISTRITOS } from "@/constants/distritos"
import { LandingHeader } from "@/components/landing/LandingHeader"

// ─── Static params ────────────────────────────────────────────────────────────

export function generateStaticParams() {
  return CATEGORIAS.map((c) => ({ categoria: c.slug }))
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categoria: string }>
}): Promise<Metadata> {
  const { categoria } = await params
  const cat = CATEGORIAS.find((c) => c.slug === categoria)
  if (!cat) return {}

  const title = `${cat.name} en Lima — Técnicos verificados | ChambaPe`
  const description = `Encuentra ${cat.name.toLowerCase()} profesionales en Lima. Cotizaciones gratis, técnicos verificados y atención rápida en todos los distritos. ${cat.description}`

  return {
    title,
    description,
    keywords: [
      `${cat.name.toLowerCase()} Lima`,
      `${cat.name.toLowerCase()} cerca de mi`,
      `contratar ${cat.name.toLowerCase()} Lima`,
      `precio ${cat.name.toLowerCase()} Lima`,
      `técnico ${cat.name.toLowerCase()} Lima`,
    ],
    openGraph: {
      title,
      description,
      locale: "es_PE",
      type: "website",
    },
    alternates: {
      canonical: `https://chambape.com/${categoria}`,
    },
  }
}

// ─── JSON-LD structured data ──────────────────────────────────────────────────

function ServiceJsonLd({ cat }: { cat: (typeof CATEGORIAS)[0] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: cat.name,
    description: cat.description,
    provider: {
      "@type": "LocalBusiness",
      name: "ChambaPe",
      url: "https://chambape.com",
      areaServed: { "@type": "City", name: "Lima", containedInPlace: { "@type": "Country", name: "Peru" } },
    },
    areaServed: { "@type": "City", name: "Lima" },
    offers: {
      "@type": "Offer",
      priceCurrency: "PEN",
      availability: "https://schema.org/InStock",
      description: "Cotización gratuita",
    },
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CategoriaPage({
  params,
}: {
  params: Promise<{ categoria: string }>
}) {
  const { categoria } = await params
  const cat = CATEGORIAS.find((c) => c.slug === categoria)
  if (!cat) notFound()

  // Distritos populares para mostrar (primeros 12)
  const distritosDestacados = DISTRITOS.slice(0, 12)

  return (
    <>
      <ServiceJsonLd cat={cat} />
      <div className="min-h-screen bg-white">
        <LandingHeader />

        {/* HERO */}
        <section
          className="pt-24 pb-16 text-center relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #fff7ed 0%, #fff 60%)" }}
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-100/50 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 py-1.5 px-4 rounded-full mb-6 text-xs font-bold text-orange-700">
              <span>{cat.icon}</span> Servicio disponible en Lima
            </div>
            <h1
              className="text-4xl md:text-6xl font-black text-slate-900 mb-5 tracking-tight"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              {cat.name}{" "}
              <span className="text-orange-500">en Lima</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Conectamos con los mejores {cat.name.toLowerCase()} de Lima. Técnicos verificados,
              reseñas reales y cotizaciones gratis en minutos.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={`/solicitudes/nueva?categoria=${cat.slug}`}
                className="inline-flex items-center gap-2 text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-orange-500/25 hover:-translate-y-0.5 transition-all text-base"
                style={{ background: "var(--brand-gradient)" }}
              >
                <Wrench className="w-5 h-5" />
                Solicitar {cat.name.toLowerCase()} gratis
              </Link>
              <Link
                href="/profesionales"
                className="inline-flex items-center gap-2 bg-slate-900 text-white font-bold px-8 py-4 rounded-2xl hover:bg-slate-800 transition-all text-base"
              >
                Ver técnicos disponibles
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {/* Trust */}
            <div className="flex flex-wrap justify-center gap-6 mt-8">
              {[
                { icon: <Shield className="w-4 h-4 text-emerald-500" />, text: "Técnicos verificados" },
                { icon: <Star className="w-4 h-4 text-amber-400" />, text: "4.8 valoración promedio" },
                { icon: <CheckCircle2 className="w-4 h-4 text-blue-500" />, text: "Cotización gratuita" },
              ].map((t) => (
                <span key={t.text} className="flex items-center gap-1.5 text-sm text-slate-600 font-semibold">
                  {t.icon} {t.text}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* DISTRITOS */}
        <section className="py-16 bg-[#f8f7f5]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h2
              className="text-2xl md:text-3xl font-black text-slate-900 mb-2 text-center"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              {cat.name} por distrito en Lima
            </h2>
            <p className="text-slate-500 text-center mb-10">
              Encuentra el técnico más cercano a tu zona
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {distritosDestacados.map((dist) => (
                <Link
                  key={dist.slug}
                  href={`/${cat.slug}/${dist.slug}`}
                  className="group bg-white border border-slate-100 rounded-2xl px-4 py-3 flex items-center gap-2 hover:border-orange-200 hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <MapPin className="w-4 h-4 text-orange-400 shrink-0" />
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-orange-600 transition-colors">
                    {dist.name}
                  </span>
                </Link>
              ))}
            </div>
            <div className="text-center mt-6">
              <p className="text-sm text-slate-500">
                Y {DISTRITOS.length - 12} distritos más en Lima y Callao
              </p>
            </div>
          </div>
        </section>

        {/* SUBCATEGORÍAS */}
        {cat.subcategorias && cat.subcategorias.length > 0 && (
          <section className="py-16 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
              <h2
                className="text-2xl font-black text-slate-900 mb-8 text-center"
                style={{ fontFamily: "Outfit, sans-serif" }}
              >
                Tipos de {cat.name.toLowerCase()} que ofrecemos
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {cat.subcategorias.map((sub) => (
                  <div key={sub} className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="text-slate-700 text-sm font-medium">{sub}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA FINAL */}
        <section className="py-16 bg-white">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
            <div
              className="rounded-[2.5rem] p-10 text-white relative overflow-hidden"
              style={{ background: "var(--brand-gradient)" }}
            >
              <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
              <h2
                className="text-2xl md:text-3xl font-black mb-3 relative z-10"
                style={{ fontFamily: "Outfit, sans-serif" }}
              >
                ¿Necesitas {cat.name.toLowerCase()} ahora?
              </h2>
              <p className="text-orange-100 mb-6 relative z-10">
                Publica tu solicitud gratis y recibe propuestas de técnicos verificados en minutos.
              </p>
              <Link
                href={`/solicitudes/nueva?categoria=${cat.slug}`}
                className="inline-flex items-center gap-2 bg-white text-orange-600 font-bold px-8 py-3 rounded-xl hover:-translate-y-0.5 transition-all shadow-lg relative z-10"
              >
                Solicitar gratis
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* FOOTER SIMPLE */}
        <footer className="border-t border-slate-100 py-6 text-center text-sm text-slate-400">
          © {new Date().getFullYear()} ChambaPe — {cat.name} en Lima, Perú
        </footer>
      </div>
    </>
  )
}
