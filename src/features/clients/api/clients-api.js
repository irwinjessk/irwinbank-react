import { apiFetch } from '@/lib/http'

export function listClients(token, filtres = {}) {
  const params = new URLSearchParams(Object.entries(filtres).filter(([, value]) => value))
  return apiFetch(`/clients${params.size ? `?${params}` : ''}`, { token })
}

export function getClient(token, id) {
  return apiFetch(`/clients/${id}`, { token })
}

export function updateClient(token, id, { nom, prenom, email }) {
  return apiFetch(`/clients/${id}`, { token, method: 'PATCH', body: { nom, prenom, email } })
}

export function createClient(token, client) {
  return apiFetch('/clients', { token, method: 'POST', body: { ...client, banque: Number(client.banque) } })
}
