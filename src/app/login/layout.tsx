import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Entrar — Lund Select',
  description: 'Acesse sua conta Lund Select.',
  robots: { index: false, follow: false },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
