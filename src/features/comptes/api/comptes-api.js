import { apiFetch } from '@/lib/http'

export function listComptes(token, clientId) {
  return apiFetch(`/comptes${clientId ? `?client=${clientId}` : ''}`, { token })
}

export function openCompte(token, { client, type_compte }) {
  return apiFetch('/comptes', { token, method: 'POST', body: { client: Number(client), type_compte } })
}

export function cloturerCompte(token, id) {
  return apiFetch(`/comptes/${id}/cloturer`, { token, method: 'POST' })
}
