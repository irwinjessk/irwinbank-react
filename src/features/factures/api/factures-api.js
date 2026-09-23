import { apiPath } from '@/lib/api'

export function facturesUrl(query = '') {
  return apiPath(`/factures${query}`)
}
