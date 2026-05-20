import { Metadata } from 'next'
import SizeGuideFlow from '@/components/size-guide/SizeGuideFlow'

export const metadata: Metadata = {
  title: 'Criar perfil de tamanhos — Lund Select',
  robots: { index: false, follow: false },
}

export default function CriarPerfilPage() {
  return <SizeGuideFlow />
}
