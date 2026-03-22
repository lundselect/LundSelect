'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { FavoriteList } from '@/types'

interface FavoritesContextType {
  favoriteIds: string[]
  lists: FavoriteList[]
  favoriteBrands: string[]
  toggleFavorite: (productId: string) => void
  isFavorite: (productId: string) => boolean
  createList: (name: string) => void
  deleteList: (listId: string) => void
  addToList: (listId: string, productId: string) => void
  removeFromList: (listId: string, productId: string) => void
  toggleBrand: (brandSlug: string) => void
  isFavoriteBrand: (brandSlug: string) => boolean
}

const FavoritesContext = createContext<FavoritesContextType | null>(null)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])
  const [lists, setLists] = useState<FavoriteList[]>([])
  const [favoriteBrands, setFavoriteBrands] = useState<string[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('lund_favorites')
    if (stored) {
      const data = JSON.parse(stored)
      setFavoriteIds(data.favoriteIds || [])
      setLists(data.lists || [])
      setFavoriteBrands(data.favoriteBrands || [])
    }
  }, [])

  const persist = (ids: string[], ls: FavoriteList[], brands: string[]) => {
    localStorage.setItem('lund_favorites', JSON.stringify({ favoriteIds: ids, lists: ls, favoriteBrands: brands }))
  }

  const toggleFavorite = (productId: string) => {
    setFavoriteIds((prev) => {
      const next = prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
      persist(next, lists, favoriteBrands)
      return next
    })
  }

  const isFavorite = (productId: string) => favoriteIds.includes(productId)

  const createList = (name: string) => {
    const newList: FavoriteList = { id: Date.now().toString(), name, productIds: [] }
    setLists((prev) => {
      const next = [...prev, newList]
      persist(favoriteIds, next, favoriteBrands)
      return next
    })
  }

  const deleteList = (listId: string) => {
    setLists((prev) => {
      const next = prev.filter((l) => l.id !== listId)
      persist(favoriteIds, next, favoriteBrands)
      return next
    })
  }

  const addToList = (listId: string, productId: string) => {
    setLists((prev) => {
      const next = prev.map((l) =>
        l.id === listId && !l.productIds.includes(productId)
          ? { ...l, productIds: [...l.productIds, productId] }
          : l
      )
      persist(favoriteIds, next, favoriteBrands)
      return next
    })
  }

  const removeFromList = (listId: string, productId: string) => {
    setLists((prev) => {
      const next = prev.map((l) =>
        l.id === listId ? { ...l, productIds: l.productIds.filter((id) => id !== productId) } : l
      )
      persist(favoriteIds, next, favoriteBrands)
      return next
    })
  }

  const toggleBrand = (brandSlug: string) => {
    setFavoriteBrands((prev) => {
      const next = prev.includes(brandSlug) ? prev.filter((s) => s !== brandSlug) : [...prev, brandSlug]
      persist(favoriteIds, lists, next)
      return next
    })
  }

  const isFavoriteBrand = (brandSlug: string) => favoriteBrands.includes(brandSlug)

  return (
    <FavoritesContext.Provider value={{
      favoriteIds, lists, favoriteBrands,
      toggleFavorite, isFavorite,
      createList, deleteList, addToList, removeFromList,
      toggleBrand, isFavoriteBrand,
    }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider')
  return ctx
}
