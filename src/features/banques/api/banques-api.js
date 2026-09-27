import { apiFetch } from '@/lib/http'

export function listBanques(token, filtres = {}) {
  const params = new URLSearchParams(Object.entries(filtres).filter(([, value]) => value))
  return apiFetch(`/banques${params.size ? `?${params}` : ''}`, { token })
}

export function topBanques(token) {
  return apiFetch('/banques/top', { token })
}

export function createBanque(token, banque) {
  return apiFetch('/banques', { token, method: 'POST', body: banque })
}
