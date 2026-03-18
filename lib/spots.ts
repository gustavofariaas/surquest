import { NivelSurfista, Spot, TipoOnda } from '@/types'
import { supabaseAdmin } from './supabase'

const NIVEL_ORDEM: NivelSurfista[] = ['iniciante', 'intermediario', 'avancado']

function mapRow(row: any): Spot {
  const nivelRecomendado: NivelSurfista[] = row.nivel_recomendado ?? []

  let nivelMax: NivelSurfista = 'iniciante'
  for (const n of NIVEL_ORDEM) {
    if (nivelRecomendado.includes(n)) nivelMax = n
  }

  const nivel = nivelRecomendado.length >= 3 ? 'todos' : nivelMax

  const tipoOnda = ((row.tipo_onda ?? 'beach break') as string)
    .replace(/ /g, '_') as TipoOnda

  return {
    id: row.id,
    nome: row.nome,
    slug: row.slug,
    estado: row.estado,
    cidade: row.cidade,
    lat: row.lat,
    lng: row.lng,
    orientacao: 'S',
    nivel: nivel as any,
    tipo_onda: tipoOnda,
    descricao: row.descricao,
    ativo: row.ativo,
    regras: {
      swell_direcao_ideal: row.swell_direcao_ideal ?? [],
      swell_altura_min: row.swell_altura_min ?? 0.5,
      swell_altura_max: row.swell_altura_max ?? 3.0,
      swell_periodo_min: row.swell_periodo_min ?? 7,
      vento_direcao_ideal: row.vento_direcao_ideal ?? [],
      vento_velocidade_max: row.vento_velocidade_max ?? 30,
      mare_ideal: row.mare_ideal ?? 'qualquer',
      mare_altura_min: 0,
      mare_altura_max: 10,
      nivel_max: nivelMax,
    },
  }
}

export async function getSpotsPorRaio(
  lat: number,
  lng: number,
  raioKm: number
): Promise<(Spot & { distancia_km: number })[]> {
  const grausPorKm = 1 / 111
  const delta = raioKm * grausPorKm

  const { data, error } = await supabaseAdmin
    .from('spots')
    .select('*')
    .eq('ativo', true)
    .gte('lat', lat - delta)
    .lte('lat', lat + delta)
    .gte('lng', lng - delta)
    .lte('lng', lng + delta)

  if (error) throw error

  return (data ?? [])
    .map((row) => ({
      ...mapRow(row),
      distancia_km: calcularDistanciaKm(lat, lng, row.lat, row.lng),
    }))
    .filter((spot) => spot.distancia_km <= raioKm)
    .sort((a, b) => a.distancia_km - b.distancia_km)
}

export async function getSpotPorSlug(slug: string): Promise<Spot | null> {
  const { data } = await supabaseAdmin
    .from('spots')
    .select('*')
    .eq('slug', slug)
    .eq('ativo', true)
    .single()

  return data ? mapRow(data) : null
}

export async function getTodosSpots(): Promise<Spot[]> {
  const { data } = await supabaseAdmin
    .from('spots')
    .select('*')
    .eq('ativo', true)
    .order('estado', { ascending: true })
    .order('nome', { ascending: true })

  return (data ?? []).map(mapRow)
}

// Fórmula de Haversine — distância em km entre dois pontos lat/lng
function calcularDistanciaKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function toRad(graus: number): number {
  return graus * (Math.PI / 180)
}
