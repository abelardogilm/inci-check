import { Navigate, Route, Routes } from 'react-router-dom'
import App from '../App'
import { AllergensPage } from './AllergensPage'
import { AuthProvider } from './AuthContext'
import { HomePage } from './HomePage'
import { LoginPage } from './LoginPage'
import { RequireAuth } from './RequireAuth'
import { ScanPage } from './ScanPage'
import { SignUpPage } from './SignUpPage'

export function AppRoutes() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route
          path="/home"
          element={
            <RequireAuth>
              <HomePage />
            </RequireAuth>
          }
        />
        <Route
          path="/allergens"
          element={
            <RequireAuth>
              <AllergensPage />
            </RequireAuth>
          }
        />
        <Route
          path="/scan"
          element={
            <RequireAuth>
              <ScanPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
