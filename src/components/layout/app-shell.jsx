import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Footer from '@/components/layout/footer'
import Header from '@/components/layout/header'
import { navigation } from '@/components/layout/navigation'
import Sidebar from '@/components/layout/sidebar'

export default function AppShell() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const current = navigation.find((item) =>
    item.end ? pathname === item.to : pathname.startsWith(item.to),
  )

  return (
    <div className="flex min-h-svh bg-background text-foreground">
      {open ? (
        <button
          type="button"
          aria-label="Fermer le menu"
          className="fixed inset-0 z-20 bg-primary/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}
      <Sidebar open={open} onNavigate={() => setOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header title={current?.label ?? 'ADA BANK'} onMenu={() => setOpen(true)} />
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  )
}
