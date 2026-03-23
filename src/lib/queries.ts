import { supabase } from './supabase'
import { Brand, Product } from '@/types'
import { brands as localBrands, products as localProducts } from './data'

export interface ProductFilters {
  category?: string
  brandSlug?: string
  minPrice?: number
  maxPrice?: number
  isNew?: boolean
  onSale?: boolean
}

export async function getBrands(): Promise<Brand[]> {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .order('name')

  if (error || !data || data.length === 0) return localBrands

  return data.map((b) => ({
    id: String(b.id),
    name: b.name,
    state: b.state,
    category: b.category,
    slug: b.slug,
    description: b.description,
  }))
}

export async function getProducts(filters?: ProductFilters): Promise<Product[]> {
  let query = supabase.from('products').select('*')

  if (filters?.brandSlug) query = query.eq('brand_slug', filters.brandSlug)
  if (filters?.isNew) query = query.eq('is_new', true)
  if (filters?.onSale) query = query.eq('on_sale', true)
  if (filters?.minPrice) query = query.gte('price', filters.minPrice)
  if (filters?.maxPrice) query = query.lte('price', filters.maxPrice)
  if (filters?.category && filters.category !== 'novidades' && filters.category !== 'sale') {
    query = query.ilike('category', filters.category)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error || !data || data.length === 0) return localProducts

  return data.map((p) => ({
    id: String(p.id),
    name: p.name,
    brand: p.brand,
    brandSlug: p.brand_slug,
    price: p.price,
    category: p.category,
    sizes: p.sizes ?? [],
    slug: p.slug,
    image: p.image ?? undefined,
    isNew: p.is_new ?? false,
    inStock: p.in_stock ?? true,
    description: p.description ?? undefined,
    onSale: p.on_sale ?? false,
  }))
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !data) {
    return localProducts.find((p) => p.slug === slug)
  }

  return {
    id: String(data.id),
    name: data.name,
    brand: data.brand,
    brandSlug: data.brand_slug,
    price: data.price,
    category: data.category,
    sizes: data.sizes ?? [],
    slug: data.slug,
    image: data.image ?? undefined,
    isNew: data.is_new ?? false,
    inStock: data.in_stock ?? true,
    description: data.description ?? undefined,
    onSale: data.on_sale ?? false,
  }
}

export async function getProductsByBrand(brandSlug: string): Promise<Product[]> {
  return getProducts({ brandSlug })
}
