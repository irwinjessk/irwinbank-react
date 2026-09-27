import { apiPath } from '@/lib/api'

export async function login(username, password) {
  let response
  try {
    response = await fetch(apiPath('/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
  } catch {
    throw new Error('Serveur injoignable, réessayez dans un instant.')
  }
  if (!response.ok) {
    throw new Error('Identifiants incorrects')
  }
  return response.json()
}

export async function fetchMe(token) {
  const response = await fetch(apiPath('/auth/me'), {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) {
    throw new Error('Session invalide')
  }
  return response.json()
}
