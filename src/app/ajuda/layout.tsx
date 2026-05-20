import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ajuda & Suporte — Lund Select',
  description: 'Precisa de ajuda? Fale com a equipe Lund Select sobre entregas, devoluções, pedidos e muito mais.',
  alternates: { canonical: 'https://lundselect.com.br/ajuda' },
}

export default function AjudaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
