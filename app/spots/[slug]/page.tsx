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

export default async function SpotPage({ params }: Props) {
  const { slug } = await params
  const spot = await getSpotPorSlug(slug)

  if (!spot) notFound()

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="max-w-xl mx-auto">
        <Link href="/spots" className="text-sm text-slate-400 hover:text-slate-600 mb-6 inline-block">
          ← Todos os spots
        </Link>

        <div className="mb-8">
          <p className="text-sm text-slate-400 mb-1">{spot.cidade} · {spot.estado}</p>
          <h1 className="text-3xl font-bold text-slate-900">{spot.nome}</h1>
          {spot.descricao && (
            <p className="mt-3 text-slate-600 leading-relaxed">{spot.descricao}</p>
          )}
        </div>

        {/* Info do spot */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 mb-6">
          <h2 className="font-semibold text-slate-800">Informações do spot</h2>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-400 mb-1">Nível recomendado</p>
              <p className="text-sm font-medium text-slate-800">{nivelLabel[spot.nivel]}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-400 mb-1">Tipo de onda</p>
              <p className="text-sm font-medium text-slate-800">
                {spot.tipo_onda.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>

        {/* Condições ideais */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 mb-6">
          <h2 className="font-semibold text-slate-800">Condições ideais</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Swell</span>
              <span className="text-slate-800 font-medium">
                {spot.regras.swell_altura_min}–{spot.regras.swell_altura_max}m
                · direção {spot.regras.swell_direcao_ideal.join(', ')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Período</span>
              <span className="text-slate-800 font-medium">
                acima de {spot.regras.swell_periodo_min}s
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Vento</span>
              <span className="text-slate-800 font-medium">
                {spot.regras.vento_direcao_ideal.join(', ')}
                · até {spot.regras.vento_velocidade_max} km/h
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Maré</span>
              <span className="text-slate-800 font-medium capitalize">
                {spot.regras.mare_ideal}
              </span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
          <p className="text-slate-700 font-medium mb-3">
            Quer saber se a {spot.nome} está boa agora?
          </p>
          <Link
            href={`/?spot=${spot.slug}`}
            className="inline-block bg-emerald-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors"
          >
            Ver condições em tempo real
          </Link>
        </div>
      </div>
    </main>
  )
}
