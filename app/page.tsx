import Link from 'next/link'
import RecommendForm from './components/RecommendForm'

export default function Home() {
  return (
    <main className="min-h-screen px-4 py-12">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">SurQuest</h1>
          <p className="mt-2 text-slate-500 text-lg">Onde vale a pena surfar agora, perto de você?</p>
        </div>

        <RecommendForm />

        <div className="mt-12 pt-8 border-t border-slate-200 text-center space-y-2">
          <p className="text-xs text-slate-400">Explore os spots</p>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            <Link href="/spots" className="text-slate-500 hover:text-emerald-600 transition-colors">
              Todos os spots
            </Link>
            <Link href="/onde-surfar/florianopolis" className="text-slate-500 hover:text-emerald-600 transition-colors">
              Surf em Florianópolis
            </Link>
            <Link href="/onde-surfar/ubatuba" className="text-slate-500 hover:text-emerald-600 transition-colors">
              Surf em Ubatuba
            </Link>
            <Link href="/onde-surfar/saquarema" className="text-slate-500 hover:text-emerald-600 transition-colors">
              Surf em Saquarema
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
