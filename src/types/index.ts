export interface Brand {
  id: string
  name: string
  state: string
  category: string
  slug: string
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
}
