import Link from 'next/link'

const cidades = [
  { label: 'Florianópolis', slug: 'florianopolis' },
  { label: 'Ubatuba', slug: 'ubatuba' },
  { label: 'Saquarema', slug: 'saquarema' },
  { label: 'Rio de Janeiro', slug: 'rio-de-janeiro' },
  { label: 'Torres', slug: 'torres' },
  { label: 'Garopaba', slug: 'garopaba' },
]

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-20">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🌊</span>
              <span className="font-bold text-white text-lg">SurQuest</span>
            </div>
            <p className="text-sm leading-relaxed">
              Descubra qual é o melhor spot para surfar perto de você, agora.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Navegação</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-white transition-colors">Início</Link></li>
              <li><Link href="/spots" className="hover:text-white transition-colors">Todos os spots</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Onde surfar</p>
            <ul className="space-y-2 text-sm">
              {cidades.map((c) => (
                <li key={c.slug}>
                  <Link href={`/onde-surfar/${c.slug}`} className="hover:text-white transition-colors">
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 text-xs text-slate-600">
          © {new Date().getFullYear()} SurQuest. Dados de forecast via Open-Meteo.
        </div>
      </div>
    </footer>
  )
}
