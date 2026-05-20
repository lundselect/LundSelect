import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Favoritos — Lund Select',
  description: 'Seus produtos e marcas favoritos salvos na Lund Select.',
  robots: { index: false, follow: false },
}

export default function FavoritosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
