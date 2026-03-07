// Categorías de servicios iniciales para Lima
// creditCost: créditos que gasta el profesional al aplicar a una solicitud de esta categoría

export interface Subcategoria {
  slug: string
  name: string
}

export interface Categoria {
  slug: string
  name: string
  icon: string          // emoji representativo
  description: string
  creditCost: number
  subcategorias: Subcategoria[]
}

export const CATEGORIAS: Categoria[] = [
  {
    slug: "gasfiteria",
    name: "Gasfitería",
    icon: "🔧",
    description: "Reparación de tuberías, instalación de sanitarios, filtraciones y más",
    creditCost: 8,
    subcategorias: [
      { slug: "reparacion-tuberias", name: "Reparación de tuberías" },
      { slug: "instalacion-sanitarios", name: "Instalación de sanitarios" },
      { slug: "filtraciones", name: "Filtraciones y humedad" },
      { slug: "desatascos", name: "Desatascos y limpieza de desagüe" },
      { slug: "terma-calentador", name: "Terma y calentador de agua" },
      { slug: "instalacion-agua-fria-caliente", name: "Instalación agua fría/caliente" },
    ],
  },
  {
    slug: "electricidad",
    name: "Electricidad",
    icon: "⚡",
    description: "Instalaciones eléctricas, tableros, tomacorrientes, iluminación",
    creditCost: 8,
    subcategorias: [
      { slug: "instalacion-electrica", name: "Instalación eléctrica general" },
      { slug: "tablero-electrico", name: "Tablero eléctrico" },
      { slug: "tomacorrientes-interruptores", name: "Tomacorrientes e interruptores" },
      { slug: "iluminacion", name: "Iluminación y luces LED" },
      { slug: "corto-circuito", name: "Corto circuito y fallas" },
      { slug: "instalacion-ducha-electrica", name: "Instalación ducha eléctrica" },
    ],
  },
  {
    slug: "pintura",
    name: "Pintura",
    icon: "🎨",
    description: "Pintura de interiores, exteriores, esmalte y empaste",
    creditCost: 5,
    subcategorias: [
      { slug: "pintura-interiores", name: "Pintura de interiores" },
      { slug: "pintura-exteriores", name: "Pintura de exteriores" },
      { slug: "empaste-resane", name: "Empaste y resane" },
      { slug: "pintura-esmalte", name: "Pintura al esmalte" },
      { slug: "barniz-laca", name: "Barniz y laca" },
    ],
  },
  {
    slug: "carpinteria",
    name: "Carpintería",
    icon: "🪚",
    description: "Muebles a medida, reparación de puertas, ventanas y closets",
    creditCost: 5,
    subcategorias: [
      { slug: "muebles-medida", name: "Muebles a medida" },
      { slug: "reparacion-puertas", name: "Reparación de puertas" },
      { slug: "closets", name: "Closets y armarios" },
      { slug: "cocinas-melamine", name: "Cocinas en melamina" },
      { slug: "ventanas-madera", name: "Ventanas de madera" },
    ],
  },
  {
    slug: "cerrajeria",
    name: "Cerrajería",
    icon: "🔑",
    description: "Cambio de chapas, apertura de puertas, instalación de cerraduras",
    creditCost: 5,
    subcategorias: [
      { slug: "cambio-chapa", name: "Cambio de chapa" },
      { slug: "apertura-puerta", name: "Apertura de puerta" },
      { slug: "instalacion-cerradura", name: "Instalación de cerradura" },
      { slug: "copia-llaves", name: "Copia de llaves" },
    ],
  },
  {
    slug: "limpieza-hogar",
    name: "Limpieza del hogar",
    icon: "🧹",
    description: "Limpieza general, profunda, post-obra y alfombras",
    creditCost: 4,
    subcategorias: [
      { slug: "limpieza-general", name: "Limpieza general" },
      { slug: "limpieza-profunda", name: "Limpieza profunda" },
      { slug: "limpieza-post-obra", name: "Limpieza post-obra" },
      { slug: "limpieza-alfombras", name: "Limpieza de alfombras y tapizones" },
      { slug: "lavado-muebles", name: "Lavado de muebles y sofás" },
      { slug: "limpieza-tanque-agua", name: "Limpieza de tanque de agua" },
    ],
  },
  {
    slug: "mudanzas",
    name: "Mudanzas y fletes",
    icon: "🚛",
    description: "Mudanzas locales, fletes, carga y descarga de muebles",
    creditCost: 6,
    subcategorias: [
      { slug: "mudanza-local", name: "Mudanza local" },
      { slug: "flete-camion", name: "Flete con camión" },
      { slug: "carga-descarga", name: "Carga y descarga" },
      { slug: "embalaje", name: "Embalaje de muebles" },
    ],
  },
  {
    slug: "fumigacion",
    name: "Fumigación",
    icon: "🐛",
    description: "Control de plagas: cucarachas, ratas, chinches, mosquitos",
    creditCost: 5,
    subcategorias: [
      { slug: "cucarachas", name: "Cucarachas" },
      { slug: "ratas-ratones", name: "Ratas y ratones" },
      { slug: "chinches", name: "Chinches de cama" },
      { slug: "mosquitos-zancudos", name: "Mosquitos y zancudos" },
      { slug: "hormigas-termitas", name: "Hormigas y termitas" },
    ],
  },
  {
    slug: "electrodomesticos",
    name: "Técnico electrodomésticos",
    icon: "🔌",
    description: "Reparación de lavadoras, refrigeradoras, microondas y más",
    creditCost: 6,
    subcategorias: [
      { slug: "lavadora", name: "Lavadora" },
      { slug: "refrigeradora", name: "Refrigeradora" },
      { slug: "microondas", name: "Microondas y cocina" },
      { slug: "televisor", name: "Televisor" },
      { slug: "aire-acondicionado", name: "Aire acondicionado" },
      { slug: "calefon", name: "Calefón" },
    ],
  },
  {
    slug: "camaras-seguridad",
    name: "Cámaras de seguridad",
    icon: "📷",
    description: "Instalación y configuración de sistemas CCTV y alarmas",
    creditCost: 7,
    subcategorias: [
      { slug: "instalacion-cctv", name: "Instalación de cámaras CCTV" },
      { slug: "configuracion-nvr", name: "Configuración NVR/DVR" },
      { slug: "alarmas", name: "Alarmas y sensores" },
      { slug: "camaras-ip", name: "Cámaras IP y WiFi" },
    ],
  },
  {
    slug: "jardineria",
    name: "Jardinería",
    icon: "🌿",
    description: "Diseño de jardines, poda, riego y mantenimiento",
    creditCost: 4,
    subcategorias: [
      { slug: "mantenimiento-jardin", name: "Mantenimiento de jardín" },
      { slug: "poda-arboles", name: "Poda de árboles y arbustos" },
      { slug: "instalacion-riego", name: "Sistema de riego" },
      { slug: "diseño-jardin", name: "Diseño de jardín" },
      { slug: "grass-cesped", name: "Instalación de grass/césped" },
    ],
  },
  {
    slug: "clases-particulares",
    name: "Clases particulares",
    icon: "📚",
    description: "Reforzamiento escolar, idiomas, matemáticas y más",
    creditCost: 3,
    subcategorias: [
      { slug: "matematicas", name: "Matemáticas" },
      { slug: "ingles", name: "Inglés" },
      { slug: "primaria-secundaria", name: "Primaria y secundaria" },
      { slug: "preuniversitaria", name: "Preuniversitaria" },
      { slug: "computacion", name: "Computación e informática" },
    ],
  },
]

export const CATEGORIAS_MAP = Object.fromEntries(
  CATEGORIAS.map((c) => [c.slug, c])
) as Record<string, Categoria>

export function getCategoriaName(slug: string): string {
  return CATEGORIAS_MAP[slug]?.name ?? slug
}
