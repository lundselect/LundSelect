import { Metadata } from 'next'
import QuizClient from './QuizClient'

export const metadata: Metadata = {
  title: 'Quiz de Estilo — Lund Select',
  description: 'Descubra seu estilo pessoal e receba uma curadoria personalizada das melhores marcas femininas brasileiras.',
  alternates: { canonical: 'https://lundselect.com.br/quiz' },
  openGraph: {
    title: 'Quiz de Estilo — Lund Select',
    description: 'Responda 4 perguntas e receba produtos selecionados para o seu estilo.',
  },
}

export default function QuizPage() {
  return <QuizClient />
}
