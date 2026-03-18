'use client'

import { SpotRanking } from '@/types'
import ScoreRing from './ScoreRing'

interface SpotCardProps {
  ranking: SpotRanking
  position: number
  highlight?: boolean
}

const nivelLabel: Record<string, string> = {
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
  todos: 'Todos os níveis',
}

const tipoOnda: Record<string, string> = {
  beach_break: 'Beach break',
  reef_break: 'Reef break',
  point_break: 'Point break',
}

export default function SpotCard({ ranking, position, highlight = false }: SpotCardProps) {
  const { spot, score_result, distancia_km } = ranking

  return (
    <div
      className={`rounded-2xl border p-5 transition-shadow hover:shadow-md ${
        highlight
          ? 'border-emerald-300 bg-white shadow-sm ring-1 ring-emerald-200'
          : 'border-slate-200 bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-slate-400">#{position}</span>
            {highlight && (
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Melhor agora
              </span>
            )}
          </div>

          <h3 className="font-semibold text-slate-900 text-lg leading-tight">{spot.nome}</h3>
          <p className="text-sm text-slate-500 mt-0.5">
            {spot.cidade} · {spot.estado} · {distancia_km.toFixed(0)} km
          </p>

          <div className="flex flex-wrap gap-2 mt-3">
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
              {tipoOnda[spot.tipo_onda]}
            </span>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
              {nivelLabel[spot.nivel]}
            </span>
            {score_result.melhor_horario && (
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                Melhor: {score_result.melhor_horario}
              </span>
            )}
          </div>

          {score_result.justificativa.length > 0 && (
            <ul className="mt-3 space-y-1">
              {score_result.justificativa.map((msg, i) => (
                <li key={i} className="text-sm text-slate-600 flex items-start gap-1.5">
                  <span className="text-slate-400 mt-0.5">·</span>
                  {msg}
                </li>
              ))}
            </ul>
          )}
        </div>

        <ScoreRing score={score_result.score} size={highlight ? 'lg' : 'sm'} />
      </div>
    </div>
  )
}
