import { apiPath } from '@/lib/api'

export function clientsUrl(query = '') {
  return apiPath(`/clients${query}`)
}
