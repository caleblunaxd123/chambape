import { Mail, MessageCircle } from "lucide-react"
import { ContactoForm } from "@/components/shared/ContactoForm"

export const metadata = {
  title: "Contacto — ChambaPe",
  description: "Escríbenos tus dudas, sugerencias o reporta un problema. Te respondemos en menos de 24 horas.",
}

export default function ContactoPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        <span className="section-label mb-3">Estamos para ayudarte</span>
        <h1
          className="text-3xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight"
          style={{ fontFamily: "Outfit, sans-serif" }}
        >
          Contáctanos
        </h1>
        <p className="text-slate-500 text-lg mb-10 max-w-xl">
          ¿Tienes una duda, un problema con tu cuenta o una sugerencia? Escríbenos
          y te responderemos en menos de 24 horas.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <ContactoForm />

          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">Email</p>
                <p className="text-slate-500 text-sm">hola@chambape.pe</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">Chat en vivo</p>
                <p className="text-slate-500 text-sm">
                  Usa el botón de chat en la esquina inferior derecha para hablar con Chamby, nuestro asistente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
