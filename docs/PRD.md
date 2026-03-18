# PRD — SurQuest MVP

**Versão:** 0.1
**Status:** Rascunho
**Data:** 2026-03-17

---

## 1. Visão geral

O SurQuest é uma plataforma de decisão para surf. O produto não exibe dados brutos de forecast — ele responde uma pergunta objetiva:

> **"Onde vale mais a pena surfar agora, perto de mim?"**

A primeira versão será uma plataforma web, focada em validar o motor de recomendação e a aceitação do produto antes de investir em app nativo.

---

## 2. Problema

Surfistas que querem entrar na água hoje enfrentam um processo manual e fragmentado:

- acessam sites de forecast (Windguru, Surfline, Windy)
- interpretam dados técnicos por conta própria
- tentam lembrar como cada spot se comporta naquelas condições
- consultam grupos de WhatsApp para confirmar

O resultado é perda de tempo, decisões erradas e frustrações desnecessárias.

---

## 3. Proposta de valor

O SurQuest substitui esse processo por uma resposta direta:

- qual spot surfar agora
- por que aquele spot
- qual o melhor horário
- adequado para o nível do usuário

O diferencial não é ter dados. É ter **interpretação prática orientada à decisão**.

---

## 4. Usuário-alvo

**Primário:** surfista frequente (surfa ao menos uma vez por semana)
- conhece o vocabulário básico de surf (swell, maré, onshore/offshore)
- já usa algum site de forecast mas tem dificuldade de interpretar ou decidir
- busca uma resposta rápida antes de sair de casa

**Secundário:** surfista recreativo (fim de semana, ocasional)
- pouco familiarizado com dados de forecast
- depende de opinião de terceiros para decidir
- se o produto for simples o suficiente, passa a usar sozinho

---

## 5. Escopo geográfico do MVP

O MVP cobre os seguintes estados:

| Estado | Principais regiões |
|---|---|
| RS | Torres, Tramandaí, Cidreira, Mostardas |
| SC | Florianópolis, Garopaba, Imbituba, Itajaí, Bombinhas |
| SP | Ubatuba, Caraguatatuba, São Sebastião, Guarujá, Itanhaém |
| RJ | Saquarema, Búzios, Barra da Tijuca, Recreio, Prainha |

---

## 6. Requisitos funcionais do MVP

### 6.1 Localização do usuário
- o usuário pode liberar a geolocalização automática do browser
- ou buscar manualmente por cidade ou região
- o sistema determina a posição central de busca com base nessa entrada

### 6.2 Raio de busca
- o usuário seleciona um raio: 30 km / 60 km / 100 km / 150 km
- o sistema lista os spots cadastrados dentro desse raio

### 6.3 Perfil do surfista
- o usuário informa seu nível: iniciante / intermediário / avançado
- o nível influencia diretamente o score e a recomendação
- não é necessário criar conta no MVP — o dado pode ser salvo localmente

### 6.4 Motor de recomendação
- para cada spot no raio, o sistema busca os dados de forecast atuais
- aplica as regras específicas do spot
- calcula um score de 0 a 10
- ordena os spots do melhor para o pior
- exibe o ranking com explicação

### 6.5 Exibição da recomendação
Cada spot no ranking deve mostrar:
- nome do spot
- score (0 a 10)
- distância do usuário
- nível recomendado
- melhor janela de horário (ex: 06h–09h)
- justificativa da nota (ex: "swell sul favorece o pico, vento fraco lateral, maré enchendo")

### 6.6 Filtro por nível
- o usuário pode filtrar o ranking por nível do surfista
- spots inadequados para o nível selecionado são rebaixados ou omitidos

### 6.7 Coleta de feedback pós-sessão
- após a sessão, o usuário pode avaliar como estava o mar no spot:
  - ruim / ok / boa / épica
- esse dado é armazenado para calibração futura das regras

---

## 7. Requisitos não-funcionais

- **Performance:** a recomendação deve ser carregada em até 3 segundos
- **Disponibilidade:** o sistema deve estar disponível 99% do tempo
- **Mobile-friendly:** o site deve funcionar bem em celular (mesmo sendo web)
- **SEO:** páginas de spots e regiões devem ser indexáveis pelo Google
- **Privacidade:** a localização do usuário não é armazenada sem consentimento explícito

---

## 8. Base de spots

Cada spot cadastrado deve conter:

| Campo | Descrição |
|---|---|
| `id` | identificador único |
| `nome` | nome do spot |
| `estado` | RS, SC, SP ou RJ |
| `cidade` | cidade mais próxima |
| `lat` / `lng` | coordenadas geográficas |
| `orientacao` | direção para a qual a praia está voltada (ex: S, SE, E) |
| `nivel_recomendado` | iniciante / intermediário / avançado / todos |
| `tipo_onda` | beach break / reef break / point break |
| `descricao` | texto curto sobre o spot |
| `regras` | objeto com as regras de score (ver seção 9) |

**Meta para o MVP:** 40–60 spots distribuídos entre RS, SC, SP e RJ, com regras bem definidas para cada um.

### 8.1 Estratégia de cadastro

O cadastro dos spots segue uma abordagem híbrida em três etapas:

**Etapa 1 — Importação via OpenStreetMap**
- Baixar todos os spots de surf do Brasil via Overpass API com a tag `sport=surfing`
- Filtrar pelos estados do MVP (RS, SC, SP, RJ)
- Obter automaticamente: nome, lat/lng, cidade
- Dados do OSM são abertos e podem ser armazenados livremente

**Etapa 2 — Derivação automática de regras base**
- A partir da orientação da praia (derivada das coordenadas + linha de costa), o sistema gera as regras base:
  - swell ideal = direção oposta à face da praia
  - vento offshore = direção oposta à face da praia
- Isso resolve ~60% das regras sem esforço manual

**Etapa 3 — Refinamento manual dos spots principais**
- Para os spots mais relevantes de cada estado, completar e ajustar as regras com conhecimento local:
  - faixa de altura ideal
  - maré favorável
  - nível recomendado
  - particularidades do pico (pedras, barra, corrente)
- Estimativa: 2–4 horas de trabalho para os 40–60 spots do MVP

### 8.2 Formato de armazenamento

No MVP, os spots são armazenados em um **arquivo JSON estático** editado diretamente pela equipe. Não há painel admin nessa fase.

Um painel de administração será implementado na V1.1, quando houver necessidade de contribuição externa.

### 8.3 Geocodificação

- Para busca manual por cidade ou região: **Nominatim** (geocodificação gratuita do OpenStreetMap)
- Google Maps API pode ser usado para mapa visual na interface, se necessário

---

## 9. Regras por spot

Cada spot tem um conjunto de regras que define as condições ideais. Essas regras são usadas pelo motor de score.

### 9.1 Parâmetros avaliados

| Parâmetro | Descrição |
|---|---|
| `swell_direcao_ideal` | direção(ões) de swell que favorecem o pico (ex: S, SSW) |
| `swell_altura_min` | altura mínima de swell para funcionar (em metros) |
| `swell_altura_max` | altura máxima antes de fechar ou ficar perigoso |
| `swell_periodo_min` | período mínimo ideal (em segundos) |
| `vento_direcao_ideal` | direção(ões) de vento favorável (ex: terral = W para praia voltada a E) |
| `vento_velocidade_max` | velocidade máxima de vento tolerável (km/h) |
| `mare_ideal` | enchendo / vazando / baixa / alta / qualquer |
| `mare_altura_min` | altura mínima de maré (em metros) |
| `mare_altura_max` | altura máxima de maré |
| `nivel_max` | nível máximo seguro para o spot (ex: intermediário) |

### 9.2 Exemplo de regra (Praia do Rosa – SC)

```json
{
  "swell_direcao_ideal": ["S", "SSW", "SW"],
  "swell_altura_min": 0.8,
  "swell_altura_max": 2.5,
  "swell_periodo_min": 10,
  "vento_direcao_ideal": ["W", "NW", "N"],
  "vento_velocidade_max": 25,
  "mare_ideal": "enchendo",
  "mare_altura_min": 0.5,
  "mare_altura_max": 1.8,
  "nivel_max": "avancado"
}
```

---

## 10. Motor de score

O score final de cada spot é calculado com base em pesos aplicados a cada fator.

### 10.1 Fórmula base

```
score = (swell_score × 0.35) + (vento_score × 0.25) + (mare_score × 0.15) + (distancia_score × 0.15) + (nivel_score × 0.10)
```

### 10.2 Como cada sub-score é calculado

**swell_score (0–10)**
- direção compatível com o spot: +4 pontos
- altura dentro da faixa ideal: +4 pontos
- período acima do mínimo: +2 pontos

**vento_score (0–10)**
- direção offshore (ideal): 10 pontos
- direção lateral: 5–7 pontos
- direção onshore: 0–3 pontos
- acima da velocidade máxima: penalização proporcional

**mare_score (0–10)**
- maré compatível com o ideal do spot: 10 pontos
- parcialmente compatível: 5 pontos
- incompatível: 0–3 pontos

**distancia_score (0–10)**
- até 20 km: 10 pontos
- 20–50 km: 7 pontos
- 50–100 km: 4 pontos
- acima de 100 km: 2 pontos

**nivel_score (0–10)**
- spot adequado para o nível do usuário: 10 pontos
- um nível acima: 4 pontos
- spot acima do nível do usuário: 0 pontos (pode ser omitido do ranking)

### 10.3 Melhor janela de horário

O sistema calcula o score para as próximas 12 horas (hora a hora) e identifica o intervalo de 2–3 horas com maior score médio. Essa janela é exibida como "melhor horário".

---

## 11. Integrações externas

### 11.1 Open-Meteo Marine API

**O que fornece:** altura, direção e período de swell e ondas; velocidade e direção do vento
**Endpoint:** `https://marine-api.open-meteo.com/v1/marine`
**Custo:** gratuito
**Frequência de atualização:** horária
**Dados consumidos:**
- `wave_height`
- `wave_direction`
- `wave_period`
- `wind_wave_height`
- `wind_speed_10m` (via weather API)
- `wind_direction_10m`

### 11.2 CPTEC/INPE

**O que fornece:** dados de ondas com modelagem local para o litoral brasileiro
**Endpoint:** `http://ondas.cptec.inpe.br` (via scraping ou API pública disponível)
**Custo:** gratuito
**Uso:** validação e complemento dos dados do Open-Meteo, especialmente para RS e SC

### 11.3 Open-Meteo — Maré

**O que fornece:** altura e direção da maré por coordenada geográfica
**Endpoint:** `https://marine-api.open-meteo.com/v1/marine`
**Custo:** gratuito
**Dados consumidos:**
- `sea_level_height` (altura da maré)
**Uso:** obter altura e estado da maré (enchendo/vazando) para cada spot passando lat/lng diretamente, sem necessidade de mapear estações físicas
**Nota:** dados modelados, não medidos — precisão suficiente para o caso de uso de recomendação de surf

---

## 12. Estratégia de SEO

O site deve ter páginas públicas e indexáveis para:

- `/spots` — lista geral de spots
- `/spots/[nome-do-spot]` — página individual de cada spot com dados em tempo real
- `/onde-surfar/[estado]` — ranking do dia por estado
- `/onde-surfar/[cidade]` — ranking do dia por cidade

Essas páginas servem como canal de aquisição orgânica com termos como "onde surfar em Florianópolis hoje".

---

## 13. Fora do escopo do MVP

Os seguintes itens **não fazem parte do MVP** e serão avaliados nas próximas versões:

- conta de usuário / login
- favoritos e alertas
- histórico de sessões
- crowd estimation
- câmeras ao vivo
- comparação com dias históricos
- recomendação por tipo de prancha
- comunidade
- marketplace / loja
- app mobile nativo
- outros esportes radicais

---

## 14. Métricas de sucesso do MVP

O MVP será considerado validado quando atingir:

| Métrica | Meta |
|---|---|
| Usuários únicos no mês | 500 |
| Taxa de retorno em 7 dias | > 30% |
| Feedbacks coletados pós-sessão | 100 |
| NPS informal (avaliação positiva) | > 60% |
| Spots com ao menos 1 feedback real | > 10 |

---

## 15. Roadmap macro

| Fase | Descrição |
|---|---|
| **MVP Web** | motor de score, spots de RS/SC/SP/RJ, recomendação, coleta de feedback |
| **V1.1** | login, favoritos, alertas por condição |
| **V1.2** | histórico, crowd report pelos usuários |
| **V2.0** | app mobile nativo, notificações push |
| **V3.0** | inteligência histórica, modelos preditivos, expansão de spots |

---

## 16. Questões em aberto

- [x] Qual será a estratégia de cadastro inicial dos spots? → importação via OSM + derivação automática de regras base + refinamento manual (ver seção 8)
- [x] Como mapear as estações de maré do NOAA para cada spot brasileiro? → Substituído pelo Open-Meteo Marine API, que retorna dados de maré por lat/lng diretamente (ver seção 11.3)
- [x] Qual será o modelo de monetização inicial? → MVP 100% gratuito, sem restrições. Monetização de funcionalidades específicas será avaliada após validação do produto.
- [x] O produto terá nome e identidade visual próprios para o lançamento? → Nome definido: **SurQuest**. Identidade visual a ser criada.
