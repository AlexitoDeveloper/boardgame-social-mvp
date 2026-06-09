import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { CreateReviewPage } from './pages/CreateReviewPage'
import { CreateMeetupPage } from './pages/CreateMeetupPage'
import { FeedPage } from './pages/FeedPage'
import { RadarPage } from './pages/RadarPage'
import { AuthPage } from './pages/AuthPage'
import { ProfilePage } from './pages/ProfilePage'
import { useAuth } from './lib/authContext'

/** Redirects unauthenticated users to /auth */
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null  // wait for session check before deciding
  if (!user) return <Navigate to="/auth" replace />
  return children
}

function App() {
  return (
    <Routes>
      {/* Public auth page – outside AppShell */}
      <Route path="/auth" element={<AuthPage />} />

      {/* App shell wraps all in-app pages */}
      <Route element={<AppShell />}>
        <Route path="/" element={<FeedPage />} />
        <Route
          path="/review/new"
          element={
            <ProtectedRoute>
              <CreateReviewPage />
            </ProtectedRoute>
          }
        />
        <Route path="/radar" element={<RadarPage />} />
        <Route
          path="/radar/new"
          element={
            <ProtectedRoute>
              <CreateMeetupPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
