import { apiFetch } from '@/lib/http'

export function listAudit(token, filtres = {}) {
  const params = new URLSearchParams(Object.entries(filtres).filter(([, value]) => value))
  return apiFetch(`/audit${params.size ? `?${params}` : ''}`, { token })
}
