import { Metadata } from 'next'
import Link from 'next/link'
import { getTodosSpots } from '@/lib/spots'

export const metadata: Metadata = {
  title: 'Spots de Surf no Brasil — SurQuest',
  description: 'Explore os melhores spots de surf do Brasil em RS, SC, SP e RJ. Condições, níveis e recomendações em tempo real.',
}

const estadoLabel: Record<string, string> = {
  RS: 'Rio Grande do Sul',
  SC: 'Santa Catarina',
  SP: 'São Paulo',
  RJ: 'Rio de Janeiro',
}

const nivelLabel: Record<string, string> = {
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
  todos: 'Todos os níveis',
}

export default async function SpotsPage() {
  const spots = await getTodosSpots()

  const porEstado = spots.reduce<Record<string, typeof spots>>((acc, spot) => {
    if (!acc[spot.estado]) acc[spot.estado] = []
    acc[spot.estado].push(spot)
    return acc
  }, {})

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10">
          <Link href="/" className="text-sm text-slate-400 hover:text-slate-600 mb-4 inline-block">
            ← Voltar
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Spots de surf no Brasil</h1>
          <p className="mt-2 text-slate-500">
            {spots.length} spots cadastrados em RS, SC, SP e RJ com condições em tempo real.
          </p>
        </div>

        <div className="space-y-10">
          {Object.entries(porEstado).map(([estado, spotsEstado]) => (
            <div key={estado}>
              <h2 className="text-lg font-semibold text-slate-700 mb-4">
                {estadoLabel[estado]} ({spotsEstado.length} spots)
              </h2>
              <div className="space-y-2">
                {spotsEstado.map((spot) => (
                  <Link
                    key={spot.id}
                    href={`/spots/${spot.slug}`}
                    className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-emerald-300 hover:shadow-sm transition-all"
                  >
                    <div>
                      <span className="font-medium text-slate-900">{spot.nome}</span>
                      <span className="text-slate-400 text-sm ml-2">{spot.cidade}</span>
                    </div>
                    <span className="text-xs text-slate-400">{nivelLabel[spot.nivel]}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
          <p className="text-slate-700 font-medium mb-3">Quer saber qual é o melhor spot agora?</p>
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
