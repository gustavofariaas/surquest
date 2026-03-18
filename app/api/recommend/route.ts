import { NextRequest, NextResponse } from 'next/server'
import { getSpotsPorRaio } from '@/lib/spots'
import { getForecast } from '@/lib/forecast'
import { calcularMelhorHorario } from '@/lib/score'
import { NivelSurfista, RecomendacaoRequest, RecomendacaoResponse, SpotRanking } from '@/types'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  const lat = parseFloat(searchParams.get('lat') ?? '')
  const lng = parseFloat(searchParams.get('lng') ?? '')
  const raio_km = parseFloat(searchParams.get('raio') ?? '60')
  const nivel = (searchParams.get('nivel') ?? 'intermediario') as NivelSurfista

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: 'lat e lng são obrigatórios' }, { status: 400 })
  }

  const params: RecomendacaoRequest = { lat, lng, raio_km, nivel }

  try {
    const spots = await getSpotsPorRaio(params.lat, params.lng, params.raio_km)

    if (spots.length === 0) {
      return NextResponse.json({ error: 'Nenhum spot encontrado no raio informado' }, { status: 404 })
    }

    const rankings: SpotRanking[] = await Promise.all(
      spots.map(async (spot) => {
        const forecast = await getForecast(spot.id, spot.lat, spot.lng)
        const score_result = calcularMelhorHorario(spot, forecast.horas, params.nivel, spot.distancia_km)

        return {
          spot,
          score_result,
          distancia_km: spot.distancia_km,
        }
      })
    )

    const ranking = rankings
      .filter((r) => r.score_result.breakdown.nivel > 0)
      .sort((a, b) => b.score_result.score - a.score_result.score)

    const response: RecomendacaoResponse = {
      melhor_spot: ranking[0],
      ranking,
      gerado_em: new Date().toISOString(),
    }

    return NextResponse.json(response)
  } catch (err) {
    console.error('[recommend]', err)
    return NextResponse.json({ error: 'Erro ao gerar recomendação' }, { status: 500 })
  }
}
