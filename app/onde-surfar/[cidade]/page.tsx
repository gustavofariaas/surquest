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
    <main className="min-h-screen px-4 py-12">
      <div className="max-w-xl mx-auto">
        <Link href="/spots" className="text-sm text-slate-400 hover:text-slate-600 mb-6 inline-block">
          ← Todos os spots
        </Link>

        <div className="mb-8">
          <p className="text-sm text-slate-400 mb-1">{estado}</p>
          <h1 className="text-3xl font-bold text-slate-900">
            Onde surfar em {nomeCidade}
          </h1>
          <p className="mt-2 text-slate-500">
            {spots.length} {spots.length === 1 ? 'spot cadastrado' : 'spots cadastrados'} em {nomeCidade}.
          </p>
        </div>

        <div className="space-y-3 mb-10">
          {spots.map((spot) => (
            <Link
              key={spot.id}
              href={`/spots/${spot.slug}`}
              className="block bg-white border border-slate-200 rounded-2xl p-5 hover:border-emerald-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-semibold text-slate-900">{spot.nome}</h2>
                  {spot.descricao && (
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{spot.descricao}</p>
                  )}
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                      {nivelLabel[spot.nivel]}
                    </span>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                      {spot.tipo_onda.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
          <p className="text-slate-700 font-medium mb-3">
            Qual o melhor spot em {nomeCidade} agora?
          </p>
          <Link
            href="/"
            className="inline-block bg-emerald-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors"
          >
            Ver recomendação em tempo real
          </Link>
        </div>
      </div>
    </main>
  )
}
