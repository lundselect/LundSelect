export interface Brand {
  id: string
  name: string
  state: string
  category: string
  slug: string
  description?: string
}

export interface Product {
  id: string
  name: string
  brand: string
  brandSlug: string
  price: number
  category: string
  sizes: string[]
  slug: string
  image?: string
  isNew?: boolean
  inStock?: boolean
  description?: string
  onSale?: boolean
}

export interface User {
  id: string
  name: string
  email: string
  customerNumber?: string
}

export interface CartItem {
  product: Product
  size: string
  quantity: number
}

export interface FavoriteList {
  id: string
  name: string
  productIds: string[]
}
