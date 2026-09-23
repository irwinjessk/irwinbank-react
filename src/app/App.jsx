import { BrowserRouter } from 'react-router-dom'
import AppRoutes from '@/app/routes'
import { AuthProvider } from '@/features/auth/context/auth-context'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
