"use client"

import { useEffect, useState } from "react"
import Script from "next/script"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Coins, Zap, Crown, Star, History, CheckCircle2, Loader2, ArrowRight } from "lucide-react"
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
    icon: <Zap className="w-6 h-6 text-blue-500" />,
    color: "border-gray-200 hover:border-blue-300",
    bg: "bg-blue-50 border border-blue-100",
    popular: false,
    features: ["10 créditos", "Ideal para empezar", "Válidos por 1 año"],
    btn: "bg-gray-900 hover:bg-gray-800",
  },
  {
    id: "pro",
    name: "Pro",
    credits: 30,
    price: 35,
    priceLabel: "S/.35",
    icon: <Star className="w-6 h-6 text-orange-500" />,
    color: "border-orange-400 shadow-[0_4px_24px_rgba(249,115,22,0.15)] scale-105 z-10",
    bg: "bg-orange-50 border border-orange-100",
    popular: true,
    features: ["30 créditos", "Ahorro de S/.10", "Recomendado para activos", "Soporte prioritario"],
    btn: "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md",
  },
  {
    id: "master",
    name: "Master",
    credits: 70,
    price: 70,
    priceLabel: "S/.70",
    icon: <Crown className="w-6 h-6 text-purple-500" />,
    color: "border-gray-200 hover:border-purple-300",
    bg: "bg-purple-50 border border-purple-100",
    popular: false,
    features: ["70 créditos", "Mejor precio por crédito", "Para profesionales top"],
    btn: "bg-gray-900 hover:bg-gray-800",
  },
]

// ─── Transaction type (from API) ──────────────────────────────────
interface Transaction {
  id: string
  credits: number
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

      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-8">
        {/* Header con saldo */}
        <div className="relative bg-[#1e1b4b] rounded-3xl p-8 sm:p-10 text-white overflow-hidden shadow-xl">
          <div className="absolute -top-24 -right-10 w-96 h-96 bg-orange-500 rounded-full blur-[100px] opacity-20 pointer-events-none" />
          <div className="relative z-10">
            <h1 className="text-2xl font-black mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>Créditos</h1>
            <p className="text-sm text-indigo-200 mb-6">Administra tu saldo para poder aplicar a más oportunidades.</p>
            
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div>
                <p className="text-sm font-bold text-indigo-300 uppercase tracking-widest mb-2">Tu saldo actual</p>
                {loadingProfile ? (
                  <div className="w-32 h-14 bg-white/10 rounded-2xl animate-pulse" />
                ) : (
                  <div className="flex items-baseline gap-3">
                    <span className="text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300" style={{ fontFamily: "Outfit, sans-serif" }}>
                      {profile?.credits ?? 0}
                    </span>
                    <span className="text-xl sm:text-2xl font-bold text-indigo-100">créditos</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ¿Cómo funcionan los créditos? */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-[0_2px_20px_rgba(0,0,0,0.03)] grid sm:grid-cols-3 gap-6">
          <div className="sm:col-span-1">
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center mb-4 border border-orange-100">
              <Zap className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className="text-lg font-black text-gray-900 mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>¿Cómo funcionan?</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Compra créditos para aplicar a las solicitudes de los clientes. El pago es seguro vía Culqi.
            </p>
          </div>
          <div className="sm:col-span-2 grid sm:grid-cols-2 gap-4 mt-2 sm:mt-0">
            {[
              "Cada aplicación cuesta entre 3 y 8 créditos según la categoría.",
              "Los créditos no expiran nunca. Son tuyos hasta que los uses.",
              "No cobramos comisión. Lo que ganes con el cliente es 100% tuyo.",
              "Aceptamos todas las tarjetas de crédito, débito y Yape.",
            ].map((t, i) => (
              <div key={i} className="flex items-start gap-3 bg-gray-50 p-4 rounded-2xl">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <p className="text-sm font-medium text-gray-700">{t}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Paquetes */}
        <div>
          <h2 className="text-2xl font-black text-gray-900 mb-6 text-center" style={{ fontFamily: "Outfit, sans-serif" }}>Elige tu paquete ideal</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 max-w-5xl mx-auto pt-4 pb-8 px-4 sm:px-0">
            {PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                className={cn(
                  "relative bg-white border-2 rounded-3xl p-6 sm:p-8 flex flex-col gap-6 transition-all duration-300",
                  pkg.color
                )}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-black uppercase tracking-wider px-4 py-1.5 rounded-full shadow-lg border border-orange-400">
                    Más popular
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", pkg.bg)}>
                    {pkg.icon}
                  </div>
                  {pkg.popular && <Star className="w-6 h-6 text-orange-400 fill-orange-400 shrink-0" />}
                </div>

                <div>
                  <p className="font-bold text-gray-400 uppercase tracking-widest text-xs mb-1">{pkg.name}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-black text-gray-900" style={{ fontFamily: "Outfit, sans-serif" }}>{pkg.priceLabel}</p>
                    <span className="text-sm font-bold text-gray-400">/ PEN</span>
                  </div>
                  <div className="mt-3 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 inline-flex items-center justify-center">
                    <p className="text-sm font-black text-gray-900">{pkg.credits} créditos</p>
                  </div>
                </div>

                <div className="flex-1">
                  <ul className="space-y-3">
                    {pkg.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm font-medium text-gray-600">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleBuy(pkg)}
                  disabled={purchasing && selectedPkg?.id === pkg.id}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all text-white mt-4",
                    pkg.btn
                  )}
                >
                  {purchasing && selectedPkg?.id === pkg.id ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      Comprar {pkg.name} <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Historial de transacciones */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-[0_2px_20px_rgba(0,0,0,0.03)]">
          <h2 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2" style={{ fontFamily: "Outfit, sans-serif" }}>
            <History className="w-5 h-5 text-gray-400" />
            Historial de movimientos
          </h2>

          {loadingProfile ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-50 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : !profile?.transactions.length ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                <History className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-base font-bold text-gray-900">Aún no hay movimientos</p>
              <p className="text-sm text-gray-400 mt-1">Aquí verás tus compras y usos de créditos.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {profile.transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between bg-white border border-gray-100 hover:border-gray-200 rounded-2xl px-5 py-4 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border", tx.credits > 0 ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-red-50 border-red-100 text-red-600")}>
                      {tx.credits > 0 ? <Coins className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{tx.description}</p>
                      <p className="text-xs font-medium text-gray-400 mt-0.5">
                        {new Date(tx.createdAt).toLocaleDateString("es-PE", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "text-base font-black px-3 py-1.5 rounded-lg",
                      tx.credits > 0 ? "text-emerald-700 bg-emerald-50" : "text-red-700 bg-red-50"
                    )}
                    style={{ fontFamily: "Outfit, sans-serif" }}
                  >
                    {tx.credits > 0 ? `+${tx.credits}` : tx.credits}
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
