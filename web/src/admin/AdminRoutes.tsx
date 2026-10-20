import { Navigate, Route, Routes } from 'react-router-dom'
import { AllergensPage } from './AllergensPage'
import { AuthProvider } from './AuthContext'
import { LoginPage } from './LoginPage'
import { RequireAuth } from './RequireAuth'

export function AdminRoutes() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route
          path="allergens"
          element={
            <RequireAuth>
              <AllergensPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="allergens" replace />} />
      </Routes>
    </AuthProvider>
  )
}
