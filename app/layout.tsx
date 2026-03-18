import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Header from './components/Header'
import Footer from './components/Footer'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SurQuest — Onde surfar agora?',
  description: 'Descubra qual é o melhor spot para surfar perto de você neste momento.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${geist.className} bg-slate-50 text-slate-900 antialiased`}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}
