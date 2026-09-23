import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/context/auth-context'

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setPending(true)
    try {
      await login(username, password)
      navigate('/app', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setPending(false)
    }
  }

  if (isAuthenticated) {
    return <Navigate to="/app" replace />
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-lg border border-border bg-card p-6">
        <p className="text-xs tracking-[0.22em] text-accent">ADA BANK</p>
        <h1 className="mt-2 text-2xl font-semibold">Connexion</h1>
        <label className="mt-6 block text-sm text-muted-foreground" htmlFor="username">
          Identifiant
        </label>
        <input
          id="username"
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="username"
          required
        />
        <label className="mt-4 block text-sm text-muted-foreground" htmlFor="password">
          Mot de passe
        </label>
        <input
          id="password"
          type="password"
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />
        {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
        <Button className="mt-6 w-full" disabled={pending}>
          {pending ? 'Connexion…' : 'Se connecter'}
        </Button>
      </form>
    </main>
  )
}
