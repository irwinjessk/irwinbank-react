import { apiFetch } from '@/lib/http'

export function listFactures(token, filtres = {}) {
  const params = new URLSearchParams(Object.entries(filtres).filter(([, value]) => value))
  return apiFetch(`/factures${params.size ? `?${params}` : ''}`, { token })
}

export function renvoyerFacture(token, id) {
  return apiFetch(`/factures/${id}/renvoyer`, { token, method: 'POST' })
}
