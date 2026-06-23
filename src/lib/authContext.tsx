import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from './supabaseClient'
import { User, Session } from '@supabase/supabase-js'
import { AppLanguage } from './gameLocale'

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [language, setLanguageState] = useState<AppLanguage>('es')

  const setLanguage = async (lang: AppLanguage) => {
    setLanguageState(lang)
    if (user) {
      try {
        await supabase
          .from('users')
          .update({ language: lang })
          .eq('id', user.id)
      } catch (error) {
        console.error('Failed to sync language to database:', error)
      }
    }
  }

  useEffect(() => {
    const syncUserLanguage = async (userId: string) => {
      try {
        const { data } = await supabase
          .from('users')
          .select('language')
          .eq('id', userId)
          .single()

        if (data?.language) {
          setLanguageState(data.language as AppLanguage)
        }
      } catch (err) {
        console.error('Error syncing language from database:', err)
      }
    }

    // Load current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      if (session?.user) {
        syncUserLanguage(session.user.id)
      }
    })

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      if (session?.user) {
        syncUserLanguage(session.user.id)
      } else {
        setLanguageState('es')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, language, setLanguage }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
