// Autenticación para los endpoints que consume el agente de captación (n8n).
// n8n no tiene sesión de Clerk, así que se valida con un secreto compartido
// enviado en el header `x-agent-secret`, configurado como credencial en n8n.

export function verifyAgentSecret(req: Request): boolean {
  const expected = process.env.AGENT_API_SECRET
  if (!expected) return false
  const provided = req.headers.get("x-agent-secret")
  return provided === expected
}
