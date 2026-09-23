import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { CreateMeetupPage } from './pages/CreateMeetupPage'
import { ExplorePage } from './pages/ExplorePage'
import { TableHubPage } from './pages/TableHubPage'
import { PlayPage } from './pages/PlayPage'
import { MeetupDetailPage } from './pages/MeetupDetailPage'
import { AuthPage } from './pages/AuthPage'
import { TopsPage } from './pages/TopsPage'
import { GameDetailPage } from './pages/GameDetailPage'
import { ProfilePage } from './pages/ProfilePage'
import { ChatsPage } from './pages/ChatsPage'
import { GroupsPage } from './pages/GroupsPage'
import { GroupDetailPage } from './pages/GroupDetailPage'
import { CreateMatchPage } from './pages/CreateMatchPage'
import { PrivacyPage } from './pages/legal/PrivacyPage'
import { TermsPage } from './pages/legal/TermsPage'
import { AccountDeletionPage } from './pages/legal/AccountDeletionPage'
import { useAuth } from './lib/authContext'
import { ReactNode } from 'react'

/** Redirects unauthenticated users to /auth with redirect query */
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return null  // wait for session check before deciding
  if (!user) {
    const redirectTarget = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/auth?redirectTo=${redirectTarget}`} replace />
  }
  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      {/* Public auth & legal pages – outside AppShell */}
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/delete-account" element={<AccountDeletionPage />} />

      {/* App shell wraps all in-app pages */}
      <Route element={<AppShell />}>
        <Route path="/" element={<ExplorePage />} />
        <Route path="/mesa-hub" element={<TableHubPage />} />
        <Route path="/jugar" element={<PlayPage />} />
        <Route path="/juegos/:id" element={<GameDetailPage />} />
        {/* Legacy stranger radar redirects to Table Companion play engine */}
        <Route path="/tablero" element={<Navigate to="/jugar" replace />} />
        <Route path="/tablero/:id" element={<MeetupDetailPage />} />
        <Route path="/mesa" element={<Navigate to="/mesa-hub" replace />} />
        <Route path="/mesa/:id" element={<MeetupDetailPage />} />
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
          path="/partida/nueva"
          element={
            <ProtectedRoute>
              <CreateMatchPage />
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
          path="/mesa/:id/edit"
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
        <Route
          path="/mesa/nueva"
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
