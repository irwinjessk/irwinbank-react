import { apiFetch } from '@/lib/http'

function avecFiltres(chemin, filtres = {}) {
  const params = new URLSearchParams(Object.entries(filtres).filter(([, value]) => value))
  return `${chemin}${params.size ? `?${params}` : ''}`
}

export function activerEspace({ numero_client, code, mot_de_passe }) {
  return apiFetch('/espace-client/activation', { method: 'POST', body: { numero_client, code, mot_de_passe } })
}

export function getProfil(token) {
  return apiFetch('/espace-client/profil', { token })
}

export function updateEmail(token, email) {
  return apiFetch('/espace-client/profil', { token, method: 'PATCH', body: { email } })
}

export function changerMotDePasse(token, ancien, nouveau) {
  return apiFetch('/espace-client/mot-de-passe', { token, method: 'POST', body: { ancien, nouveau } })
}

export function listMesComptes(token) {
  return apiFetch('/espace-client/comptes', { token })
}

export function getMonCompte(token, id) {
  return apiFetch(`/espace-client/comptes/${id}`, { token })
}

export function listMesOperations(token, filtres) {
  return apiFetch(avecFiltres('/espace-client/transactions', filtres), { token })
}

export function listMesFactures(token, filtres) {
  return apiFetch(avecFiltres('/espace-client/factures', filtres), { token })
}
