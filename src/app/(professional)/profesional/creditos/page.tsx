"use client"

import { useEffect, useState } from "react"
import Script from "next/script"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Coins, Zap, Crown, Star, History, CheckCircle2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Tipos Culqi ─────────────────────────────────────────────────
declare global {
  interface Window {
    Culqi: {
      publicKey: string
      settings: (cfg: {
        title: string
        currency: string
        description: string
        amount: number
      }) => void
      open: () => void
      close: () => void
      token?: { id: string; email: string }
    }
    culqi: () => void
  }
}

// ─── Paquetes (hardcoded para el cliente, validado en servidor) ────
const PACKAGES = [
  {
    id: "starter",
    name: "Starter",
    credits: 10,
    price: 15,
    priceLabel: "S/.15",
    icon: <Zap className="w-5 h-5 text-blue-500" />,
    color: "border-blue-200",
    bg: "bg-blue-50",
    popular: false,
    features: ["10 créditos", "Ideal para empezar", "Válidos por 1 año"],
  },
  {
    id: "pro",
    name: "Pro",
    credits: 30,
    price: 35,
    priceLabel: "S/.35",
    icon: <Star className="w-5 h-5 text-orange-500" />,
    color: "border-orange-300",
    bg: "bg-orange-50",
    popular: true,
    features: ["30 créditos", "Ahorro de S/.10", "Recomendado para activos"],
  },
  {
    id: "master",
    name: "Master",
    credits: 70,
    price: 70,
    priceLabel: "S/.70",
    icon: <Crown className="w-5 h-5 text-purple-500" />,
    color: "border-purple-200",
    bg: "bg-purple-50",
    popular: false,
    features: ["70 créditos", "Mejor precio por crédito", "Para profesionales top"],
  },
]

// ─── Transaction type (from API) ──────────────────────────────────
interface Transaction {
  id: string
  amount: number
  type: string
  description: string
  createdAt: string
}

interface ProfileData {
  credits: number
  transactions: Transaction[]
}

export default function CreditosPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [selectedPkg, setSelectedPkg] = useState<(typeof PACKAGES)[0] | null>(null)
  const [culqiReady, setCulqiReady] = useState(false)
  const [purchasing, setPurchasing] = useState(false)

  // Cargar saldo y historial
  useEffect(() => {
    fetch("/api/creditos/balance")
      .then((r) => r.json())
      .then((data) => setProfile(data))
      .catch(() => toast.error("Error al cargar el saldo"))
      .finally(() => setLoadingProfile(false))
  }, [])

  // Abrir checkout de Culqi al seleccionar un paquete
  function handleBuy(pkg: (typeof PACKAGES)[0]) {
    if (!culqiReady || !window.Culqi) {
      toast.error("El sistema de pagos no está listo. Recarga la página.")
      return
    }

    setSelectedPkg(pkg)

    window.Culqi.publicKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY ?? ""
    window.Culqi.settings({
      title: "ChambaPe",
      currency: "PEN",
      description: `${pkg.name} — ${pkg.credits} créditos`,
      amount: pkg.price * 100, // en centimos
    })

    // Callback que Culqi llama tras tokenización exitosa
    window.culqi = async function () {
      if (!window.Culqi.token) {
        window.Culqi.close()
        return
      }

      const token = window.Culqi.token.id
      window.Culqi.close()
      setPurchasing(true)

      try {
        const res = await fetch("/api/creditos/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, packageId: pkg.id }),
        })
        const json = await res.json()

        if (!res.ok) {
          toast.error(json.error ?? "Error al procesar el pago")
          return
        }

        toast.success(
          `¡${json.credits} créditos añadidos! Nuevo saldo: ${json.newBalance} créditos 🎉`
        )
        // Refrescar saldo
        setProfile((prev) =>
          prev ? { ...prev, credits: json.newBalance } : prev
        )
        router.refresh()
      } catch {
        toast.error("Error de conexión. Intenta de nuevo.")
      } finally {
        setPurchasing(false)
        setSelectedPkg(null)
      }
    }

    window.Culqi.open()
  }

  return (
    <>
      {/* Cargar Culqi.js */}
      <Script
        src="https://checkout.culqi.com/js/v4"
        strategy="lazyOnload"
        onLoad={() => setCulqiReady(true)}
      />

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header con saldo */}
        <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-6 text-white mb-6">
          <p className="text-sm text-orange-100 mb-1">Tu saldo actual</p>
          {loadingProfile ? (
            <div className="w-24 h-10 bg-white/20 rounded-lg animate-pulse" />
          ) : (
            <div className="flex items-end gap-2">
              <span className="text-5xl font-extrabold">{profile?.credits ?? 0}</span>
              <span className="text-lg text-orange-100 mb-1">créditos</span>
            </div>
          )}
          <p className="text-xs text-orange-100 mt-2">
            Cada crédito te permite aplicar a una solicitud de servicio
          </p>
        </div>

        {/* ¿Cómo funcionan los créditos? */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-sm text-gray-600">
          <h3 className="font-bold text-gray-800 mb-2">¿Cómo funcionan los créditos?</h3>
          <ul className="space-y-1.5">
            {[
              "Cada vez que aplicas a una solicitud, se descuentan créditos según la categoría (3–8 créditos).",
              "Los créditos no expiran. Son tuyos hasta que los uses.",
              "El pago es procesado de forma segura por Culqi, la pasarela líder en Perú.",
            ].map((t, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Paquetes */}
        <h2 className="text-base font-bold text-gray-900 mb-3">Elige un paquete</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          {PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={cn(
                "relative bg-white border-2 rounded-2xl p-4 flex flex-col gap-3 transition-all",
                pkg.popular
                  ? "border-orange-400 shadow-md shadow-orange-100"
                  : pkg.color
              )}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-3 py-0.5 rounded-full whitespace-nowrap">
                  Más popular
                </div>
              )}

              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", pkg.bg)}>
                {pkg.icon}
              </div>

              <div>
                <p className="font-bold text-gray-900">{pkg.name}</p>
                <p className="text-2xl font-extrabold text-gray-900 mt-0.5">
                  {pkg.priceLabel}
                </p>
                <p className="text-xs text-gray-400">{pkg.credits} créditos</p>
              </div>

              <ul className="space-y-1 flex-1">
                {pkg.features.map((f) => (
                  <li key={f} className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleBuy(pkg)}
                disabled={purchasing && selectedPkg?.id === pkg.id}
                className={cn(
                  "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-colors",
                  pkg.popular
                    ? "bg-orange-500 hover:bg-orange-600 text-white"
                    : "bg-gray-900 hover:bg-gray-800 text-white"
                )}
              >
                {purchasing && selectedPkg?.id === pkg.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Coins className="w-4 h-4" />
                    Comprar
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Historial de transacciones */}
        <div>
          <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
            <History className="w-4 h-4 text-gray-400" />
            Historial de créditos
          </h2>

          {loadingProfile ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : !profile?.transactions.length ? (
            <p className="text-sm text-gray-400 text-center py-8">
              Aún no hay movimientos de créditos.
            </p>
          ) : (
            <div className="space-y-2">
              {profile.transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">{tx.description}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(tx.createdAt).toLocaleDateString("es-PE", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "text-sm font-bold",
                      tx.amount > 0 ? "text-green-600" : "text-red-500"
                    )}
                  >
                    {tx.amount > 0 ? `+${tx.amount}` : tx.amount} cr
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
