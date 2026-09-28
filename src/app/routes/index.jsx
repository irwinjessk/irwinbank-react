import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from '@/components/layout/app-shell'
import ProtectedRoute from '@/features/auth/components/protected-route'
import LoginPage from '@/pages/auth/login-page'
import AuditPage from '@/pages/app/audit-page'
import BanquesPage from '@/pages/app/banques-page'
import ClientDetailPage from '@/pages/app/client-detail-page'
import ClientsPage from '@/pages/app/clients-page'
import ComptesPage from '@/pages/app/comptes-page'
import DashboardPage from '@/pages/app/dashboard-page'
import FacturesPage from '@/pages/app/factures-page'
import OperationsPage from '@/pages/app/operations-page'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/connexion" replace />} />
      <Route path="/connexion" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/app" element={<DashboardPage />} />
          <Route path="/app/banques" element={<BanquesPage />} />
          <Route path="/app/clients" element={<ClientsPage />} />
          <Route path="/app/clients/:id" element={<ClientDetailPage />} />
          <Route path="/app/comptes" element={<ComptesPage />} />
          <Route path="/app/operations" element={<OperationsPage />} />
          <Route path="/app/factures" element={<FacturesPage />} />
          <Route path="/app/audit" element={<AuditPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/connexion" replace />} />
    </Routes>
  )
}
