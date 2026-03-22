'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from '@/types'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('lund_user')
    if (stored) setUser(JSON.parse(stored))
    setIsLoading(false)
  }, [])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const login = async (email: string, _password: string): Promise<boolean> => {
    const stored = localStorage.getItem('lund_users')
    const users: (User & { password: string })[] = stored ? JSON.parse(stored) : []
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (!found) return false
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _p, ...userData } = found
    setUser(userData)
    localStorage.setItem('lund_user', JSON.stringify(userData))
    return true
  }

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    const stored = localStorage.getItem('lund_users')
    const users: (User & { password: string })[] = stored ? JSON.parse(stored) : []
    if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) return false
    const newUser = { id: Date.now().toString(), name, email, password }
    users.push(newUser)
    localStorage.setItem('lund_users', JSON.stringify(users))
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _pw, ...userData } = newUser
    setUser(userData)
    localStorage.setItem('lund_user', JSON.stringify(userData))
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('lund_user')
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
