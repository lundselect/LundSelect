'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/conta')
      } else {
        // Exchange code for session (PKCE flow)
        const code = new URLSearchParams(window.location.search).get('code')
        if (code) {
          supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
            if (error) router.replace('/login')
            else router.replace('/conta')
          })
        } else {
          router.replace('/login')
        }
      }
    })
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-4 h-4 border border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
