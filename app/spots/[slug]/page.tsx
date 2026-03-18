import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSpotPorSlug, getTodosSpots } from '@/lib/spots'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const spots = await getTodosSpots()
  return spots.map((spot) => ({ slug: spot.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const spot = await getSpotPorSlug(slug)
  if (!spot) return {}

  return {
    title: `${spot.nome} — Surf em ${spot.cidade} | SurQuest`,
    description: `Condições de surf na ${spot.nome} em ${spot.cidade}, ${spot.estado}. ${spot.descricao ?? ''}`,
  }
}

const nivelLabel: Record<string, string> = {
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
  todos: 'Todos os níveis',
}

const nivelColor: Record<string, string> = {
  iniciante: 'bg-green-50 text-green-700',
  intermediario: 'bg-blue-50 text-blue-700',
  avancado: 'bg-orange-50 text-orange-700',
  todos: 'bg-slate-100 text-slate-600',
}

export default async function SpotPage({ params }: Props) {
  const { slug } = await params
  const spot = await getSpotPorSlug(slug)

  if (!spot) notFound()

  return (
    <>
      <section className="bg-slate-900 text-white px-4 py-12">
        <div className="max-w-xl mx-auto">
          <Link href="/spots" className="text-xs text-slate-500 hover:text-slate-300 transition-colors mb-4 inline-block">
            ← Todos os spots
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400 mb-1">{spot.cidade} · {spot.estado}</p>
              <h1 className="text-3xl md:text-4xl font-bold">{spot.nome}</h1>
            </div>
            <span className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full mt-1 ${nivelColor[spot.nivel]}`}>
              {nivelLabel[spot.nivel]}
            </span>
          </div>
          {spot.descricao && (
            <p className="mt-4 text-slate-400 leading-relaxed">{spot.descricao}</p>
          )}
        </div>
      </section>

      <section className="px-4 py-10">
        <div className="max-w-xl mx-auto space-y-4">

          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
              Informações
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-400 mb-1">Tipo de onda</p>
                <p className="font-semibold text-slate-800 capitalize">
                  {spot.tipo_onda.replace('_', ' ')}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-400 mb-1">Nível</p>
                <p className="font-semibold text-slate-800">{nivelLabel[spot.nivel]}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
              Condições ideais
            </h2>
            <div className="space-y-3">
              {[
                {
                  label: 'Swell',
                  value: `${spot.regras.swell_altura_min}–${spot.regras.swell_altura_max}m · ${spot.regras.swell_direcao_ideal.join(', ')}`,
                },
                {
                  label: 'Período',
                  value: `acima de ${spot.regras.swell_periodo_min}s`,
                },
                {
                  label: 'Vento',
                  value: `${spot.regras.vento_direcao_ideal.join(', ')} · até ${spot.regras.vento_velocidade_max} km/h`,
                },
                {
                  label: 'Maré',
                  value: spot.regras.mare_ideal,
                },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                  <span className="text-sm text-slate-500">{label}</span>
                  <span className="text-sm font-medium text-slate-800 capitalize">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
            <p className="text-slate-700 font-semibold mb-1">
              A {spot.nome} está boa agora?
            </p>
            <p className="text-slate-500 text-sm mb-4">
              Veja o score em tempo real com base em swell, vento e maré.
            </p>
            <Link
              href="/"
              className="inline-block bg-emerald-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors"
            >
              Ver condições agora →
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
