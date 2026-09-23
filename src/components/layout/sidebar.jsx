import { NavLink } from 'react-router-dom'
import { navigation } from '@/components/layout/navigation'

export default function Sidebar({ open, onNavigate }) {
  return (
    <aside
      className={`${open ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform lg:static lg:translate-x-0`}
    >
      <div className="border-b border-sidebar-border px-5 py-5">
        <p className="text-xs tracking-[0.22em] text-accent">ADA BANK</p>
        <p className="mt-1 text-sm text-sidebar-foreground/80">Gestion bancaire</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navigation.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `border-l-2 px-3 py-2 text-sm ${isActive ? 'border-accent bg-sidebar-accent text-white' : 'border-transparent text-sidebar-foreground/80 hover:bg-sidebar-accent'}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
