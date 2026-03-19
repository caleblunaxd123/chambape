import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth"

// Alias /panel → redirige al dashboard según el rol del usuario
export default async function PanelPage() {
  const user = await requireAuth()

  if (user.role === "PROFESSIONAL") redirect("/profesional/dashboard")
  if (user.role === "ADMIN") redirect("/admin/dashboard")
  redirect("/dashboard")
}
