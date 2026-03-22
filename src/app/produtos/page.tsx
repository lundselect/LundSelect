import { Metadata } from 'next'
import ProductsClient from './ProductsClient'

export const metadata: Metadata = {
  title: 'Produtos — Lund Select',
  description: 'Explore a curadoria completa de moda feminina brasileira da Lund Select.',
}

interface Props {
  searchParams: { categoria?: string; marca?: string }
}

export default function ProdutosPage({ searchParams }: Props) {
  return (
    <ProductsClient
      initialCategory={searchParams.categoria}
      initialBrand={searchParams.marca}
    />
  )
}
