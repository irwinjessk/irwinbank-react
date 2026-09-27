const defaultApiUrl = import.meta.env.PROD ? 'https://irwinbank-api.onrender.com' : 'http://localhost:8000'
const apiUrl = import.meta.env.VITE_API_URL || defaultApiUrl

export function apiPath(path) {
  return `${apiUrl.replace(/\/$/, '')}/api/v1${path}`
}
