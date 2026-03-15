"use client"

import { useState, useEffect } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts"
import { Loader2, TrendingUp, Users, PieChart as PieIcon, BarChart3 } from "lucide-react"

interface AnalyticsData {
  revenue: { month: string; total: number }[]
  demand: { name: string; value: number }[]
  users: { name: string; value: number }[]
}

const COLORS = ["#f97316", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899", "#f59e0b"]

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((res) => res.json())
      .then((json) => {
        setData(json)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Error loading analytics:", err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3 bg-white/40 backdrop-blur-xl rounded-3xl border border-white/20">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        <p className="text-sm font-medium text-gray-400">Cargando analíticas...</p>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
      {/* 1. Gráfico de Ingresos Mensuales */}
      <div className="bg-white/60 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-white/40 shadow-xl shadow-orange-500/5">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-orange-500/10 rounded-2xl">
            <TrendingUp className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="font-black text-gray-900 leading-tight">Crecimiento de Ingresos</h3>
            <p className="text-xs text-gray-500 font-medium">Últimos 6 meses (S/.)</p>
          </div>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.revenue}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fontWeight: 600, fill: '#94a3b8' }} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fontWeight: 600, fill: '#94a3b8' }} 
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '1rem', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  padding: '12px' 
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="total" 
                stroke="#f97316" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorTotal)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Demanda por Categoría */}
      <div className="bg-white/60 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-white/40 shadow-xl shadow-blue-500/5">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-500/10 rounded-2xl">
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-black text-gray-900 leading-tight">Demanda por Categoría</h3>
            <p className="text-xs text-gray-500 font-medium">Servicios más solicitados</p>
          </div>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.demand} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={80} 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }}
              />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -10px rgb(0 0 0 / 0.1)' }}
              />
              <Bar 
                dataKey="value" 
                radius={[0, 10, 10, 0]}
                barSize={20}
              >
                {data.demand.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Distribución de Usuarios */}
      <div className="bg-white/60 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-white/40 shadow-xl shadow-indigo-500/5">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-500/10 rounded-2xl">
            <PieIcon className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-black text-gray-900 leading-tight">Distribución de Usuarios</h3>
            <p className="text-xs text-gray-500 font-medium">Clientes vs Profesionales</p>
          </div>
        </div>
        <div className="h-64 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.users}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.users.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? "#f97316" : "#6366f1"} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center translate-y-[-18px]">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Total</p>
              <p className="text-2xl font-black text-gray-900 leading-none">
                {data.users.reduce((acc, curr) => acc + curr.value, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Resumen Rápido (Stats extra) */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-500/20 flex flex-col justify-center">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold">Crecimiento Mensual</h3>
        </div>
        <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
          Tu plataforma ha crecido un <span className="font-black text-white text-lg">15%</span> este mes.
          Sigue optimizando las categorías con mayor demanda para aumentar las conversiones.
        </p>
        <div className="flex gap-4">
          <div className="flex-1 bg-white/10 p-4 rounded-3xl border border-white/10">
            <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-wide mb-1">Top Cat</p>
            <p className="text-lg font-black">{data.demand[0]?.name || "Diversos"}</p>
          </div>
          <div className="flex-1 bg-white/10 p-4 rounded-3xl border border-white/10">
            <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-wide mb-1">Ratio C/P</p>
            <p className="text-lg font-black">
              {(data.users[0]?.value / (data.users[1]?.value || 1)).toFixed(1)}:1
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
