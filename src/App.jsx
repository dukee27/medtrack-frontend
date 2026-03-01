import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { PatientProvider } from './context/PatientContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Medications from './pages/Medications'
import Schedules from './pages/Schedules'
import Reports from './pages/Reports'
import Access from './pages/Access'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import Organizations from './pages/Organizations'
import Notifications from './pages/Notifications'
import Archived from './pages/Archived'
import Logs from './pages/Logs'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  const hasToken = !!localStorage.getItem('token')
  return (user || hasToken) ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login"    element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
      <Route path="/"         element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />

      {/* Protected routes */}
      <Route path="/dashboard"     element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
      <Route path="/medications"   element={<PrivateRoute><Layout><Medications /></Layout></PrivateRoute>} />
      <Route path="/schedules"     element={<PrivateRoute><Layout><Schedules /></Layout></PrivateRoute>} />
      <Route path="/reports"       element={<PrivateRoute><Layout><Reports /></Layout></PrivateRoute>} />
      <Route path="/access"        element={<PrivateRoute><Layout><Access /></Layout></PrivateRoute>} />
      <Route path="/profile"       element={<PrivateRoute><Layout><Profile /></Layout></PrivateRoute>} />
      <Route path="/settings"      element={<PrivateRoute><Layout><Settings /></Layout></PrivateRoute>} />
      <Route path="/logs"          element={<PrivateRoute><Layout><Logs /></Layout></PrivateRoute>} />
      <Route path="/archived"      element={<PrivateRoute><Layout><Archived /></Layout></PrivateRoute>} />
      <Route path="/organizations" element={<PrivateRoute><Layout><Organizations /></Layout></PrivateRoute>} />
      <Route path="/notifications" element={<PrivateRoute><Layout><Notifications /></Layout></PrivateRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PatientProvider>
          <BrowserRouter>
            <AppRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--bg-card)',
                  color: 'var(--text)',
                  border: '1.5px solid var(--border)',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontFamily: 'var(--font-body)',
                  boxShadow: 'var(--shadow-md)',
                  padding: '12px 16px',
                },
                success: { iconTheme: { primary: 'var(--success)', secondary: 'var(--bg-card)' } },
                error: { iconTheme: { primary: 'var(--danger)', secondary: 'var(--bg-card)' } },
              }}
            />
          </BrowserRouter>
        </PatientProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}