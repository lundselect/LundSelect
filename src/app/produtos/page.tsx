import { Metadata } from 'next'
import ProductsClient from './ProductsClient'
import { getBrands, getProducts } from '@/lib/queries'

export const metadata: Metadata = {
  title: 'Produtos — Lund Select',
  description: 'Explore a curadoria completa de moda feminina brasileira da Lund Select.',
  alternates: { canonical: 'https://lundselect.com.br/produtos' },
}

interface Props {
  searchParams: { categoria?: string; marca?: string; q?: string }
}

export default async function ProdutosPage({ searchParams }: Props) {
  const [brands, products] = await Promise.all([getBrands(), getProducts()])

  return (
    <ProductsClient
      initialCategory={searchParams.categoria}
      initialBrand={searchParams.marca}
      initialSearch={searchParams.q}
      brands={brands}
      products={products}
    />
  )
}
