import { Metadata } from 'next'
import ProductsClient from '@/app/produtos/ProductsClient'
import { getBrands, getProducts } from '@/lib/queries'

export const metadata: Metadata = {
  title: 'Novidades — Lund Select',
  description: 'Descubra as últimas novidades da Lund Select.',
}

export default async function NovidadesPage() {
  const [brands, products] = await Promise.all([getBrands(), getProducts()])
  const newProducts = products.filter(p => p.isNew)

  return (
    <ProductsClient
      heading="Recém chegados"
      subheading="Novidades"
      brands={brands}
      products={newProducts}
    />
  )
}
