import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { CreateMeetupPage } from './pages/CreateMeetupPage'
import { RadarPage } from './pages/RadarPage'
import { MeetupDetailPage } from './pages/MeetupDetailPage'
import { AuthPage } from './pages/AuthPage'
import { TopsPage } from './pages/TopsPage'
import { useAuth } from './lib/authContext'
import { ReactNode } from 'react'

/** Redirects unauthenticated users to /auth */
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return null  // wait for session check before deciding
  if (!user) return <Navigate to="/auth" replace />
  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      {/* Public auth page – outside AppShell */}
      <Route path="/auth" element={<AuthPage />} />

      {/* App shell wraps all in-app pages */}
      <Route element={<AppShell />}>
        <Route path="/" element={<RadarPage />} />
        <Route path="/radar" element={<Navigate to="/" replace />} />
        <Route path="/tablero" element={<Navigate to="/" replace />} />
        <Route path="/tablero/:id" element={<MeetupDetailPage />} />
        <Route path="/tops" element={<TopsPage />} />
        <Route
          path="/tablero/:id/edit"
          element={
            <ProtectedRoute>
              <CreateMeetupPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tablero/new"
          element={
            <ProtectedRoute>
              <CreateMeetupPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
