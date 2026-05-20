import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Trocar Senha — Lund Select',
  description: 'Redefina sua senha de acesso à Lund Select.',
  robots: { index: false, follow: false },
}

export default function TrocarSenhaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
