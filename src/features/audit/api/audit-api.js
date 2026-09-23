import { apiPath } from '@/lib/api'

export function auditUrl(query = '') {
  return apiPath(`/audit${query}`)
}