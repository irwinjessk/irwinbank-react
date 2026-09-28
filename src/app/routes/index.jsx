import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from '@/components/layout/app-shell'
import EspaceShell from '@/components/layout/espace-shell'
import ProtectedRoute from '@/features/auth/components/protected-route'
import ActivationPage from '@/pages/auth/activation-page'
import LoginPage from '@/pages/auth/login-page'
import AgencesPage from '@/pages/app/agences-page'
import AuditPage from '@/pages/app/audit-page'
import BanquesPage from '@/pages/app/banques-page'
import ClientDetailPage from '@/pages/app/client-detail-page'
import ClientsPage from '@/pages/app/clients-page'
import CompteDetailPage from '@/pages/app/compte-detail-page'
import ComptesPage from '@/pages/app/comptes-page'
import DashboardPage from '@/pages/app/dashboard-page'
import FacturesPage from '@/pages/app/factures-page'
import OperationsPage from '@/pages/app/operations-page'
import EspaceAccueilPage from '@/pages/espace/accueil-page'
import EspaceFacturesPage from '@/pages/espace/factures-page'
import EspaceOperationsPage from '@/pages/espace/operations-page'
import EspaceProfilPage from '@/pages/espace/profil-page'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/connexion" replace />} />
      <Route path="/connexion" element={<LoginPage />} />
      <Route path="/activer" element={<ActivationPage />} />
      <Route element={<ProtectedRoute roles={['ADMIN', 'AGENT']} />}>
        <Route element={<AppShell />}>
          <Route path="/app" element={<DashboardPage />} />
          <Route path="/app/banques" element={<BanquesPage />} />
          <Route path="/app/agences" element={<AgencesPage />} />
          <Route path="/app/clients" element={<ClientsPage />} />
          <Route path="/app/clients/:id" element={<ClientDetailPage />} />
          <Route path="/app/comptes" element={<ComptesPage />} />
          <Route path="/app/comptes/:id" element={<CompteDetailPage />} />
          <Route path="/app/operations" element={<OperationsPage />} />
          <Route path="/app/factures" element={<FacturesPage />} />
          <Route path="/app/audit" element={<AuditPage />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute roles={['CLIENT']} />}>
        <Route element={<EspaceShell />}>
          <Route path="/espace" element={<EspaceAccueilPage />} />
          <Route path="/espace/comptes/:id" element={<EspaceOperationsPage />} />
          <Route path="/espace/operations" element={<EspaceOperationsPage />} />
          <Route path="/espace/factures" element={<EspaceFacturesPage />} />
          <Route path="/espace/profil" element={<EspaceProfilPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/connexion" replace />} />
    </Routes>
  )
}
