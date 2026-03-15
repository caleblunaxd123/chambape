"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"
import { Coins, Zap, Crown, Star, History, CheckCircle2, Loader2, ArrowRight, ShieldCheck, Repeat } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Paquetes (hardcoded para el cliente, validado en servidor) ────
const PAC_RECARGAS = [
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
    features: ["10 créditos extras", "Pago único — no es suscripción", "Sin fecha de vencimiento"],
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
    features: ["30 créditos extras", "Ahorro de S/.10", "Pago único — no es suscripción", "Sin fecha de vencimiento"],
    btn: "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md",
  },
  {
    id: "master",
    name: "Master",
    credits: 70,
    price: 70,
    priceLabel: "S/.70",
    icon: <Crown className="w-6 h-6 text-amber-600" />,
    color: "border-gray-200 hover:border-amber-300",
    bg: "bg-amber-50 border border-amber-100",
    popular: false,
    features: ["70 créditos extras", "Precio más bajo por crédito", "Pago único — no es suscripción", "Sin fecha de vencimiento"],
    btn: "bg-gray-900 hover:bg-gray-800",
  },
]

const PLANES_MENSUALES = [
  {
    id: "plan-basico",
    name: "Básico",
    credits: 20,
    price: 19,
    priceLabel: "S/.19",
    period: "mes",
    icon: <Repeat className="w-6 h-6 text-emerald-500" />,
    color: "border-gray-200 hover:border-emerald-300",
    bg: "bg-emerald-50 border border-emerald-100",
    popular: false,
    features: ["20 créditos renovados al mes", "Renovación automática", "Cancela cuando quieras"],
    btn: "bg-gray-900 hover:bg-gray-800",
  },
  {
    id: "plan-pro",
    name: "Pro",
    credits: 50,
    price: 39,
    priceLabel: "S/.39",
    period: "mes",
    icon: <ShieldCheck className="w-6 h-6 text-orange-500" />,
    color: "border-orange-400 shadow-[0_4px_24px_rgba(249,115,22,0.15)] scale-105 z-10",
    bg: "bg-orange-50 border border-orange-100",
    popular: true,
    features: ["50 créditos renovados al mes", "Insignia Profesional Pro", "Soporte prioritario", "Cancela cuando quieras"],
    btn: "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md",
  },
]

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
  subscription?: {
    status: string
    planId: string
    nextBillingDate?: string
  }
}

export default function CreditosPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"SUBS" | "RECARGAS">("SUBS")

  useEffect(() => {
    const status = searchParams.get("status")
    const collectionId = searchParams.get("collection_id")
    const collectionStatus = searchParams.get("collection_status")

    if (status) {
      router.replace("/profesional/creditos", { scroll: false })
    }

    if (status === "failure") {
      toast.error("Hubo un problema con tu pago.")
      fetch("/api/creditos/balance")
        .then((r) => r.json())
        .then((data) => setProfile(data))
        .finally(() => setLoadingProfile(false))
      return
    }

    // Si MP redirige de vuelta con un pago aprobado, procesarlo inmediatamente
    if (collectionId && collectionStatus === "approved") {
      setLoadingProfile(true)
      fetch(`/api/creditos/verificar-mp?payment_id=${collectionId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.ok) {
            toast.success(`¡Créditos añadidos! Saldo actualizado.`)
          } else if (status === "success") {
            toast.success("¡Pago completado! Tus créditos han sido añadidos.")
          }
          // Recargar saldo actualizado
          return fetch("/api/creditos/balance").then((r) => r.json())
        })
        .then((data) => setProfile(data))
        .catch(() => toast.error("Error al verificar el pago"))
        .finally(() => setLoadingProfile(false))
      return
    }

    if (status === "success") toast.success("¡Pago completado! Tus créditos han sido añadidos.")
    if (status === "success_sub") toast.success("¡Suscripción activa! Ya tienes tus créditos mensuales.")

    fetch("/api/creditos/balance")
      .then((r) => r.json())
      .then((data) => setProfile(data))
      .catch(() => toast.error("Error al cargar el saldo"))
      .finally(() => setLoadingProfile(false))
  }, [searchParams, router])

  async function handleBuy(packageId: string, type: "ONE_TIME" | "SUBSCRIPTION") {
    setPurchasing(packageId)

    try {
      const res = await fetch("/api/creditos/checkout-mp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId, type }),
      })
      const json = await res.json()

      if (!res.ok) {
        toast.error(json.error ?? "Error al iniciar el pago")
        setPurchasing(null)
        return
      }

      // Redirigir a MercadoPago
      if (json.initPoint) {
        window.location.href = json.initPoint
      } else {
        toast.error("Error al obtener link de pago")
        setPurchasing(null)
      }
    } catch {
      toast.error("Error de conexión. Intenta de nuevo.")
      setPurchasing(null)
    }
  }

  const hasActiveSub = profile?.subscription?.status === "ACTIVE"

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-8">
      {/* Header con saldo */}
      <div className="relative rounded-3xl p-8 sm:p-10 text-white overflow-hidden shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6" style={{ background: "var(--brand-gradient)" }}>
        <div className="absolute -top-24 -right-10 w-96 h-96 bg-white rounded-full blur-[100px] opacity-10 pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-2xl font-black mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>Créditos</h1>
          <p className="text-sm text-orange-100">Adquiere créditos para aplicar a oportunidades de trabajo.</p>
        </div>

        <div className="relative z-10 text-right">
          <p className="text-sm font-bold text-orange-200 uppercase tracking-widest mb-1">Tu saldo actual</p>
          {loadingProfile ? (
            <div className="w-32 h-14 bg-white/10 rounded-2xl animate-pulse ml-auto" />
          ) : (
            <div className="flex items-baseline justify-end gap-3">
              <span className="text-6xl sm:text-7xl font-black text-white drop-shadow-lg" style={{ fontFamily: "Outfit, sans-serif" }}>
                {profile?.credits ?? 0}
              </span>
              <span className="text-xl sm:text-2xl font-bold text-white/80">créditos</span>
            </div>
          )}
        </div>
      </div>

      {hasActiveSub && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-emerald-900">Suscripción Activa</h3>
              <p className="text-sm text-emerald-700">Tu plan se renovará automáticamente el {profile?.subscription?.nextBillingDate ? new Date(profile.subscription.nextBillingDate).toLocaleDateString() : "próximo mes"}.</p>
            </div>
          </div>
          <button className="text-sm font-bold text-emerald-800 hover:text-emerald-900 px-4 py-2 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors">
            Gestionar
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-gray-100/80 p-1.5 rounded-2xl max-w-sm mx-auto">
        <button
          onClick={() => setActiveTab("SUBS")}
          className={cn(
            "flex-1 py-2.5 text-sm font-bold rounded-xl transition-all",
            activeTab === "SUBS" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
          )}
        >
          Planes Mensuales
        </button>
        <button
          onClick={() => setActiveTab("RECARGAS")}
          className={cn(
            "flex-1 py-2.5 text-sm font-bold rounded-xl transition-all",
            activeTab === "RECARGAS" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
          )}
        >
          Recargas Únicas
        </button>
      </div>

      {/* Paquetes */}
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-4 max-w-5xl mx-auto pt-4 pb-8 px-4 sm:px-0">
          {(activeTab === "SUBS" ? PLANES_MENSUALES : PAC_RECARGAS).map((pkg) => {
            const isCurrentPlan = profile?.subscription?.planId === pkg.id;

            return (
              <div
                key={pkg.id}
                className={cn(
                  "relative bg-white border-2 rounded-3xl p-6 sm:p-8 flex flex-col gap-6 transition-all duration-300",
                  isCurrentPlan ? "border-emerald-400 shadow-[0_4px_24px_rgba(16,185,129,0.1)]" : pkg.color
                )}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-black uppercase tracking-wider px-4 py-1.5 rounded-full shadow-lg border border-orange-400">
                    Mejor valor
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", pkg.bg)}>
                    {pkg.icon as React.ReactNode}
                  </div>
                  {pkg.popular && <Star className="w-6 h-6 text-orange-400 fill-orange-400 shrink-0" />}
                </div>

                <div>
                  <p className="font-bold text-gray-400 uppercase tracking-widest text-xs mb-1">{pkg.name}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-black text-gray-900" style={{ fontFamily: "Outfit, sans-serif" }}>{pkg.priceLabel}</p>
                    <span className="text-sm font-bold text-gray-400">/ {"period" in pkg ? (pkg as any).period : "PEN"}</span>
                  </div>
                  <div className="mt-3 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 inline-flex items-center justify-center">
                    <p className="text-sm font-black text-gray-900">+{pkg.credits} créditos</p>
                  </div>
                </div>

                <div className="flex-1">
                  <ul className="space-y-3">
                    {pkg.features.map((f: string) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm font-medium text-gray-600">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleBuy(pkg.id, activeTab === "SUBS" ? "SUBSCRIPTION" : "ONE_TIME")}
                  disabled={(purchasing !== null) || (activeTab === "SUBS" && hasActiveSub)}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all text-white mt-4 disabled:opacity-50 disabled:cursor-not-allowed",
                    isCurrentPlan ? "bg-emerald-600 hover:bg-emerald-700" : pkg.btn
                  )}
                >
                  {purchasing === pkg.id ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Procesando...
                    </>
                  ) : isCurrentPlan ? (
                    "Suscripción Activa"
                  ) : activeTab === "SUBS" && hasActiveSub ? (
                    "No disponible"
                  ) : (
                    <>
                      Elegir {pkg.name} <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>
              </div>
            )
          })}
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
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
              <History className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-base font-bold text-gray-900">Aún no hay movimientos</p>
            <p className="text-sm text-gray-400 mt-1">Tus compras y usos de créditos aparecerán aquí.</p>
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
  )
}
