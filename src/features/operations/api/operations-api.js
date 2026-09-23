import { apiPath } from '@/lib/api'

export function transactionsUrl(query = '') {
  return apiPath(`/transactions${query}`)
}
