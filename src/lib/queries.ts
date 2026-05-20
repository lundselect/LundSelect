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
    logo: b.logo ?? undefined,
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
    images: p.images ?? [],
    isNew: p.is_new ?? false,
    inStock: p.in_stock ?? true,
    description: p.description ?? undefined,
    onSale: p.on_sale ?? false,
    installments: p.installments ?? undefined,
    createdAt: p.created_at ?? undefined,
    stockBySize: p.stock_by_size ?? undefined,
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
    images: data.images ?? [],
    isNew: data.is_new ?? false,
    inStock: data.in_stock ?? true,
    description: data.description ?? undefined,
    onSale: data.on_sale ?? false,
    installments: data.installments ?? undefined,
    createdAt: data.created_at ?? undefined,
    stockBySize: data.stock_by_size ?? undefined,
  }
}

export async function getProductsByBrand(brandSlug: string): Promise<Product[]> {
  return getProducts({ brandSlug })
}

export async function getBrandProductCounts(): Promise<Record<string, number>> {
  const { data } = await supabase
    .from('products')
    .select('brand_slug')

  if (!data || data.length === 0) {
    // fallback: count from local data
    const counts: Record<string, number> = {}
    localProducts.forEach(p => { counts[p.brandSlug] = (counts[p.brandSlug] ?? 0) + 1 })
    return counts
  }

  const counts: Record<string, number> = {}
  data.forEach(row => { counts[row.brand_slug] = (counts[row.brand_slug] ?? 0) + 1 })
  return counts
}

export interface SearchResult {
  products: Pick<Product, 'id' | 'name' | 'brand' | 'brandSlug' | 'slug' | 'image' | 'price'>[]
  brands: Pick<Brand, 'id' | 'name' | 'slug' | 'state' | 'category'>[]
}

export async function search(q: string): Promise<SearchResult> {
  const term = q.trim()
  if (term.length < 2) return { products: [], brands: [] }

  const [{ data: pData }, { data: bData }] = await Promise.all([
    supabase
      .from('products')
      .select('id, name, brand, brand_slug, slug, image, price')
      .ilike('name', `%${term}%`)
      .eq('in_stock', true)
      .limit(5),
    supabase
      .from('brands')
      .select('id, name, slug, state, category')
      .ilike('name', `%${term}%`)
      .limit(4),
  ])

  const products = (pData || []).map((p) => ({
    id: String(p.id),
    name: p.name,
    brand: p.brand,
    brandSlug: p.brand_slug,
    slug: p.slug,
    image: p.image ?? undefined,
    price: p.price,
  }))

  const brands = (bData || []).map((b) => ({
    id: String(b.id),
    name: b.name,
    slug: b.slug,
    state: b.state,
    category: b.category,
  }))

  return { products, brands }
}
