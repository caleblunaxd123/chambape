import Link from "next/link"

export const metadata = {
  title: "Términos de uso — ChambaPe",
  description: "Términos y condiciones de uso de la plataforma ChambaPe.",
}

const SECCIONES = [
  {
    title: "1. Qué es ChambaPe",
    body: `ChambaPe es una plataforma que conecta a clientes que necesitan un servicio del hogar (gasfitería, electricidad, pintura, carpintería, limpieza, entre otros) con técnicos y profesionales independientes en Lima y Callao. ChambaPe no presta los servicios directamente: actúa como intermediario tecnológico entre clientes y profesionales.`,
  },
  {
    title: "2. Registro de cuenta",
    body: `Para publicar solicitudes o aplicar a trabajos debes registrarte con datos reales y vigentes. Eres responsable de la confidencialidad de tu cuenta y de toda actividad realizada desde ella. ChambaPe puede suspender cuentas con información falsa, fraudulenta o que infrinjan estos términos.`,
  },
  {
    title: "3. Publicación de solicitudes (clientes)",
    body: `Publicar una solicitud de servicio es gratuito. El cliente describe el trabajo, su ubicación y elige libremente entre las propuestas recibidas. ChambaPe no garantiza un número mínimo de propuestas ni la disponibilidad inmediata de profesionales.`,
  },
  {
    title: "4. Sistema de créditos (profesionales)",
    body: `Los profesionales acceden a las solicitudes mediante un sistema de créditos prepagados. Cada categoría de servicio tiene un costo en créditos para contactar al cliente. Los créditos comprados no son reembolsables salvo error comprobado de la plataforma (p. ej. doble cobro o falla técnica). Los paquetes de créditos y sus precios pueden actualizarse; el cambio no afecta créditos ya adquiridos.`,
  },
  {
    title: "5. Relación entre cliente y profesional",
    body: `El acuerdo final sobre precio, alcance del trabajo, garantía y forma de pago del servicio se realiza directamente entre cliente y profesional. ChambaPe no es parte de ese contrato y no se responsabiliza por la calidad del trabajo, daños, incumplimientos o disputas derivadas de la prestación del servicio. Recomendamos verificar identidad y acordar condiciones por escrito antes de iniciar cualquier trabajo.`,
  },
  {
    title: "6. Verificación de profesionales",
    body: `La insignia de "verificado" indica que el profesional completó un proceso de validación de identidad y/o documentos en la plataforma. No constituye una garantía de la calidad del servicio prestado.`,
  },
  {
    title: "7. Reseñas y conducta",
    body: `Las reseñas deben basarse en experiencias reales y no deben contener contenido ofensivo, difamatorio o falso. ChambaPe puede moderar o eliminar contenido que incumpla estas reglas o que infrinja la ley peruana.`,
  },
  {
    title: "8. Pagos",
    body: `Los pagos de paquetes de créditos se procesan a través de pasarelas de pago de terceros (Culqi / MercadoPago). ChambaPe no almacena los datos completos de tarjetas de pago.`,
  },
  {
    title: "9. Modificaciones",
    body: `Podemos actualizar estos términos para reflejar cambios legales o del servicio. Publicaremos la fecha de la última actualización en esta página.`,
  },
  {
    title: "10. Contacto",
    body: `Si tienes dudas sobre estos términos, escríbenos desde nuestra página de contacto.`,
  },
]

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        <span className="section-label mb-3">Legal</span>
        <h1
          className="text-3xl md:text-4xl font-black text-slate-900 mb-2 tracking-tight"
          style={{ fontFamily: "Outfit, sans-serif" }}
        >
          Términos de uso
        </h1>
        <p className="text-sm text-slate-400 mb-10">Última actualización: junio de 2026</p>

        <div className="space-y-8">
          {SECCIONES.map((s) => (
            <section key={s.title}>
              <h2 className="text-lg font-bold text-slate-900 mb-2">{s.title}</h2>
              <p className="text-slate-600 leading-relaxed text-[15px]">{s.body}</p>
            </section>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-slate-100 text-sm text-slate-500">
          Ver también nuestra{" "}
          <Link href="/privacidad" className="text-orange-600 font-semibold hover:text-orange-700">
            Política de privacidad
          </Link>
          .
        </div>
      </div>
    </div>
  )
}
