import { apiFetch } from '@/lib/http'

export function listComptes(token, clientId) {
  return apiFetch(`/comptes${clientId ? `?client=${clientId}` : ''}`, { token })
}

export function getCompte(token, id) {
  return apiFetch(`/comptes/${id}`, { token })
}

export function openCompte(token, { client, type_compte }) {
  return apiFetch('/comptes', { token, method: 'POST', body: { client: Number(client), type_compte } })
}

export function cloturerCompte(token, id, { motif, mode_restitution, compte_destinataire }) {
  const body = { motif }
  if (mode_restitution) body.mode_restitution = mode_restitution
  if (mode_restitution === 'VIREMENT') body.compte_destinataire = Number(compte_destinataire)
  return apiFetch(`/comptes/${id}/cloturer`, { token, method: 'POST', body })
}
