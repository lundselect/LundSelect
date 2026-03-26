'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from '@/types'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<string | null>
  register: (name: string, email: string, password: string) => Promise<string | null>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const buildUser = async (authUser: { id: string; email?: string; user_metadata?: { name?: string } }) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('customer_number')
      .eq('id', authUser.id)
      .single()
    setUser({
      id: authUser.id,
      name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || '',
      email: authUser.email || '',
      customerNumber: profile?.customer_number ?? undefined,
    })
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        buildUser(session.user)
      }
      setIsLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        buildUser(session.user)
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error ? error.message : null
  }

  const register = async (name: string, email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    return error ? error.message : null
  }

  const logout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
