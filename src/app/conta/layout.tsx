import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Minha Conta — Lund Select',
  description: 'Gerencie sua conta, endereços, fidelidade e favoritos na Lund Select.',
  robots: { index: false, follow: false },
}

export default function ContaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
