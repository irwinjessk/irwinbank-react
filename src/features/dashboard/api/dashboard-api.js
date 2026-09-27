import { apiFetch } from '@/lib/http'

export function fetchDashboard(token, periode = {}) {
  const params = new URLSearchParams(Object.entries(periode).filter(([, value]) => value))
  return apiFetch(`/dashboard${params.size ? `?${params}` : ''}`, { token })
}
