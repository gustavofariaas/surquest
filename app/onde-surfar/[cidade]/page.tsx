import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTodosSpots } from '@/lib/spots'

interface Props {
  params: Promise<{ cidade: string }>
}

function slugParaCidade(slug: string): string {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export async function generateStaticParams() {
  const spots = await getTodosSpots()
  const cidades = [...new Set(spots.map((s) => s.cidade))]
  return cidades.map((cidade) => ({
    cidade: cidade.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ /g, '-'),
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cidade } = await params
  const nomeCidade = slugParaCidade(cidade)

  return {
    title: `Onde surfar em ${nomeCidade} — SurQuest`,
    description: `Melhores spots de surf em ${nomeCidade}. Condições de swell, vento e maré em tempo real para você decidir onde surfar agora.`,
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

export default async function OndeSurfarCidadePage({ params }: Props) {
  const { cidade } = await params
  const nomeCidade = slugParaCidade(cidade)

  const todosSpots = await getTodosSpots()
  const spots = todosSpots.filter(
    (s) =>
      s.cidade.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ /g, '-') === cidade
  )

  if (spots.length === 0) notFound()

  const estado = spots[0].estado

  return (
    <>
      <section className="bg-slate-900 text-white px-4 py-12">
        <div className="max-w-xl mx-auto">
          <Link href="/spots" className="text-xs text-slate-500 hover:text-slate-300 transition-colors mb-4 inline-block">
            ← Todos os spots
          </Link>
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-2">
            {estado}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold">Onde surfar em {nomeCidade}</h1>
          <p className="mt-2 text-slate-400">
            {spots.length} {spots.length === 1 ? 'spot cadastrado' : 'spots cadastrados'} com condições em tempo real.
          </p>
        </div>
      </section>

      <section className="px-4 py-10">
        <div className="max-w-xl mx-auto space-y-4">
          <div className="space-y-3">
            {spots.map((spot) => (
              <Link
                key={spot.id}
                href={`/spots/${spot.slug}`}
                className="block bg-white border border-slate-200 rounded-2xl p-5 hover:border-emerald-300 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {spot.nome}
                    </h2>
                    {spot.descricao && (
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">{spot.descricao}</p>
                    )}
                    <div className="flex gap-2 mt-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${nivelColor[spot.nivel]}`}>
                        {nivelLabel[spot.nivel]}
                      </span>
                      <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full capitalize">
                        {spot.tipo_onda.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <span className="text-slate-300 group-hover:text-emerald-500 transition-colors text-lg mt-1">→</span>
                </div>
              </Link>
            ))}
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
            <p className="text-slate-700 font-semibold mb-1">
              Qual o melhor spot em {nomeCidade} agora?
            </p>
            <p className="text-slate-500 text-sm mb-4">
              Score em tempo real baseado em swell, vento e maré.
            </p>
            <Link
              href="/"
              className="inline-block bg-emerald-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors"
            >
              Ver recomendação →
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
