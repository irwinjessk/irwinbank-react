import { apiPath } from '@/lib/api'

export function banquesUrl(query = '') {
  return apiPath(`/banques${query}`)
}
