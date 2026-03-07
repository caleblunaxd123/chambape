# ChambaPe 🔧

Marketplace de servicios del hogar para Lima, Perú. Conecta clientes con gasfiteros, electricistas, pintores, carpinteros y más profesionales verificados.

## Stack

- **Framework:** Next.js 14 (App Router)
- **Auth:** Clerk
- **BD:** PostgreSQL + Prisma 5
- **UI:** shadcn/ui + TailwindCSS 4
- **Storage:** Cloudinary
- **Pagos:** Culqi (pasarela peruana)
- **Email:** Resend
- **Deploy:** Vercel (frontend) + Railway (PostgreSQL)

---

## Requisitos previos

- Node.js >= 18
- PostgreSQL (local o en Railway/Neon/Supabase)
- Cuenta en Clerk, Cloudinary, Resend y Culqi (test)

---

## Instalación

### 1. Clonar y instalar dependencias

```bash
git clone https://github.com/tu-usuario/chambape.git
cd chambape
npm install
```

### 2. Variables de entorno

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales. Ver sección Variables de entorno abajo.

### 3. Base de datos

```bash
# Crear tablas (push schema sin migraciones — recomendado en desarrollo)
npm run db:push

# Cargar datos iniciales (categorías, paquetes, usuarios de prueba)
npm run db:seed
```

### 4. Correr en desarrollo

```bash
npm run dev
```

Abre http://localhost:3000

---

## Variables de entorno

| Variable | Dónde obtenerla |
|---|---|
| `DATABASE_URL` | Railway > tu proyecto > PostgreSQL > Connection URL |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | dashboard.clerk.com |
| `CLERK_SECRET_KEY` | Clerk Dashboard > API Keys |
| `CLERK_WEBHOOK_SECRET` | Clerk > Webhooks > tu endpoint |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | cloudinary.com Dashboard |
| `CLOUDINARY_API_KEY` | Cloudinary > Settings > API Keys |
| `CLOUDINARY_API_SECRET` | Cloudinary > Settings > API Keys |
| `CULQI_PRIVATE_KEY` | culqi.com > Dashboard > API |
| `NEXT_PUBLIC_CULQI_PUBLIC_KEY` | Culqi > Dashboard > API |
| `RESEND_API_KEY` | resend.com > API Keys |

---

## Configurar Clerk

### Webhook de sincronización

1. Ve a Clerk Dashboard > Webhooks > Add Endpoint
2. URL: `https://tu-dominio.com/api/webhooks/clerk`
3. Eventos a seleccionar: `user.created`, `user.updated`, `user.deleted`
4. Copia el Signing Secret → `CLERK_WEBHOOK_SECRET`

Para desarrollo local usa ngrok:

```bash
ngrok http 3000
# Usa la URL de ngrok como endpoint en Clerk
```

### URLs de redirección en Clerk Dashboard > Paths

- Sign-in URL: `/iniciar-sesion`
- Sign-up URL: `/registrarse`
- After sign-in: `/dashboard`
- After sign-up: `/registrarse/tipo`

---

## Scripts disponibles

```bash
npm run dev          # Desarrollo
npm run build        # Build de producción
npm run start        # Correr build
npm run lint         # ESLint

npm run db:push      # Sincronizar schema a BD (dev)
npm run db:seed      # Cargar datos iniciales
npm run db:studio    # Abrir Prisma Studio (GUI de BD)
npm run db:generate  # Regenerar cliente Prisma
npm run db:reset     # Resetear BD y re-seedear
```

---

## Estructura del proyecto

```
src/
├── app/
│   ├── (auth)/          # Login y registro
│   ├── (client)/        # Dashboard del cliente
│   ├── (professional)/  # Dashboard del profesional
│   ├── (admin)/         # Panel de administración
│   ├── (marketing)/     # Landing y páginas SEO
│   └── api/             # API Routes y webhooks
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── layout/          # Header, Footer, Sidebars
│   ├── solicitudes/     # Componentes de solicitudes
│   ├── profesionales/   # Componentes de perfiles
│   └── shared/          # Componentes reutilizables
├── constants/
│   ├── distritos.ts     # 44 distritos de Lima + Callao
│   ├── categorias.ts    # 12 categorías de servicios
│   └── paquetes.ts      # Paquetes de créditos
├── lib/
│   ├── db.ts            # Prisma client singleton
│   ├── auth.ts          # Helpers de autenticación
│   ├── cloudinary.ts    # Storage de imágenes
│   ├── resend.ts        # Templates de email
│   └── notifications.ts # Sistema de notificaciones
└── middleware.ts        # Protección de rutas con Clerk
```

---

## Modelo de negocio — Sistema de créditos

Los clientes publican solicitudes gratis. Los profesionales compran créditos para contactar clientes.

| Paquete | Créditos | Precio |
|---|---|---|
| Starter | 10 | S/. 15 |
| Pro | 30 | S/. 35 (ahorra 22%) |
| Master | 70 | S/. 70 (ahorra 33%) |

Costo por aplicación según categoría: 3–8 créditos dependiendo del tipo de servicio.

---

## Deploy en Vercel + Railway

```bash
# 1. Push a GitHub
git push origin main

# 2. Importar en vercel.com y agregar variables de entorno

# 3. En Vercel, cambiar Build Command a:
#    npx prisma generate && npm run build
```

---

## Usuarios de prueba (seed)

| Email | Rol |
|---|---|
| `admin@chambape.pe` | Admin |
| `rosa.quispe@gmail.com` | Cliente |
| `mario.condori@gmail.com` | Cliente |
| `carlos.mamani@gmail.com` | Profesional (gasfitero, verificado) |
| `juan.huanca@gmail.com` | Profesional (electricista, verificado) |
| `luz.flores@gmail.com` | Profesional (limpieza, verificada) |

> Nota: Crea estos usuarios en Clerk con los mismos emails. El webhook sincronizará el clerkId con la BD automáticamente.

---

Hecho con 🧡 para el mercado peruano.
