import { Forecast, ForecastHora } from '@/types'
import { supabaseAdmin } from './supabase'

const OPEN_METEO_MARINE_URL = 'https://marine-api.open-meteo.com/v1/marine'
const OPEN_METEO_WEATHER_URL = 'https://api.open-meteo.com/v1/forecast'
const CACHE_TTL_MINUTES = 60

export async function getForecast(spotId: string, lat: number, lng: number): Promise<Forecast> {
  const cached = await getCachedForecast(spotId)
  if (cached) return cached

  const forecast = await fetchForecast(spotId, lat, lng)
  await saveForecastCache(spotId, forecast)
  return forecast
}

async function getCachedForecast(spotId: string): Promise<Forecast | null> {
  const { data } = await supabaseAdmin
    .from('forecast_cache')
    .select('dados, buscado_em')
    .eq('spot_id', spotId)
    .gt('expira_em', new Date().toISOString())
    .single()

  if (!data) return null
  return data.dados as Forecast
}

async function fetchForecast(spotId: string, lat: number, lng: number): Promise<Forecast> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lng.toString(),
    hourly: 'wave_height,wave_direction,wave_period',
    forecast_days: '1',
    wind_speed_unit: 'kmh',
  })

  const windParams = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lng.toString(),
    hourly: 'wind_speed_10m,wind_direction_10m',
    forecast_days: '1',
    wind_speed_unit: 'kmh',
  })

  const [marineRes, windRes] = await Promise.all([
    fetch(`${OPEN_METEO_MARINE_URL}?${params}`),
    fetch(`${OPEN_METEO_WEATHER_URL}?${windParams}`),
  ])

  const [marine, wind] = await Promise.all([marineRes.json(), windRes.json()])

  const horas: ForecastHora[] = marine.hourly.time.map((hora: string, i: number) => ({
    hora,
    wave_height: marine.hourly.wave_height[i] ?? 0,
    wave_direction: marine.hourly.wave_direction[i] ?? 0,
    wave_period: marine.hourly.wave_period[i] ?? 0,
    wind_speed: wind.hourly.wind_speed_10m[i] ?? 0,
    wind_direction: wind.hourly.wind_direction_10m[i] ?? 0,
    sea_level_height: 0,
  }))

  return {
    spot_id: spotId,
    horas,
    buscado_em: new Date().toISOString(),
  }
}

async function saveForecastCache(spotId: string, forecast: Forecast): Promise<void> {
  const expira_em = new Date(Date.now() + CACHE_TTL_MINUTES * 60 * 1000).toISOString()

  await supabaseAdmin
    .from('forecast_cache')
    .upsert({
      spot_id: spotId,
      dados: forecast,
      buscado_em: new Date().toISOString(),
      expira_em,
    })
}
