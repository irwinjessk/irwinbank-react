import { apiFetch } from '@/lib/http'

export function listClients(token, filtres = {}) {
  const params = new URLSearchParams(Object.entries(filtres).filter(([, value]) => value))
  return apiFetch(`/clients${params.size ? `?${params}` : ''}`, { token })
}

export function getClient(token, id) {
  return apiFetch(`/clients/${id}`, { token })
}

export function updateClient(token, id, { nom, prenom, email, conseiller }) {
  return apiFetch(`/clients/${id}`, {
    token,
    method: 'PATCH',
    body: { nom, prenom, email, conseiller: conseiller ? Number(conseiller) : null },
  })
}

export function changerAgence(token, id, agence) {
  return apiFetch(`/clients/${id}/changer-agence`, { token, method: 'POST', body: { agence: Number(agence) } })
}

export function createClient(token, { agence, ...client }) {
  const body = { ...client, banque: Number(client.banque) }
  if (agence) body.agence = Number(agence)
  return apiFetch('/clients', { token, method: 'POST', body })
}

export function deleteClient(token, id) {
  return apiFetch(`/clients/${id}`, { token, method: 'DELETE' })
}
