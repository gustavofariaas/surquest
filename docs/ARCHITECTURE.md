# Arquitetura Técnica — SurQuest MVP

**Versão:** 0.1
**Status:** Rascunho
**Data:** 2026-03-17

---

## 1. Stack

| Camada | Tecnologia | Por quê |
|---|---|---|
| Frontend + Backend | Next.js (App Router) | React com SSR para SEO, API Routes elimina serviço separado |
| Banco de dados | Supabase (PostgreSQL) | Gerenciado, free tier generoso, auth e storage inclusos |
| Deploy | Vercel | Par natural com Next.js, deploy automático, gratuito |
| APIs externas | Open-Meteo Marine | Swell, vento e maré por coordenada, gratuito |
| APIs externas | CPTEC/INPE | Dados locais brasileiros, gratuito |
| Geocodificação | Nominatim (OSM) | Busca por cidade/região, gratuito |

---

## 2. Estrutura do projeto

```
surquest/
├── app/
│   ├── page.tsx                          # home — recomendação principal
│   ├── spots/
│   │   ├── page.tsx                      # lista de todos os spots (SEO)
│   │   └── [slug]/
│   │       └── page.tsx                  # página individual do spot (SEO)
│   ├── onde-surfar/
│   │   ├── [estado]/
│   │   │   └── page.tsx                  # ranking do dia por estado (SEO)
│   │   └── [cidade]/
│   │       └── page.tsx                  # ranking do dia por cidade (SEO)
│   └── api/
│       ├── recommend/
│       │   └── route.ts                  # endpoint principal de recomendação
│       ├── spots/
│       │   └── route.ts                  # listagem e busca de spots
│       ├── forecast/
│       │   └── route.ts                  # proxy para Open-Meteo
│       └── feedback/
│           └── route.ts                  # coleta de feedback pós-sessão
├── lib/
│   ├── score.ts                          # motor de score
│   ├── forecast.ts                       # integração com Open-Meteo e CPTEC
│   ├── spots.ts                          # funções de acesso aos spots
│   └── supabase.ts                       # cliente Supabase
├── data/
│   └── spots.json                        # base de spots (editada manualmente no MVP)
└── types/
    └── index.ts                          # tipos TypeScript compartilhados
```

---

## 3. Banco de dados

### 3.1 Tabela `spots`

```sql
create table spots (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null,
  slug        text not null unique,       -- usado nas URLs (ex: praia-do-rosa)
  estado      text not null,              -- RS, SC, SP, RJ
  cidade      text not null,
  lat         float not null,
  lng         float not null,
  orientacao  text not null,              -- direção para qual a praia está voltada (ex: S, SE)
  nivel       text not null,              -- iniciante / intermediario / avancado / todos
  tipo_onda   text not null,              -- beach_break / reef_break / point_break
  descricao   text,
  regras      jsonb not null,             -- regras de score (ver seção 5)
  ativo       boolean default true,
  created_at  timestamptz default now()
);
```

### 3.2 Tabela `forecast_cache`

Evita chamadas repetidas às APIs externas. Cache válido por 1 hora.

```sql
create table forecast_cache (
  id          uuid primary key default gen_random_uuid(),
  spot_id     uuid references spots(id),
  dados       jsonb not null,             -- resposta completa da API
  buscado_em  timestamptz default now(),
  expira_em   timestamptz not null
);
```

### 3.3 Tabela `feedback`

```sql
create table feedback (
  id           uuid primary key default gen_random_uuid(),
  spot_id      uuid references spots(id),
  avaliacao    text not null,             -- ruim / ok / boa / epica
  data_sessao  date not null,
  created_at   timestamptz default now()
);
```

---

## 4. Fluxo de dados

```
Usuário acessa o site
        │
        ▼
[Next.js] recebe localização + raio + nível do surfista
        │
        ▼
[Supabase] busca spots dentro do raio (query por lat/lng)
        │
        ▼
Para cada spot:
  ├── verifica forecast_cache
  │     ├── cache válido → usa dados cacheados
  │     └── cache expirado → chama Open-Meteo → salva no cache
  │
  ▼
[score.ts] aplica regras do spot + dados do forecast
        │
        ▼
Ordena spots por score (melhor → pior)
        │
        ▼
Retorna ranking com score, justificativa e melhor horário
        │
        ▼
[Next.js] renderiza resultado para o usuário
```

---

## 5. Motor de score

Localizado em `lib/score.ts`.

### 5.1 Entrada

```typescript
type ScoreInput = {
  spot: Spot           // dados do spot + regras
  forecast: Forecast   // dados de swell, vento e maré
  nivel: NivelSurfista // nivel do usuário
  distancia: number    // distância em km
}
```

### 5.2 Saída

```typescript
type ScoreResult = {
  score: number          // 0–10
  breakdown: {
    swell: number
    vento: number
    mare: number
    distancia: number
    nivel: number
  }
  justificativa: string[]  // ex: ["swell sul favorece o pico", "vento fraco lateral"]
  melhor_horario: string   // ex: "06h–09h"
}
```

### 5.3 Pesos

```typescript
const PESOS = {
  swell:    0.35,
  vento:    0.25,
  mare:     0.15,
  distancia: 0.15,
  nivel:    0.10,
}
```

### 5.4 Cálculo da melhor janela de horário

O sistema solicita previsão horária para as próximas 12 horas. Roda o score para cada hora e identifica a janela de 2–3 horas consecutivas com maior score médio.

---

## 6. Integrações externas

### 6.1 Open-Meteo Marine

**Endpoint:** `https://marine-api.open-meteo.com/v1/marine`

**Parâmetros solicitados por spot:**
```
latitude={lat}
longitude={lng}
hourly=wave_height,wave_direction,wave_period,wind_wave_height,sea_level_height
wind_speed_unit=kmh
forecast_days=1
```

**Vento** (via API de clima, não marine):
```
https://api.open-meteo.com/v1/forecast
hourly=wind_speed_10m,wind_direction_10m
```

**Frequência:** uma chamada por spot a cada 1 hora (controlado pelo cache)

### 6.2 CPTEC/INPE

Usado como fonte complementar para validação dos dados do Open-Meteo, especialmente para RS e SC. Integração implementada após o MVP inicial estar estável.

### 6.3 Nominatim (geocodificação)

**Endpoint:** `https://nominatim.openstreetmap.org/search`

Usado quando o usuário busca por cidade ou região em vez de liberar geolocalização.

---

## 7. Estratégia de cache

| Dado | Onde | TTL |
|---|---|---|
| Forecast por spot | Supabase `forecast_cache` | 1 hora |
| Páginas de spots (SSG) | Vercel Edge | Revalidação a cada 1 hora (ISR) |
| Páginas de ranking por estado/cidade | Vercel Edge | Revalidação a cada 1 hora (ISR) |
| Recomendação personalizada | Sem cache | Sempre fresco |

---

## 8. SEO

Páginas estáticas geradas pelo Next.js com revalidação incremental (ISR):

| URL | Conteúdo | Revalidação |
|---|---|---|
| `/spots` | lista de todos os spots | 24h |
| `/spots/[slug]` | dados + condições atuais do spot | 1h |
| `/onde-surfar/[estado]` | ranking do dia por estado | 1h |
| `/onde-surfar/[cidade]` | ranking do dia por cidade | 1h |

Cada página de spot inclui:
- nome, descrição, nível recomendado
- condições atuais com score
- meta tags otimizadas (title, description, og:image)

---

## 9. Deploy

| Serviço | Plano inicial | Custo |
|---|---|---|
| Vercel | Hobby (gratuito) | $0 |
| Supabase | Free tier | $0 |
| Open-Meteo | Gratuito | $0 |
| Nominatim | Gratuito (fair use) | $0 |

**Custo total do MVP: $0/mês**

Quando o produto crescer em usuários e requests, os primeiros upgrades necessários serão:
- Supabase Pro ($25/mês) — mais conexões e storage
- Open-Meteo Commercial ($29/mês) — para uso comercial intensivo

---

## 10. Decisões técnicas relevantes

**Por que não usar Java no MVP?**
Java seria um serviço separado para manter, configurar e fazer deploy. O Next.js API Routes entrega o mesmo resultado com menos complexidade operacional. Java pode ser introduzido em versões futuras se houver necessidade de processamento intensivo ou microsserviços.

**Por que Supabase e não outro banco?**
PostgreSQL gerenciado com free tier generoso, suporte a JSONB (necessário para as regras dos spots), cliente JavaScript direto no Next.js e auth incluído para quando o produto precisar.

**Por que spots em JSON no MVP?**
Facilita edição manual sem necessidade de painel admin. Quando o arquivo for carregado na aplicação, os dados são sincronizados com o Supabase. Um script de seed faz essa sincronização.
