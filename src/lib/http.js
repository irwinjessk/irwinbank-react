import { apiPath } from '@/lib/api'

export async function apiFetch(path, { token, method = 'GET', body } = {}) {
  const [pathname, search = ''] = path.split('?')
  const url = `${apiPath(pathname.endsWith('/') ? pathname : `${pathname}/`)}${search ? `?${search}` : ''}`
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (response.status === 204) return null
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const detail = data.detail
      || Object.values(data).flat().find((item) => typeof item === 'string')
      || 'La requête a échoué'
    throw new Error(Array.isArray(detail) ? detail[0] : detail)
  }
  return data
}
