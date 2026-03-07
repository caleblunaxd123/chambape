// Todos los distritos de Lima Metropolitana + Callao
// slug: usado en URLs y en la BD
// name: nombre para mostrar en la UI

export interface Distrito {
  slug: string
  name: string
  provincia: "Lima" | "Callao"
}

export const DISTRITOS: Distrito[] = [
  // Lima Centro
  { slug: "lima", name: "Lima (Cercado)", provincia: "Lima" },
  { slug: "barranco", name: "Barranco", provincia: "Lima" },
  { slug: "breña", name: "Breña", provincia: "Lima" },
  { slug: "jesus-maria", name: "Jesús María", provincia: "Lima" },
  { slug: "la-victoria", name: "La Victoria", provincia: "Lima" },
  { slug: "lince", name: "Lince", provincia: "Lima" },
  { slug: "magdalena-del-mar", name: "Magdalena del Mar", provincia: "Lima" },
  { slug: "miraflores", name: "Miraflores", provincia: "Lima" },
  { slug: "pueblo-libre", name: "Pueblo Libre", provincia: "Lima" },
  { slug: "san-borja", name: "San Borja", provincia: "Lima" },
  { slug: "san-isidro", name: "San Isidro", provincia: "Lima" },
  { slug: "san-miguel", name: "San Miguel", provincia: "Lima" },
  { slug: "surco", name: "Surco (Santiago de Surco)", provincia: "Lima" },
  { slug: "surquillo", name: "Surquillo", provincia: "Lima" },

  // Lima Norte
  { slug: "ancón", name: "Ancón", provincia: "Lima" },
  { slug: "carabayllo", name: "Carabayllo", provincia: "Lima" },
  { slug: "comas", name: "Comas", provincia: "Lima" },
  { slug: "independencia", name: "Independencia", provincia: "Lima" },
  { slug: "los-olivos", name: "Los Olivos", provincia: "Lima" },
  { slug: "puente-piedra", name: "Puente Piedra", provincia: "Lima" },
  { slug: "rimac", name: "Rímac", provincia: "Lima" },
  { slug: "san-martin-de-porres", name: "San Martín de Porres", provincia: "Lima" },
  { slug: "santa-rosa", name: "Santa Rosa", provincia: "Lima" },

  // Lima Este
  { slug: "ate", name: "Ate", provincia: "Lima" },
  { slug: "chaclacayo", name: "Chaclacayo", provincia: "Lima" },
  { slug: "cieneguilla", name: "Cieneguilla", provincia: "Lima" },
  { slug: "el-agustino", name: "El Agustino", provincia: "Lima" },
  { slug: "la-molina", name: "La Molina", provincia: "Lima" },
  { slug: "lurigancho", name: "Lurigancho-Chosica", provincia: "Lima" },
  { slug: "san-juan-de-lurigancho", name: "San Juan de Lurigancho", provincia: "Lima" },
  { slug: "santa-anita", name: "Santa Anita", provincia: "Lima" },

  // Lima Sur
  { slug: "chorrillos", name: "Chorrillos", provincia: "Lima" },
  { slug: "lurin", name: "Lurín", provincia: "Lima" },
  { slug: "pachacamac", name: "Pachacámac", provincia: "Lima" },
  { slug: "pucusana", name: "Pucusana", provincia: "Lima" },
  { slug: "punta-hermosa", name: "Punta Hermosa", provincia: "Lima" },
  { slug: "punta-negra", name: "Punta Negra", provincia: "Lima" },
  { slug: "san-bartolo", name: "San Bartolo", provincia: "Lima" },
  { slug: "san-juan-de-miraflores", name: "San Juan de Miraflores", provincia: "Lima" },
  { slug: "santa-maria-del-mar", name: "Santa María del Mar", provincia: "Lima" },
  { slug: "villa-el-salvador", name: "Villa El Salvador", provincia: "Lima" },
  { slug: "villa-maria-del-triunfo", name: "Villa María del Triunfo", provincia: "Lima" },

  // Callao
  { slug: "callao", name: "Callao", provincia: "Callao" },
  { slug: "bellavista", name: "Bellavista", provincia: "Callao" },
  { slug: "carmen-de-la-legua", name: "Carmen de la Legua", provincia: "Callao" },
  { slug: "la-perla", name: "La Perla", provincia: "Callao" },
  { slug: "la-punta", name: "La Punta", provincia: "Callao" },
  { slug: "mi-peru", name: "Mi Perú", provincia: "Callao" },
  { slug: "ventanilla", name: "Ventanilla", provincia: "Callao" },
]

export const DISTRITOS_MAP = Object.fromEntries(
  DISTRITOS.map((d) => [d.slug, d])
) as Record<string, Distrito>

export function getDistritoName(slug: string): string {
  return DISTRITOS_MAP[slug]?.name ?? slug
}
