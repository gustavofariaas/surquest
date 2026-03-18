-- Tabela de spots
create table spots (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null,
  slug        text not null unique,
  estado      text not null check (estado in ('RS', 'SC', 'SP', 'RJ')),
  cidade      text not null,
  lat         float not null,
  lng         float not null,
  orientacao  text not null,
  nivel       text not null check (nivel in ('iniciante', 'intermediario', 'avancado', 'todos')),
  tipo_onda   text not null check (tipo_onda in ('beach_break', 'reef_break', 'point_break')),
  descricao   text,
  regras      jsonb not null,
  ativo       boolean default true,
  created_at  timestamptz default now()
);

-- Tabela de cache de forecast
create table forecast_cache (
  id          uuid primary key default gen_random_uuid(),
  spot_id     uuid references spots(id) on delete cascade,
  dados       jsonb not null,
  buscado_em  timestamptz default now(),
  expira_em   timestamptz not null
);

create index idx_forecast_cache_spot_id on forecast_cache(spot_id);
create index idx_forecast_cache_expira_em on forecast_cache(expira_em);

-- Tabela de feedback
create table feedback (
  id           uuid primary key default gen_random_uuid(),
  spot_id      uuid references spots(id) on delete cascade,
  avaliacao    text not null check (avaliacao in ('ruim', 'ok', 'boa', 'epica')),
  data_sessao  date not null,
  created_at   timestamptz default now()
);

create index idx_feedback_spot_id on feedback(spot_id);
