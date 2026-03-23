import { Metadata } from 'next'
import ProductsClient from './ProductsClient'
import { getBrands, getProducts } from '@/lib/queries'

export const metadata: Metadata = {
  title: 'Produtos — Lund Select',
  description: 'Explore a curadoria completa de moda feminina brasileira da Lund Select.',
}

interface Props {
  searchParams: { categoria?: string; marca?: string }
}

export default async function ProdutosPage({ searchParams }: Props) {
  const [brands, products] = await Promise.all([getBrands(), getProducts()])

  return (
    <ProductsClient
      initialCategory={searchParams.categoria}
      initialBrand={searchParams.marca}
      brands={brands}
      products={products}
    />
  )
}
