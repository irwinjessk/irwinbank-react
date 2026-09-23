const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export function apiPath(path) {
  return `${apiUrl.replace(/\/$/, '')}/api/v1${path}`
}
