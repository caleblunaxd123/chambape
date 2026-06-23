import Link from "next/link"

export const metadata = {
  title: "Política de privacidad — ChambaPe",
  description: "Cómo ChambaPe recopila, usa y protege tus datos personales.",
}

const SECCIONES = [
  {
    title: "1. Responsable del tratamiento",
    body: `ChambaPe trata tus datos personales conforme a la Ley N.º 29733 de Protección de Datos Personales del Perú y su reglamento. Al usar la plataforma aceptas el tratamiento de tus datos según lo descrito en esta política.`,
  },
  {
    title: "2. Datos que recopilamos",
    body: `Recopilamos los datos que nos proporcionas al registrarte (nombre, email, teléfono, distrito), los datos de tu solicitud o perfil profesional (descripción del trabajo, fotos, categorías, documentos de verificación), y datos técnicos de uso de la plataforma (dispositivo, IP, cookies).`,
  },
  {
    title: "3. Para qué usamos tus datos",
    body: `Usamos tus datos para: mostrar tu solicitud a profesionales de tu zona o mostrarte solicitudes relevantes, verificar identidad de profesionales, procesar pagos de créditos, enviarte notificaciones del servicio (email, in-app), prevenir fraude y mejorar la plataforma. No vendemos tus datos a terceros.`,
  },
  {
    title: "4. Con quién compartimos datos",
    body: `Compartimos datos de contacto del cliente con el profesional que acepta o aplica a su solicitud (y viceversa), ya que es necesario para coordinar el servicio. También compartimos datos con proveedores que nos ayudan a operar la plataforma: Clerk (autenticación), Cloudinary (almacenamiento de imágenes), Resend (envío de emails) y Culqi/MercadoPago (procesamiento de pagos). Estos proveedores solo acceden a los datos necesarios para su función.`,
  },
  {
    title: "5. Conservación de datos",
    body: `Conservamos tus datos mientras tu cuenta esté activa. Puedes solicitar la eliminación de tu cuenta y datos asociados escribiéndonos desde la página de contacto, salvo información que debamos conservar por obligación legal (p. ej. comprobantes de pago).`,
  },
  {
    title: "6. Tus derechos (ARCO)",
    body: `Tienes derecho a acceder, rectificar, cancelar u oponerte (derechos ARCO) al tratamiento de tus datos personales. Para ejercerlos, escríbenos desde la página de contacto indicando tu solicitud; responderemos dentro del plazo legal establecido.`,
  },
  {
    title: "7. Cookies",
    body: `Usamos cookies esenciales para mantener tu sesión iniciada y cookies de análisis para entender el uso de la plataforma y mejorar la experiencia.`,
  },
  {
    title: "8. Seguridad",
    body: `Aplicamos medidas técnicas y organizativas razonables para proteger tus datos contra acceso no autorizado, pérdida o alteración. Ningún sistema es 100% infalible; si detectas una vulnerabilidad, repórtala desde la página de contacto.`,
  },
  {
    title: "9. Cambios a esta política",
    body: `Podemos actualizar esta política para reflejar cambios legales o del servicio. La fecha de última actualización se indica en esta página.`,
  },
]

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        <span className="section-label mb-3">Legal</span>
        <h1
          className="text-3xl md:text-4xl font-black text-slate-900 mb-2 tracking-tight"
          style={{ fontFamily: "Outfit, sans-serif" }}
        >
          Política de privacidad
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
          Ver también nuestros{" "}
          <Link href="/terminos" className="text-orange-600 font-semibold hover:text-orange-700">
            Términos de uso
          </Link>
          .
        </div>
      </div>
    </div>
  )
}
