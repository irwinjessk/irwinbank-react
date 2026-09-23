import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/context/auth-context'

export default function Header({ title, onMenu }) {
  const { user, logout } = useAuth()

  return (
    <header className="flex items-center justify-between gap-4 border-b border-border bg-card px-4 py-3">
      <div className="flex items-center gap-3">
        <Button variant="outline" className="lg:hidden" onClick={onMenu}>
          Menu
        </Button>
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
      </div>
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span>{user?.username ?? 'Session'}</span>
        <Button variant="outline" onClick={logout}>
          Déconnexion
        </Button>
      </div>
    </header>
  )
}
