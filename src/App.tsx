import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { CreateMeetupPage } from './pages/CreateMeetupPage'
import { RadarPage } from './pages/RadarPage'
import { ExplorePage } from './pages/ExplorePage'
import { MeetupDetailPage } from './pages/MeetupDetailPage'
import { AuthPage } from './pages/AuthPage'
import { TopsPage } from './pages/TopsPage'
import { GameDetailPage } from './pages/GameDetailPage'
import { ProfilePage } from './pages/ProfilePage'
import { ChatsPage } from './pages/ChatsPage'
import { GroupsPage } from './pages/GroupsPage'
import { GroupDetailPage } from './pages/GroupDetailPage'
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
        <Route path="/" element={<ExplorePage />} />
        <Route path="/juegos/:id" element={<GameDetailPage />} />
        <Route path="/tablero" element={<RadarPage />} />
        <Route path="/tablero/:id" element={<MeetupDetailPage />} />
        <Route path="/tops" element={<TopsPage />} />
        <Route
          path="/chats"
          element={
            <ProtectedRoute>
              <ChatsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/grupos"
          element={
            <ProtectedRoute>
              <GroupsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/grupos/:id"
          element={
            <ProtectedRoute>
              <GroupDetailPage />
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
        <Route path="/perfil/:id" element={<ProfilePage />} />
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
