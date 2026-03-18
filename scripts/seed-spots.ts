/**
 * Script para popular o Supabase com os spots do data/spots.json
 *
 * Uso:
 *   npx tsx scripts/seed-spots.ts
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function seed() {
  const spotsPath = path.join(process.cwd(), 'data', 'spots.json')
  const spots = JSON.parse(fs.readFileSync(spotsPath, 'utf-8'))

  console.log(`📍 ${spots.length} spots encontrados em data/spots.json`)

  const { data, error } = await supabase
    .from('spots')
    .upsert(spots, { onConflict: 'slug' })
    .select()

  if (error) {
    console.error('❌ Erro ao inserir spots:', error.message)
    process.exit(1)
  }

  console.log(`✅ ${data?.length} spots inseridos/atualizados com sucesso`)
}

seed()
