import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, CheckCircle2, Star, Shield, MapPin, Wrench, Phone } from "lucide-react"
import { CATEGORIAS } from "@/constants/categorias"
import { DISTRITOS } from "@/constants/distritos"
import { LandingHeader } from "@/components/landing/LandingHeader"

// ─── Static params ────────────────────────────────────────────────────────────

export function generateStaticParams() {
  return CATEGORIAS.flatMap((cat) =>
    DISTRITOS.map((dist) => ({
      categoria: cat.slug,
      distrito: dist.slug,
    }))
  )
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categoria: string; distrito: string }>
}): Promise<Metadata> {
  const { categoria, distrito } = await params
  const cat = CATEGORIAS.find((c) => c.slug === categoria)
  const dist = DISTRITOS.find((d) => d.slug === distrito)
  if (!cat || !dist) return {}

  const title = `${cat.name} en ${dist.name} — Técnicos verificados | ChambaPe`
  const description = `Encuentra ${cat.name.toLowerCase()} profesionales en ${dist.name}, Lima. Cotizaciones gratis, técnicos verificados y atención rápida. ${cat.description}`

  return {
    title,
    description,
    keywords: [
      `${cat.name.toLowerCase()} ${dist.name}`,
      `${cat.name.toLowerCase()} ${dist.name} Lima`,
      `técnico ${cat.name.toLowerCase()} ${dist.name}`,
      `contratar ${cat.name.toLowerCase()} ${dist.name}`,
      `precio ${cat.name.toLowerCase()} ${dist.name}`,
    ],
    openGraph: {
      title,
      description,
      locale: "es_PE",
      type: "website",
    },
    alternates: {
      canonical: `https://chambape.com/${categoria}/${distrito}`,
    },
  }
}

// ─── JSON-LD structured data ──────────────────────────────────────────────────

function LocalServiceJsonLd({
  cat,
  dist,
}: {
  cat: (typeof CATEGORIAS)[0]
  dist: (typeof DISTRITOS)[0]
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: `ChambaPe — ${cat.name} en ${dist.name}`,
    description: `Servicio de ${cat.name.toLowerCase()} en ${dist.name}, Lima. Técnicos verificados con reseñas reales.`,
    url: `https://chambape.com/${cat.slug}/${dist.slug}`,
    areaServed: {
      "@type": "Place",
      name: dist.name,
      containedInPlace: { "@type": "City", name: "Lima", containedInPlace: { "@type": "Country", name: "Peru" } },
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: cat.name,
      itemListElement: cat.subcategorias.map((sub) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: sub.name },
      })),
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "120",
    },
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
}

// ─── Distritos cercanos ───────────────────────────────────────────────────────

function getDistritosCercanos(currentSlug: string, limit = 8): (typeof DISTRITOS)[0][] {
  return DISTRITOS.filter((d) => d.slug !== currentSlug).slice(0, limit)
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CategoriaDistritoPage({
  params,
}: {
  params: Promise<{ categoria: string; distrito: string }>
}) {
  const { categoria, distrito } = await params
  const cat = CATEGORIAS.find((c) => c.slug === categoria)
  const dist = DISTRITOS.find((d) => d.slug === distrito)
  if (!cat || !dist) notFound()

  const cercanos = getDistritosCercanos(dist.slug)

  return (
    <>
      <LocalServiceJsonLd cat={cat} dist={dist} />
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
              <MapPin className="w-3.5 h-3.5" /> {dist.name} · {dist.provincia}
            </div>
            <h1
              className="text-4xl md:text-6xl font-black text-slate-900 mb-5 tracking-tight"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              {cat.name} en{" "}
              <span className="text-orange-500">{dist.name}</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Los mejores {cat.name.toLowerCase()} de {dist.name} están en ChambaPe. Técnicos verificados,
              reseñas reales y cotización gratis en minutos.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={`/solicitudes/nueva?categoria=${cat.slug}&distrito=${dist.slug}`}
                className="inline-flex items-center gap-2 text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-orange-500/25 hover:-translate-y-0.5 transition-all text-base"
                style={{ background: "var(--brand-gradient)" }}
              >
                <Wrench className="w-5 h-5" />
                Pedir {cat.name.toLowerCase()} en {dist.name}
              </Link>
              <Link
                href="/profesionales"
                className="inline-flex items-center gap-2 bg-slate-900 text-white font-bold px-8 py-4 rounded-2xl hover:bg-slate-800 transition-all text-base"
              >
                Ver técnicos disponibles
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {/* Trust chips */}
            <div className="flex flex-wrap justify-center gap-6 mt-8">
              {[
                { icon: <Shield className="w-4 h-4 text-emerald-500" />, text: "Técnicos verificados" },
                { icon: <Star className="w-4 h-4 text-amber-400" />, text: "4.8 valoración promedio" },
                { icon: <CheckCircle2 className="w-4 h-4 text-blue-500" />, text: "Cotización gratuita" },
                { icon: <Phone className="w-4 h-4 text-orange-500" />, text: "Respuesta en minutos" },
              ].map((t) => (
                <span key={t.text} className="flex items-center gap-1.5 text-sm text-slate-600 font-semibold">
                  {t.icon} {t.text}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* CÓMO FUNCIONA */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h2
              className="text-2xl md:text-3xl font-black text-slate-900 mb-10 text-center"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              ¿Cómo contratar {cat.name.toLowerCase()} en {dist.name}?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  num: "1",
                  title: "Publica tu solicitud",
                  desc: `Describe qué necesitas de ${cat.name.toLowerCase()} en ${dist.name}. Es gratis y tarda menos de 2 minutos.`,
                },
                {
                  num: "2",
                  title: "Recibe propuestas",
                  desc: "Técnicos verificados cercanos a tu zona te envían sus cotizaciones con precio y disponibilidad.",
                },
                {
                  num: "3",
                  title: "Elige y contrata",
                  desc: "Compara reseñas, experiencia y precio. Contrata al que más te convenza con total seguridad.",
                },
              ].map((paso) => (
                <div key={paso.num} className="bg-slate-50 rounded-2xl p-6">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg mb-4"
                    style={{ background: "var(--brand-gradient)" }}
                  >
                    {paso.num}
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{paso.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{paso.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SUBCATEGORÍAS */}
        {cat.subcategorias && cat.subcategorias.length > 0 && (
          <section className="py-16 bg-[#f8f7f5]">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
              <h2
                className="text-2xl font-black text-slate-900 mb-8 text-center"
                style={{ fontFamily: "Outfit, sans-serif" }}
              >
                Servicios de {cat.name.toLowerCase()} en {dist.name}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {cat.subcategorias.map((sub) => (
                  <div key={sub.slug} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="text-slate-700 text-sm font-medium">{sub.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* DISTRITOS CERCANOS */}
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h2
              className="text-2xl font-black text-slate-900 mb-2 text-center"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              {cat.name} en otros distritos de Lima
            </h2>
            <p className="text-slate-500 text-center mb-8 text-sm">
              También atendemos en zonas cercanas a {dist.name}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {cercanos.map((d) => (
                <Link
                  key={d.slug}
                  href={`/${cat.slug}/${d.slug}`}
                  className="group bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 flex items-center gap-2 hover:border-orange-200 hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <MapPin className="w-4 h-4 text-orange-400 shrink-0" />
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-orange-600 transition-colors">
                    {d.name}
                  </span>
                </Link>
              ))}
            </div>
            <div className="text-center mt-4">
              <Link
                href={`/${cat.slug}`}
                className="text-sm text-orange-600 font-semibold hover:underline"
              >
                Ver todos los distritos →
              </Link>
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="py-16 bg-[#f8f7f5]">
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
                ¿Necesitas {cat.name.toLowerCase()} en {dist.name}?
              </h2>
              <p className="text-orange-100 mb-6 relative z-10">
                Publica gratis y recibe propuestas de técnicos verificados en {dist.name} en minutos.
              </p>
              <Link
                href={`/solicitudes/nueva?categoria=${cat.slug}&distrito=${dist.slug}`}
                className="inline-flex items-center gap-2 bg-white text-orange-600 font-bold px-8 py-3 rounded-xl hover:-translate-y-0.5 transition-all shadow-lg relative z-10"
              >
                Solicitar gratis en {dist.name}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* FOOTER SIMPLE */}
        <footer className="border-t border-slate-100 py-6 text-center text-sm text-slate-400">
          © {new Date().getFullYear()} ChambaPe — {cat.name} en {dist.name}, Lima, Perú
        </footer>
      </div>
    </>
  )
}
