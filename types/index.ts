export type Estado = 'RS' | 'SC' | 'SP' | 'RJ'

export type NivelSurfista = 'iniciante' | 'intermediario' | 'avancado'

export type TipoOnda = 'beach_break' | 'reef_break' | 'point_break'

export type AvaliacaoFeedback = 'ruim' | 'ok' | 'boa' | 'epica'

export type DirecaoVento =
  | 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW'

export interface RegraSpot {
  swell_direcao_ideal: DirecaoVento[]
  swell_altura_min: number
  swell_altura_max: number
  swell_periodo_min: number
  vento_direcao_ideal: DirecaoVento[]
  vento_velocidade_max: number
  mare_ideal: 'enchendo' | 'vazando' | 'baixa' | 'alta' | 'qualquer'
  mare_altura_min: number
  mare_altura_max: number
  nivel_max: NivelSurfista
}

export interface Spot {
  id: string
  nome: string
  slug: string
  estado: Estado
  cidade: string
  lat: number
  lng: number
  orientacao: DirecaoVento
  nivel: NivelSurfista | 'todos'
  tipo_onda: TipoOnda
  descricao?: string
  regras: RegraSpot
  ativo: boolean
}

export interface ForecastHora {
  hora: string                  // ISO string
  wave_height: number           // metros
  wave_direction: number        // graus (0–360)
  wave_period: number           // segundos
  wind_speed: number            // km/h
  wind_direction: number        // graus (0–360)
  sea_level_height: number      // metros (maré)
}

export interface Forecast {
  spot_id: string
  horas: ForecastHora[]
  buscado_em: string
}

export interface ScoreBreakdown {
  swell: number
  vento: number
  mare: number
  distancia: number
  nivel: number
}

export interface ScoreResult {
  score: number
  breakdown: ScoreBreakdown
  justificativa: string[]
  melhor_horario: string        // ex: "06h–09h"
}

export interface SpotRanking {
  spot: Spot
  score_result: ScoreResult
  distancia_km: number
}

export interface RecomendacaoRequest {
  lat: number
  lng: number
  raio_km: number
  nivel: NivelSurfista
}

export interface RecomendacaoResponse {
  melhor_spot: SpotRanking
  ranking: SpotRanking[]
  gerado_em: string
}
