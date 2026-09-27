import { apiFetch } from '@/lib/http'

export function listTransactions(token, filtres = {}) {
  const params = new URLSearchParams(Object.entries(filtres).filter(([, value]) => value))
  return apiFetch(`/transactions${params.size ? `?${params}` : ''}`, { token })
}

export function enregistrerTransaction(token, form) {
  const body = {
    type_transaction: form.type_transaction,
    compte: Number(form.compte),
    montant: form.montant,
    description: form.description,
  }
  if (form.type_transaction === 'VIREMENT') body.compte_contrepartie = Number(form.compte_contrepartie)
  return apiFetch('/transactions', { token, method: 'POST', body })
}
