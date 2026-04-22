import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { CreateReviewPage } from './pages/CreateReviewPage'
import { FeedPage } from './pages/FeedPage'
import { RadarPage } from './pages/RadarPage'

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<FeedPage />} />
        <Route path="/review/new" element={<CreateReviewPage />} />
        <Route path="/radar" element={<RadarPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
