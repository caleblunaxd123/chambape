# Agente de captación ChambaPe (n8n)

Workflows de n8n para buscar técnicos/clientes y generar tráfico hacia
chambape.pe de forma continua, sin arriesgar que te bloqueen cuentas de
WhatsApp/Meta ni infringir la ley peruana de protección de datos (Ley 29733)
o de protección al consumidor.

## Por qué está diseñado así

WhatsApp Business Platform prohíbe enviar mensajes a números que no dieron
opt-in, aunque los hayas conseguido tú mismo de un directorio público. Y
subir listas de contactos "fríos" a Meta Ads como audiencia también viola
sus términos. Por eso:

- **El descubrimiento de leads usa Google Places API** (oficial, no
  scraping) para encontrar negocios públicos.
- **La invitación inicial es por email** (más defendible legalmente que
  WhatsApp frío) y siempre incluye un link de baja.
- **WhatsApp solo responde** a quien te escribe primero (por ejemplo, al
  hacer clic en un anuncio "Click-to-WhatsApp").
- **Las redes sociales** publican contenido propio programado — no
  mensajes a desconocidos.

## 1. Desplegar n8n (no necesitas pagar nada para empezar)

Opción más simple — **Railway** (tiene plan gratuito con créditos):

1. Crea cuenta en https://railway.app
2. "New Project" → "Deploy a template" → busca **n8n**
3. Railway te da una URL pública tipo `https://tu-n8n.up.railway.app`
4. Entra, crea tu usuario admin de n8n

Alternativa: n8n Cloud (https://n8n.io) tiene prueba gratuita, pero no
permite configurar variables de entorno personalizadas tan fácil — para
estos workflows es mejor self-hosted (Railway/Render/un VPS).

## 2. Variables de entorno que necesita n8n

En Railway: tu proyecto → Variables. Agrega:

| Variable | De dónde sale |
|---|---|
| `AGENT_API_SECRET` | El mismo valor que pongas en `AGENT_API_SECRET` del `.env` de ChambaPe (genera uno con `openssl rand -hex 32`) |
| `GOOGLE_PLACES_API_KEY` | Google Cloud Console → habilita "Places API" → crea API Key. Tiene crédito gratis mensual, el uso de este workflow es mínimo (~150 búsquedas/mes). |
| `FB_PAGE_ID` | Meta for Developers → tu página de Facebook |
| `FB_PAGE_ACCESS_TOKEN` | Meta for Developers → tu app → Graph API Explorer (token de página, con permisos `pages_manage_posts`, `instagram_content_publish`) |
| `IG_BUSINESS_ID` | El ID de tu cuenta de Instagram business, vinculada a la página de Facebook |
| `WHATSAPP_TOKEN` | Meta for Developers → WhatsApp Business Platform → token permanente |

No necesitas todas desde el día uno: empieza solo con `AGENT_API_SECRET` +
Resend (workflow 01 y 03) y ve agregando las demás según vayas consiguiendo
cada cuenta.

## 3. Configura `AGENT_API_SECRET` en ChambaPe también

En el `.env` de tu app (Vercel → Settings → Environment Variables):

```
AGENT_API_SECRET="el-mismo-valor-que-pusiste-en-n8n"
```

## 4. Importar los workflows

En n8n: **Workflows → Import from File** y sube cada `.json` de esta
carpeta, en este orden:

1. `01-reactivacion-profesionales.json` — el más seguro, empieza aquí.
2. `02-descubrimiento-tecnicos.json`
3. `03-invitacion-email-leads.json`
4. `04-publicacion-redes-sociales.json`
5. `05-whatsapp-respuesta-automatica.json`

Después de importar cada uno, abre los nodos HTTP Request que dicen
`REEMPLAZAR_CREDENCIAL_*` y asigna/crea la credencial correspondiente
(Resend = HTTP Header Auth con `Authorization: Bearer TU_API_KEY`; el nodo
de Postgres del workflow 01 = credencial Postgres con tu `DATABASE_URL`).

Estos workflows son una base funcional, pero **n8n templates casi siempre
necesitan algún ajuste fino tras importarlos** (nombres de campos, mapeo de
credenciales) — es normal, ejecútalos manualmente una vez ("Execute
workflow") antes de activarlos para revisar que cada nodo reciba los datos
esperados.

## 5. Activar

Cuando cada workflow se ejecute bien manualmente, actívalo con el toggle
arriba a la derecha. A partir de ahí corre solo, 24/7, según su horario.

## 6. Ver resultados

Los leads descubiertos y su estado (`NUEVO`, `CONTACTADO`, `CONVERTIDO`,
`OPT_OUT`) quedan en la tabla `acquisition_leads` de tu base de datos. Puedes
revisarlos con Prisma Studio (`npm run db:studio`) o pedir un panel admin
simple más adelante si quieres verlo desde la app.

## 7. Límites a respetar (para no perder las cuentas)

- No subas listas de contactos "fríos" como audiencia de Meta/Google Ads.
- No actives el workflow 05 (WhatsApp) para enviar mensajes salientes —
  solo responde a quien escribe primero.
- Mantén los lotes de email pequeños (el workflow 03 ya limita a 15 cada
  6 horas) — escalar de golpe es lo que dispara filtros de spam.
- Respeta siempre los opt-out (`/baja?lead=...`) — ya están automatizados.
