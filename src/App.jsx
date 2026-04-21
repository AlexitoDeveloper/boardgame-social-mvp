import { supabase } from './lib/supabaseClient'
import './App.css'

function App() {
  return (
    <main className="app-shell">
      <h1>Boardgame Social MVP</h1>
      <p>Fase 1 completada: base React + Vite + Supabase.</p>
      <p className="hint">
        Cliente Supabase listo con URL:{' '}
        <code>{supabase?.supabaseUrl ?? 'No configurada'}</code>
      </p>
    </main>
  )
}

export default App
