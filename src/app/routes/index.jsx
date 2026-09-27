import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from '@/components/layout/app-shell'
import ProtectedRoute from '@/features/auth/components/protected-route'
import LoginPage from '@/pages/auth/login-page'
import BanquesPage from '@/pages/app/banques-page'
import ClientsPage from '@/pages/app/clients-page'
import ComptesPage from '@/pages/app/comptes-page'
import OperationsPage from '@/pages/app/operations-page'
import SectionPage from '@/pages/app/section-page'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/connexion" replace />} />
      <Route path="/connexion" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/app" element={<SectionPage title="Tableau de bord" description="Indicateurs des banques, des comptes et des mouvements." />} />
          <Route path="/app/banques" element={<BanquesPage />} />
          <Route path="/app/clients" element={<ClientsPage />} />
          <Route path="/app/comptes" element={<ComptesPage />} />
          <Route path="/app/operations" element={<OperationsPage />} />
          <Route path="/app/factures" element={<SectionPage title="Factures" description="Factures générées et statut d’envoi." />} />
          <Route path="/app/audit" element={<SectionPage title="Journal" description="Trace des opérations." />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/connexion" replace />} />
    </Routes>
  )
}
