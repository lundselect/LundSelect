import { MetadataRoute } from 'next'
import { brands, products } from '@/lib/data'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://lundselect.com.br'
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${base}/produtos`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/novidades`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/marcas`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/marcas-parceiras`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/sobre`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/contato`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/frete-trocas`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/ajuda`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/faq`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/guia-de-tamanhos`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/privacidade`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/termos`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/quiz`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
  ]

  const brandRoutes: MetadataRoute.Sitemap = brands.map((brand) => ({
    url: `${base}/marcas/${brand.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${base}/produtos/${product.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  return [...staticRoutes, ...brandRoutes, ...productRoutes]
}
