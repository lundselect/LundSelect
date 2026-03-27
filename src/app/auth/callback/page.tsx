'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handle = async () => {
      // Wait a moment for Supabase to process the session from hash/code
      await new Promise(res => setTimeout(res, 500))

      // Try exchanging code if present in query params
      const code = new URLSearchParams(window.location.search).get('code')
      if (code) {
        await supabase.auth.exchangeCodeForSession(code)
      }

      // Check if session exists
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.replace('/conta')
      } else {
        // Listen for auth state change (handles hash fragment flow)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (session) {
            subscription.unsubscribe()
            router.replace('/conta')
          }
        })
        // Fallback timeout
        setTimeout(() => router.replace('/login'), 5000)
      }
    }
    handle()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-4 h-4 border border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
