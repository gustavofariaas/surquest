'use client'

import { useState } from 'react'
import { NivelSurfista, RecomendacaoResponse } from '@/types'
import SpotCard from './SpotCard'

const RAIOS = [30, 60, 100, 150]

type ModoLocalizacao = 'gps' | 'busca'

async function geocodificar(query: string): Promise<{ lat: number; lng: number; label: string }> {
  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: '1',
    countrycodes: 'br',
  })
  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    headers: { 'Accept-Language': 'pt-BR' },
  })
  const data = await res.json()
  if (!data.length) throw new Error('Localização não encontrada. Tente um nome de cidade ou bairro.')
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), label: data[0].display_name }
}

export default function RecommendForm() {
  const [nivel, setNivel] = useState<NivelSurfista>('intermediario')
  const [raio, setRaio] = useState(60)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [resultado, setResultado] = useState<RecomendacaoResponse | null>(null)
  const [modo, setModo] = useState<ModoLocalizacao>('gps')
  const [busca, setBusca] = useState('')
  const [localLabel, setLocalLabel] = useState<string | null>(null)

  async function obterCoordenadas(): Promise<{ lat: number; lng: number }> {
    if (modo === 'busca') {
      if (!busca.trim()) throw new Error('Digite uma cidade ou localização.')
      const result = await geocodificar(busca.trim())
      setLocalLabel(result.label)
      return result
    }
    const pos = await getCurrentPosition()
    setLocalLabel(null)
    return { lat: pos.coords.latitude, lng: pos.coords.longitude }
  }

  async function buscarRecomendacao() {
    setErro(null)
    setLoading(true)
    setResultado(null)

    try {
      const { lat, lng } = await obterCoordenadas()
      const params = new URLSearchParams({
        lat: lat.toString(),
        lng: lng.toString(),
        raio: raio.toString(),
        nivel,
      })

      const res = await fetch(`/api/recommend?${params}`)
      const data = await res.json()

      if (!res.ok) {
        setErro(data.error ?? 'Erro ao buscar recomendação')
        return
      }

      setResultado(data)
    } catch (e: any) {
      if (e?.code === 1) {
        setErro('Permissão de localização negada. Permita o acesso ou use a busca por cidade.')
      } else {
        setErro(e?.message ?? 'Não foi possível obter sua localização.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-5">

        {/* Localização */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Localização
          </label>
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setModo('gps')}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                modo === 'gps'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              📍 Minha localização
            </button>
            <button
              onClick={() => setModo('busca')}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                modo === 'busca'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              🔍 Buscar cidade
            </button>
          </div>

          {modo === 'busca' && (
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && buscarRecomendacao()}
              placeholder="Ex: Florianópolis, Ubatuba, Saquarema..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
            />
          )}
        </div>

        {/* Nível */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Seu nível
          </label>
          <div className="flex gap-2">
            {(['iniciante', 'intermediario', 'avancado'] as NivelSurfista[]).map((n) => (
              <button
                key={n}
                onClick={() => setNivel(n)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                  nivel === n
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {n === 'iniciante' ? 'Iniciante' : n === 'intermediario' ? 'Intermediário' : 'Avançado'}
              </button>
            ))}
          </div>
        </div>

        {/* Raio */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Raio: <span className="text-slate-700 normal-case">{raio} km</span>
          </label>
          <div className="flex gap-2">
            {RAIOS.map((r) => (
              <button
                key={r}
                onClick={() => setRaio(r)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                  raio === r
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={buscarRecomendacao}
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-emerald-600 text-white font-semibold text-base hover:bg-emerald-700 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Buscando condições...
            </span>
          ) : (
            'Descobrir onde surfar 🏄'
          )}
        </button>
      </div>

      {erro && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">
          {erro}
        </div>
      )}

      {resultado && (
        <div className="space-y-3">
          <p className="text-xs text-slate-400 text-center">
            {resultado.ranking.length} spots · raio de {raio} km
            {localLabel && <> · <span className="text-slate-500">{localLabel.split(',')[0]}</span></>}
          </p>

          {resultado.ranking.map((r, i) => (
            <SpotCard
              key={r.spot.id}
              ranking={r}
              position={i + 1}
              highlight={i === 0}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalização não suportada neste browser'))
      return
    }
    navigator.geolocation.getCurrentPosition(resolve, reject)
  })
}
