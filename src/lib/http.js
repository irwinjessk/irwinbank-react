import { apiPath } from '@/lib/api'

export const SESSION_EXPIREE = 'ada:session-expiree'

function urlDe(path) {
  const [pathname, search = ''] = path.split('?')
  return `${apiPath(pathname.endsWith('/') ? pathname : `${pathname}/`)}${search ? `?${search}` : ''}`
}

async function envoyer(path, { token, method = 'GET', body } = {}) {
  let response
  try {
    response = await fetch(urlDe(path), {
      method,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error('Serveur injoignable, réessayez dans un instant.')
  }
  if (response.status === 401) {
    window.dispatchEvent(new Event(SESSION_EXPIREE))
    throw new Error('Session expirée, veuillez vous reconnecter.')
  }
  return response
}

async function erreurDe(response) {
  const data = await response.json().catch(() => ({}))
  const detail = data.detail
    || Object.values(data).flat().find((item) => typeof item === 'string')
    || 'La requête a échoué'
  return new Error(Array.isArray(detail) ? detail[0] : detail)
}

export async function apiFetch(path, options = {}) {
  const response = await envoyer(path, options)
  if (response.status === 204) return null
  if (!response.ok) throw await erreurDe(response)
  return response.json().catch(() => ({}))
}

export async function apiDownload(path, { token, nomParDefaut = 'export' } = {}) {
  const response = await envoyer(path, { token })
  if (!response.ok) throw await erreurDe(response)
  const blob = await response.blob()
  const disposition = response.headers.get('Content-Disposition') || ''
  const nom = disposition.match(/filename="([^"]+)"/)?.[1] || nomParDefaut
  const url = URL.createObjectURL(blob)
  const lien = document.createElement('a')
  lien.href = url
  lien.download = nom
  document.body.appendChild(lien)
  lien.click()
  lien.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  return nom
}
