'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { FavoriteList } from '@/types'
import { supabase } from '@/lib/supabase'
import { useAuth } from './AuthContext'

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
  const { user } = useAuth()
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])
  const [lists, setLists] = useState<FavoriteList[]>([])
  const [favoriteBrands, setFavoriteBrands] = useState<string[]>([])

  useEffect(() => {
    if (user) {
      loadFromSupabase(user.id)
    } else {
      const stored = localStorage.getItem('lund_favorites')
      if (stored) {
        const data = JSON.parse(stored)
        setFavoriteIds(data.favoriteIds || [])
        setLists(data.lists || [])
        setFavoriteBrands(data.favoriteBrands || [])
      } else {
        setFavoriteIds([])
        setLists([])
        setFavoriteBrands([])
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  async function loadFromSupabase(userId: string) {
    const [{ data: favs }, { data: ls }, { data: brands }] = await Promise.all([
      supabase.from('favorites').select('product_id').eq('user_id', userId),
      supabase.from('favorite_lists').select('*').eq('user_id', userId),
      supabase.from('favorite_brands').select('brand_slug').eq('user_id', userId),
    ])
    setFavoriteIds((favs || []).map((r) => r.product_id))
    setLists((ls || []).map((r) => ({ id: r.id, name: r.name, productIds: r.product_ids || [] })))
    setFavoriteBrands((brands || []).map((r) => r.brand_slug))
  }

  function saveLocal(ids: string[], ls: FavoriteList[], brands: string[]) {
    localStorage.setItem('lund_favorites', JSON.stringify({ favoriteIds: ids, lists: ls, favoriteBrands: brands }))
  }

  const toggleFavorite = async (productId: string) => {
    const isCurrentlyFav = favoriteIds.includes(productId)
    const next = isCurrentlyFav
      ? favoriteIds.filter((id) => id !== productId)
      : [...favoriteIds, productId]
    setFavoriteIds(next)

    if (user) {
      if (isCurrentlyFav) {
        await supabase.from('favorites').delete().eq('user_id', user.id).eq('product_id', productId)
      } else {
        await supabase.from('favorites').insert({ user_id: user.id, product_id: productId })
      }
    } else {
      saveLocal(next, lists, favoriteBrands)
    }
  }

  const isFavorite = (productId: string) => favoriteIds.includes(productId)

  const createList = async (name: string) => {
    if (user) {
      const { data } = await supabase
        .from('favorite_lists')
        .insert({ user_id: user.id, name, product_ids: [] })
        .select()
        .single()
      if (data) {
        setLists((prev) => [...prev, { id: data.id, name: data.name, productIds: [] }])
      }
    } else {
      const newList: FavoriteList = { id: Date.now().toString(), name, productIds: [] }
      const next = [...lists, newList]
      setLists(next)
      saveLocal(favoriteIds, next, favoriteBrands)
    }
  }

  const deleteList = async (listId: string) => {
    const next = lists.filter((l) => l.id !== listId)
    setLists(next)
    if (user) {
      await supabase.from('favorite_lists').delete().eq('id', listId).eq('user_id', user.id)
    } else {
      saveLocal(favoriteIds, next, favoriteBrands)
    }
  }

  const addToList = async (listId: string, productId: string) => {
    const list = lists.find((l) => l.id === listId)
    if (!list || list.productIds.includes(productId)) return
    const updatedIds = [...list.productIds, productId]
    const next = lists.map((l) => l.id === listId ? { ...l, productIds: updatedIds } : l)
    setLists(next)
    if (user) {
      await supabase
        .from('favorite_lists')
        .update({ product_ids: updatedIds })
        .eq('id', listId)
        .eq('user_id', user.id)
    } else {
      saveLocal(favoriteIds, next, favoriteBrands)
    }
  }

  const removeFromList = async (listId: string, productId: string) => {
    const list = lists.find((l) => l.id === listId)
    if (!list) return
    const updatedIds = list.productIds.filter((id) => id !== productId)
    const next = lists.map((l) => l.id === listId ? { ...l, productIds: updatedIds } : l)
    setLists(next)
    if (user) {
      await supabase
        .from('favorite_lists')
        .update({ product_ids: updatedIds })
        .eq('id', listId)
        .eq('user_id', user.id)
    } else {
      saveLocal(favoriteIds, next, favoriteBrands)
    }
  }

  const toggleBrand = async (brandSlug: string) => {
    const isCurrently = favoriteBrands.includes(brandSlug)
    const next = isCurrently
      ? favoriteBrands.filter((s) => s !== brandSlug)
      : [...favoriteBrands, brandSlug]
    setFavoriteBrands(next)
    if (user) {
      if (isCurrently) {
        await supabase.from('favorite_brands').delete().eq('user_id', user.id).eq('brand_slug', brandSlug)
      } else {
        await supabase.from('favorite_brands').insert({ user_id: user.id, brand_slug: brandSlug })
      }
    } else {
      saveLocal(favoriteIds, lists, next)
    }
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
