// Paquetes de créditos disponibles para profesionales
// pricePen en soles enteros (ej: 15 = S/. 15.00)

export interface PaqueteCreditos {
  id: string           // ID temporal para seed (se reemplaza en DB)
  name: string
  credits: number
  pricePen: number
  pricePerCredit: number  // calculado
  savings: string | null
  popular: boolean
  order: number
}

export const PAQUETES_CREDITOS: PaqueteCreditos[] = [
  {
    id: "starter",
    name: "Starter",
    credits: 10,
    pricePen: 15,
    pricePerCredit: 1.5,
    savings: null,
    popular: false,
    order: 1,
  },
  {
    id: "pro",
    name: "Pro",
    credits: 30,
    pricePen: 35,
    pricePerCredit: 1.17,
    savings: "Ahorra 22%",
    popular: true,
    order: 2,
  },
  {
    id: "master",
    name: "Master",
    credits: 70,
    pricePen: 70,
    pricePerCredit: 1.0,
    savings: "Ahorra 33%",
    popular: false,
    order: 3,
  },
]

// Umbral de créditos bajos (se notifica al profesional)
export const CREDITOS_BAJOS_UMBRAL = 3

// Créditos de bienvenida al verificar cuenta
export const CREDITOS_BIENVENIDA = 5
