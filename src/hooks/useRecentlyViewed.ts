'use client'

import { useEffect, useState, useCallback } from 'react'

const KEY = 'lund_recently_viewed'
const MAX = 8

export function useRecentlyViewed() {
  const [ids, setIds] = useState<string[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY)
      if (stored) setIds(JSON.parse(stored))
    } catch {
      // ignore
    }
  }, [])

  const addViewed = useCallback((productId: string) => {
    setIds((prev) => {
      const next = [productId, ...prev.filter((id) => id !== productId)].slice(0, MAX)
      try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
  }, [])

  return { ids, addViewed }
}
