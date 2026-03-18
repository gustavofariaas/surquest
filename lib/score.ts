import { ForecastHora, NivelSurfista, RegraSpot, ScoreBreakdown, ScoreResult, Spot } from '@/types'

const PESOS = {
  swell:     0.35,
  vento:     0.25,
  mare:      0.15,
  distancia: 0.15,
  nivel:     0.10,
}

const NIVEL_ORDEM: Record<NivelSurfista, number> = {
  iniciante:     1,
  intermediario: 2,
  avancado:      3,
}

export function calcularScore(
  spot: Spot,
  hora: ForecastHora,
  nivelUsuario: NivelSurfista,
  distanciaKm: number
): ScoreResult {
  const breakdown: ScoreBreakdown = {
    swell:     calcularSwellScore(spot.regras, hora),
    vento:     calcularVentoScore(spot.regras, hora),
    mare:      calcularMareScore(spot.regras, hora),
    distancia: calcularDistanciaScore(distanciaKm),
    nivel:     calcularNivelScore(spot.regras, nivelUsuario),
  }

  const score = Number((
    breakdown.swell     * PESOS.swell     +
    breakdown.vento     * PESOS.vento     +
    breakdown.mare      * PESOS.mare      +
    breakdown.distancia * PESOS.distancia +
    breakdown.nivel     * PESOS.nivel
  ).toFixed(1))

  return {
    score,
    breakdown,
    justificativa: gerarJustificativa(spot.regras, hora, breakdown),
    melhor_horario: '',
  }
}

export function calcularMelhorHorario(
  spot: Spot,
  horas: ForecastHora[],
  nivelUsuario: NivelSurfista,
  distanciaKm: number
): ScoreResult {
  const horasProximas = horas.slice(0, 12)

  const scores = horasProximas.map((hora) =>
    calcularScore(spot, hora, nivelUsuario, distanciaKm)
  )

  let melhorIndice = 0
  let melhorMedia = 0

  for (let i = 0; i <= scores.length - 3; i++) {
    const media = (scores[i].score + scores[i + 1].score + scores[i + 2].score) / 3
    if (media > melhorMedia) {
      melhorMedia = media
      melhorIndice = i
    }
  }

  const horaInicio = new Date(horasProximas[melhorIndice].hora)
  const horaFim = new Date(horasProximas[Math.min(melhorIndice + 2, horasProximas.length - 1)].hora)
  const melhor_horario = `${formatarHora(horaInicio)}–${formatarHora(horaFim)}`

  const scoreHoraAtual = scores[0]
  return { ...scoreHoraAtual, melhor_horario }
}

// --- sub-scores ---

function calcularSwellScore(regras: RegraSpot, hora: ForecastHora): number {
  let score = 0

  const direcaoStr = grausParaDirecao(hora.wave_direction)
  if (regras.swell_direcao_ideal.includes(direcaoStr as any)) score += 4

  if (hora.wave_height >= regras.swell_altura_min && hora.wave_height <= regras.swell_altura_max) {
    score += 4
  } else if (hora.wave_height < regras.swell_altura_min) {
    score += Math.max(0, 4 - (regras.swell_altura_min - hora.wave_height) * 2)
  }

  if (hora.wave_period >= regras.swell_periodo_min) score += 2
  else score += Math.max(0, 2 - (regras.swell_periodo_min - hora.wave_period) * 0.3)

  return Math.min(10, score)
}

function calcularVentoScore(regras: RegraSpot, hora: ForecastHora): number {
  const direcaoStr = grausParaDirecao(hora.wind_direction)
  const isIdeal = regras.vento_direcao_ideal.includes(direcaoStr as any)

  let score = isIdeal ? 8 : 4

  if (hora.wind_speed > regras.vento_velocidade_max) {
    const excesso = hora.wind_speed - regras.vento_velocidade_max
    score = Math.max(0, score - excesso * 0.2)
  } else {
    score = Math.min(10, score + (1 - hora.wind_speed / regras.vento_velocidade_max) * 2)
  }

  return Math.min(10, score)
}

function calcularMareScore(regras: RegraSpot, hora: ForecastHora): number {
  if (regras.mare_ideal === 'qualquer') return 8

  const alturaOk =
    hora.sea_level_height >= regras.mare_altura_min &&
    hora.sea_level_height <= regras.mare_altura_max

  return alturaOk ? 10 : 4
}

function calcularDistanciaScore(distanciaKm: number): number {
  if (distanciaKm <= 20) return 10
  if (distanciaKm <= 50) return 7
  if (distanciaKm <= 100) return 4
  return 2
}

function calcularNivelScore(regras: RegraSpot, nivelUsuario: NivelSurfista): number {
  const nivelSpot = NIVEL_ORDEM[regras.nivel_max]
  const nivelUser = NIVEL_ORDEM[nivelUsuario]

  if (nivelUser <= nivelSpot) return 10
  if (nivelUser === nivelSpot + 1) return 4
  return 0
}

// --- helpers ---

function grausParaDirecao(graus: number): string {
  const direcoes = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  const indice = Math.round(graus / 45) % 8
  return direcoes[indice]
}

function formatarHora(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}h`
}

function gerarJustificativa(
  regras: RegraSpot,
  hora: ForecastHora,
  breakdown: ScoreBreakdown
): string[] {
  const msgs: string[] = []

  if (breakdown.swell >= 7) {
    msgs.push(`swell de ${hora.wave_height.toFixed(1)}m favorece o pico`)
  } else if (breakdown.swell <= 3) {
    msgs.push(`swell fraco ou em direção ruim para este spot`)
  }

  if (breakdown.vento >= 7) {
    msgs.push(`vento ${grausParaDirecao(hora.wind_direction)} favorável`)
  } else if (breakdown.vento <= 3) {
    msgs.push(`vento onshore ou forte (${hora.wind_speed.toFixed(0)} km/h)`)
  }

  if (breakdown.mare >= 7) {
    msgs.push(`maré favorável para o spot`)
  } else if (breakdown.mare <= 3) {
    msgs.push(`maré desfavorável para este pico`)
  }

  return msgs
}
