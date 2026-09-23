import { apiPath } from '@/lib/api'

export function comptesUrl(query = '') {
  return apiPath(`/comptes${query}`)
}
