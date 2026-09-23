import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from '@/components/layout/app-shell'
import ProtectedRoute from '@/features/auth/components/protected-route'
import LoginPage from '@/pages/auth/login-page'
import SectionPage from '@/pages/app/section-page'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/connexion" replace />} />
      <Route path="/connexion" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/app" element={<SectionPage title="Tableau de bord" description="Indicateurs des banques, des comptes et des mouvements." />} />
          <Route path="/app/banques" element={<SectionPage title="Banques" description="Référentiel des banques, filtre par pays ou ville, top 15." />} />
          <Route path="/app/clients" element={<SectionPage title="Clients" description="Inscription et recherche par nom, e-mail ou numéro." />} />
          <Route path="/app/comptes" element={<SectionPage title="Comptes" description="Ouverture, consultation et clôture." />} />
          <Route path="/app/operations" element={<SectionPage title="Mouvements" description="Dépôts, retraits et virements." />} />
          <Route path="/app/factures" element={<SectionPage title="Factures" description="Factures générées et statut d’envoi." />} />
          <Route path="/app/audit" element={<SectionPage title="Journal" description="Trace des opérations." />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/connexion" replace />} />
    </Routes>
  )
}
