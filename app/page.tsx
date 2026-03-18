import Link from 'next/link'
import RecommendForm from './components/RecommendForm'

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="bg-slate-900 text-white px-4 py-16 md:py-24">
        <div className="max-w-xl mx-auto text-center">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-4">
            Previsão inteligente de surf
          </span>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight">
            Onde vale a pena<br />surfar agora?
          </h1>
          <p className="mt-4 text-slate-400 text-lg">
            Informe sua localização e descubra o melhor spot perto de você, com score e explicação das condições.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="px-4 pb-16">
        <div className="max-w-xl mx-auto -mt-6">
          <RecommendForm />
        </div>
      </section>

      {/* Links SEO */}
      <section className="px-4 pb-16">
        <div className="max-w-xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
            Explore por cidade
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Florianópolis', slug: 'florianopolis' },
              { label: 'Ubatuba', slug: 'ubatuba' },
              { label: 'Saquarema', slug: 'saquarema' },
              { label: 'Rio de Janeiro', slug: 'rio-de-janeiro' },
              { label: 'Torres', slug: 'torres' },
              { label: 'Garopaba', slug: 'garopaba' },
              { label: 'Praia Grande', slug: 'praia-grande' },
            ].map((c) => (
              <Link
                key={c.slug}
                href={`/onde-surfar/${c.slug}`}
                className="text-sm bg-white border border-slate-200 text-slate-600 hover:border-emerald-400 hover:text-emerald-700 px-3 py-1.5 rounded-full transition-colors"
              >
                {c.label}
              </Link>
            ))}
            <Link
              href="/spots"
              className="text-sm bg-white border border-slate-200 text-slate-500 hover:border-slate-400 px-3 py-1.5 rounded-full transition-colors"
            >
              Ver todos →
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
