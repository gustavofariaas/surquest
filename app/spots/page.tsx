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

const nivelColor: Record<string, string> = {
  iniciante: 'bg-green-50 text-green-700',
  intermediario: 'bg-blue-50 text-blue-700',
  avancado: 'bg-orange-50 text-orange-700',
  todos: 'bg-slate-100 text-slate-600',
}

export default async function SpotsPage() {
  const spots = await getTodosSpots()

  const porEstado = spots.reduce<Record<string, typeof spots>>((acc, spot) => {
    if (!acc[spot.estado]) acc[spot.estado] = []
    acc[spot.estado].push(spot)
    return acc
  }, {})

  return (
    <>
      <section className="bg-slate-900 text-white px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-3">
            Base de spots
          </p>
          <h1 className="text-3xl md:text-4xl font-bold">Spots de surf no Brasil</h1>
          <p className="mt-2 text-slate-400">
            {spots.length} spots em RS, SC, SP e RJ com condições em tempo real.
          </p>
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-10">
          {Object.entries(porEstado).map(([estado, spotsEstado]) => (
            <div key={estado}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-bold text-slate-800">{estadoLabel[estado]}</h2>
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {spotsEstado.length} spots
                </span>
              </div>
              <div className="space-y-2">
                {spotsEstado.map((spot) => (
                  <Link
                    key={spot.id}
                    href={`/spots/${spot.slug}`}
                    className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3.5 hover:border-emerald-300 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {spot.nome}
                        </span>
                        <span className="text-slate-400 text-sm ml-2">{spot.cidade}</span>
                      </div>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${nivelColor[spot.nivel]}`}>
                      {nivelLabel[spot.nivel]}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
            <p className="text-slate-700 font-semibold mb-1">Quer saber qual é o melhor spot agora?</p>
            <p className="text-slate-500 text-sm mb-4">Score em tempo real baseado em swell, vento e maré.</p>
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
