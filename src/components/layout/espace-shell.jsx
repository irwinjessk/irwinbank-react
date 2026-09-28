import { NavLink, Outlet } from 'react-router-dom'
import Footer from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/context/auth-context'

const liens = [
  { to: '/espace', label: 'Mes comptes', end: true },
  { to: '/espace/operations', label: 'Mes opérations' },
  { to: '/espace/factures', label: 'Mes factures' },
  { to: '/espace/profil', label: 'Mon profil' },
]

export default function EspaceShell() {
  const { user, logout } = useAuth()

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-xs tracking-[0.22em] text-accent">ADA BANK · ESPACE CLIENT</p>
            <p className="text-sm font-medium">
              {user?.client?.nom_complet}
              <span className="ml-2 text-xs font-normal text-muted-foreground">{user?.client?.numero_client} · {user?.client?.banque_nom}</span>
            </p>
          </div>
          <Button variant="outline" onClick={logout}>Déconnexion</Button>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4">
          {liens.map((lien) => (
            <NavLink
              key={lien.to}
              to={lien.to}
              end={lien.end}
              className={({ isActive }) =>
                `whitespace-nowrap border-b-2 px-3 py-2 text-sm ${isActive ? 'border-primary font-medium text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`
              }
            >
              {lien.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 p-4 md:p-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
