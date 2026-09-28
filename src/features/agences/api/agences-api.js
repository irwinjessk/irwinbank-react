import { apiFetch } from '@/lib/http'

export function listAgences(token, filtres = {}) {
  const params = new URLSearchParams(Object.entries(filtres).filter(([, value]) => value))
  return apiFetch(`/agences${params.size ? `?${params}` : ''}`, { token })
}

export function createAgence(token, agence) {
  return apiFetch('/agences', { token, method: 'POST', body: { ...agence, banque: Number(agence.banque) } })
}

export function listAgentsAgence(token, id) {
  return apiFetch(`/agences/${id}/agents`, { token })
}
