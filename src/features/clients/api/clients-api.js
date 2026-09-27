import { apiFetch } from '@/lib/http'

export function listClients(token, filtres = {}) {
  const params = new URLSearchParams(Object.entries(filtres).filter(([, value]) => value))
  return apiFetch(`/clients${params.size ? `?${params}` : ''}`, { token })
}

export function createClient(token, client) {
  return apiFetch('/clients', { token, method: 'POST', body: { ...client, banque: Number(client.banque) } })
}
