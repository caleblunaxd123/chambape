import type { Metadata } from "next";
import Link from "next/link";
import { SchemaOrgFAQ } from "@/components/shared/SchemaOrg";

const DISTRITOS: Record<string, { nombre: string; servicios: string[] }> = {
  miraflores:   { nombre: "Miraflores",   servicios: ["gasfitero", "electricista", "pintor", "carpintero"] },
  "san-isidro": { nombre: "San Isidro",   servicios: ["gasfitero", "electricista", "pintor", "cerrajero"] },
  surco:        { nombre: "Surco",        servicios: ["gasfitero", "electricista", "pintor", "mudanza"] },
  "la-molina":  { nombre: "La Molina",   servicios: ["gasfitero", "electricista", "limpieza", "fumigación"] },
  "san-borja":  { nombre: "San Borja",   servicios: ["gasfitero", "electricista", "pintor", "carpintero"] },
  barranco:     { nombre: "Barranco",    servicios: ["gasfitero", "electricista", "pintor", "cerrajero"] },
  "los-olivos": { nombre: "Los Olivos",  servicios: ["gasfitero", "electricista", "pintor", "mudanza"] },
  independencia:{ nombre: "Independencia", servicios: ["gasfitero", "electricista", "pintor", "limpieza"] },
  ate:          { nombre: "Ate",          servicios: ["gasfitero", "electricista", "pintor", "fumigación"] },
  "jesus-maria":{ nombre: "Jesús María", servicios: ["gasfitero", "electricista", "cerrajero", "carpintero"] },
};

type Props = { params: { distrito: string } };

export async function generateStaticParams() {
  return Object.keys(DISTRITOS).map((d) => ({ distrito: d }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const d = DISTRITOS[params.distrito];
  if (!d) return {};
  return {
    title: `Técnicos en ${d.nombre} — Gasfiteros, Electricistas y más | ChambaPe`,
    description: `Encuentra ${d.servicios.join(", ")} y otros técnicos verificados en ${d.nombre}, Lima. Presupuestos gratis, técnicos con DNI verificado. ¡Contrata hoy!`,
    alternates: { canonical: `https://www.chambape.pe/tecnicos-en-${params.distrito}` },
  };
}

export default function TecnicosDistritoPage({ params }: Props) {
  const d = DISTRITOS[params.distrito];
  if (!d) return <div>Distrito no encontrado</div>;

  return (
    <>
      <SchemaOrgFAQ />
      <main className="min-h-screen bg-gray-50">

        {/* Hero */}
        <section className="bg-orange-500 text-white py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">
              Técnicos en {d.nombre}, Lima
            </h1>
            <p className="text-xl text-orange-100 mb-8">
              {d.servicios.map(s => s.charAt(0).toUpperCase()+s.slice(1)).join(", ")} y más profesionales verificados cerca de ti.
              Presupuestos gratis en minutos.
            </p>
            <Link
              href="/solicitudes/nueva"
              className="bg-white text-orange-500 font-bold px-8 py-4 rounded-full text-lg hover:bg-orange-50 transition-colors"
            >
              Publicar mi solicitud gratis →
            </Link>
          </div>
        </section>

        {/* Servicios disponibles */}
        <section className="max-w-4xl mx-auto py-16 px-4">
          <h2 className="text-2xl font-bold text-center mb-8">
            Servicios disponibles en {d.nombre}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["Gasfitería", "Electricidad", "Pintura", "Carpintería", "Cerrajería", "Limpieza", "Fumigación", "Mudanzas"].map(s => (
              <Link
                key={s}
                href={`/solicitudes/nueva?servicio=${s.toLowerCase()}`}
                className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="text-2xl mb-2">🔧</div>
                <p className="font-semibold text-gray-800">{s}</p>
                <p className="text-sm text-gray-500 mt-1">en {d.nombre}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Por qué ChambaPe */}
        <section className="bg-white py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-12">
              ¿Por qué elegir ChambaPe en {d.nombre}?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl mb-4">✅</div>
                <h3 className="font-bold mb-2">Técnicos verificados</h3>
                <p className="text-gray-600">Verificación de DNI con selfie y revisión de antecedentes</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">💰</div>
                <h3 className="font-bold mb-2">Presupuestos gratis</h3>
                <p className="text-gray-600">Recibe múltiples propuestas y elige el mejor precio</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="font-bold mb-2">Respuesta rápida</h3>
                <p className="text-gray-600">Técnicos disponibles en tu distrito responden en minutos</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="bg-orange-500 text-white py-16 px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            ¿Necesitas un técnico en {d.nombre} ahora?
          </h2>
          <p className="text-orange-100 mb-8 text-lg">Publica tu solicitud en 2 minutos y recibe propuestas</p>
          <Link
            href="/solicitudes/nueva"
            className="bg-white text-orange-500 font-bold px-8 py-4 rounded-full text-lg hover:bg-orange-50"
          >
            Publicar solicitud gratis
          </Link>
        </section>
      </main>
    </>
  );
}
