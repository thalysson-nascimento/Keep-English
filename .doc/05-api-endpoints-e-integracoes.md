# Keep English — Endpoints da API e integrações externas

> Documento 5 de 5.
> **Parte A** — APIs externas que o protótipo **já chama hoje** (URLs, parâmetros, respostas e como são interpretadas). Isto é fato do código.
> **Parte B** — Contrato da **API própria** (Next.js Route Handlers) a ser construída. Isto é **proposta de contrato**: o protótipo não tem backend; cada endpoint foi derivado dos métodos do `Repo` e das regras do app.

---

# PARTE A — APIs externas (chamadas atuais do protótipo)

Hoje o navegador chama essas APIs diretamente. No projeto Next.js, elas passam a ser chamadas **pelo servidor** (ver `POST /api/v1/lookup`, Parte B).

## A.1 Resumo

| # | Serviço | Para quê | Método e URL base | Chave? |
|---|---|---|---|---|
| 1 | **MyMemory** | Tradução en↔pt-BR | `GET https://api.mymemory.translated.net/get` | Não (opcional `de=email` para mais cota) |
| 2 | **Datamuse** | Ortografia em inglês | `GET https://api.datamuse.com/words` | Não |
| 3 | **LanguageTool** | Ortografia em português (e checagem de "existe em PT") | `POST https://api.languagetoolplus.com/v2/check` | Não no plano gratuito |
| 4 | **Tatoeba v1** | Frase de exemplo em inglês | `GET https://api.tatoeba.org/v1/sentences` | Não |
| 5 | **Google Fonts** | Fonte Nunito | `GET https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&display=swap` | Não |

> Limites de uso e termos de cada serviço mudam. **Confirmar na documentação oficial** antes de ir para produção. Os valores citados abaixo (cotas) são os conhecidos na construção do protótipo e devem ser revalidados.

---

## A.2 MyMemory — tradução

**Requisição**

```
GET https://api.mymemory.translated.net/get?q={texto}&langpair={origem}|{destino}
```

| Parâmetro | Valores usados | Observação |
|---|---|---|
| `q` | Palavra, expressão ou frase (URL-encoded) | Limite de tamanho por consulta |
| `langpair` | `en|pt-BR` ou `pt-BR|en` | Sem espaços |

**Exemplo**

```
GET .../get?q=slums&langpair=en|pt-BR
```

**Resposta (campos que o app usa)**

```json
{
  "responseData": { "translatedText": "favelas", "match": 1 },
  "responseStatus": 200,
  "responseDetails": "",
  "quotaFinished": false
}
```

**Como o app interpreta**

- Sucesso = `responseStatus` numérico igual a **200** e `responseData.translatedText` não vazio.
- Remove um **ponto final** no fim da tradução (`/\.$/`).
- Se `responseStatus ≠ 200`, usa `responseDetails` como mensagem de erro.
- HTTP ≠ 2xx → "a API respondeu com erro HTTP {status}".
- Falha de rede/CORS → "pedido bloqueado ou sem internet".

**Notas:** cota gratuita diária por IP (na construção: ordem de milhares de caracteres/dia sem e-mail; maior com o parâmetro `de=email`). No servidor, **cachear** por `(texto, langpair)`.

---

## A.3 Datamuse — ortografia em inglês

**Requisição**

```
GET https://api.datamuse.com/words?sp={palavra}&max=3
```

`sp` ("spelled like") devolve palavras de grafia parecida, da mais próxima para a mais distante.

**Exemplo:** `?sp=thrve&max=3`

```json
[
  { "word": "thrive", "score": 1000 },
  { "word": "three", "score": 900 },
  { "word": "thrave", "score": 800 }
]
```
*(valores ilustrativos; o app só usa o campo `word`)*

**Como o app interpreta**

- **Palavra válida:** algum item tem `word` igual à entrada em minúsculas.
- **Inválida:** sugestão = `items[0].word` (se houver).
- Erro HTTP ou rede → lança erro e a etapa de ortografia é **ignorada** (segue sem corrigir).

---

## A.4 LanguageTool — ortografia em português

**Requisição**

```
POST https://api.languagetoolplus.com/v2/check
Content-Type: application/x-www-form-urlencoded
Accept: application/json

language=pt-BR&text={palavra}
```

**Resposta (trecho)**

```json
{
  "matches": [
    {
      "message": "Possível erro de ortografia encontrado.",
      "replacements": [ { "value": "obrigado" } ],
      "rule": { "issueType": "misspelling" }
    }
  ]
}
```

**Como o app interpreta**

- Considera **apenas** `matches` com `rule.issueType === "misspelling"` (ignora regras de estilo, como "frase deve começar com maiúscula").
- Sem nenhum match de ortografia → palavra **válida**.
- Com match → sugestão = `replacements[0].value`.
- Plano gratuito: limite de requisições por minuto/IP (na construção, ≈ 20/min). Para produção considerar plano com chave (`username`/`apiKey`).

---

## A.5 Tatoeba v1 — frase de exemplo

**Requisição**

```
GET https://api.tatoeba.org/v1/sentences
    ?lang=eng
    &q={consulta}
    &sort=relevance
    &is_unapproved=no
    &word_count=4-14
    &limit=20
    &showtrans=none
```

| Parâmetro | Valor | Função |
|---|---|---|
| `lang` | `eng` | Frases em inglês |
| `q` | ver abaixo | Consulta de texto |
| `sort` | `relevance` | Mais relevantes e **mais curtas** primeiro |
| `is_unapproved` | `no` | Descarta frases não aprovadas |
| `word_count` | `4-14` | Filtro de tamanho feito **pela API** (frases completas e curtas) |
| `limit` | `20` | Máximo de resultados |
| `showtrans` | `none` | Sem traduções (não são necessárias) |

**Montagem de `q` (regra do app)**

| Entrada | `q` | Exemplo |
|---|---|---|
| 1 palavra | Formas unidas por `\|` (operador OU) | `slums \| slum` |
| 2 palavras | Expressão exata entre aspas | `"take off"` |
| 3+ palavras | **Não chama a API** — a própria entrada vira o exemplo | — |

Formas geradas para 1 palavra: a própria palavra em minúsculas; sem `-ies→y`, `-es`, `-s`; sem `-ing` (se tem mais de 5 letras); sem `-ed`/`-d` (se tem mais de 4 letras).

**Resposta (campos usados)**

```json
{ "data": [ { "id": 123, "text": "Plants thrive in direct sunlight." } ] }
```

**Escolha da frase:** entre os resultados com `text`, a primeira que contenha (como palavra inteira, sem diferenciar maiúsculas) alguma das formas; senão, a primeira. Sem resultados ou erro → exemplo vazio.

**Histórico:** o endereço antigo `https://tatoeba.org/en/api_v0/search` respondia **302** (redirecionamento bloqueado por CORS) e foi abandonado. O app também testou a *Free Dictionary API* (`api.dictionaryapi.dev`) e a descartou (poucos exemplos e sem a forma plural).

---

## A.6 Algoritmo completo do "lookup" (como está no protótipo)

```
entrada = texto digitado (trim)

1. ORTOGRAFIA (pula se tiver espaço, ou se o usuário clicou "Usar … mesmo")
   se parecePT(entrada):                       # acento ou sufixo -ção/-ções/-mente/-ável/-inho/-inha
       lt = LanguageTool(entrada)
       termo = lt.válida || sem sugestão ? entrada : lt.sugestão
   senão:
       dm = Datamuse(entrada)
       se dm.válida: termo = entrada
       senão:
           lt = LanguageTool(entrada)          # pode ser português sem acento (ex.: "casa")
           se lt.válida: termo = entrada
           senão:       termo = dm.sugestão || lt.sugestão || entrada
   qualquer erro de rede => termo = entrada (segue sem corrigir)

2. TRADUÇÃO + IDIOMA
   pt = parecePT(termo)
   t  = MyMemory(termo, pt ? "pt-BR|en" : "en|pt-BR")
   se !pt e norm(t) == norm(termo):            # voltou igual => talvez seja português
       t2 = MyMemory(termo, "pt-BR|en")
       se norm(t2) != norm(termo): pt = true; t = t2
   resultado = pt ? { en: lower(t), pt: termo } : { en: termo, pt: t }

3. EXEMPLO
   exemplo = Tatoeba(resultado.en)             # regras de q em A.5

4. DUPLICADA?   existe palavra com en igual (minúsculo) na lista do usuário
```

`norm(x)` = minúsculas, remove acentos (NFD + `[\u0300-\u036f]`), mantém só `a–z` e espaço.

**Quantidade de chamadas externas por cenário**

| Cenário | Chamadas |
|---|---|
| Palavra em inglês correta | Datamuse + MyMemory + Tatoeba = **3** |
| Palavra em inglês com erro | Datamuse + LanguageTool + MyMemory + Tatoeba = **4** |
| Português com acento | LanguageTool + MyMemory + Tatoeba = **3** |
| Português sem acento (ex.: *casa*) | Datamuse + LanguageTool + MyMemory (en\|pt) + MyMemory (pt\|en) + Tatoeba = **5** |
| Expressão de 2 palavras | MyMemory + Tatoeba = **2** |
| Frase de 3+ palavras | MyMemory = **1** |

No servidor, essas chamadas ficam **dentro de um único `POST /lookup`** (o cliente faz 1 requisição).

---

# PARTE B — API própria (Next.js)

## B.1 Convenções

| Item | Regra |
|---|---|
| Base | `/api/v1` (Auth.js usa `/api/auth/*`) |
| Formato | JSON UTF-8 (`Content-Type: application/json`) |
| Autenticação | Cookie de sessão `httpOnly`. Rotas marcadas 🔒 exigem sessão (401 sem ela) |
| Datas e horas | ISO 8601 em UTC (`2026-11-08T20:15:00.000Z`) |
| Dia do usuário | `localDate` = `YYYY-MM-DD` no fuso `User.timezone` |
| Paginação | `offset` (padrão 0) + `limit` (padrão por rota; máx. 50) → `{ items, total, hasMore, offset, limit }` |
| IDs | `string` (cuid) |
| Idiomas | `"en"` ou `"pt"` |
| Erros | Sempre no formato abaixo |

**Formato de erro**

```json
{
  "error": {
    "code": "WORD_DUPLICATE",
    "message": "Você já anotou essa palavra.",
    "details": { "wordId": "ckx..." }
  }
}
```

**Códigos HTTP e `code`**

| HTTP | `code` | Quando |
|---|---|---|
| 400 | `BAD_REQUEST` | JSON inválido |
| 401 | `UNAUTHENTICATED` | Sem sessão |
| 401 | `INVALID_CREDENTIALS` | Login errado ("E-mail ou senha incorretos") |
| 403 | `GOAL_REQUIRED` | Anotar palavra sem meta habilitada hoje |
| 403 | `GOAL_REACHED` | Anotar palavra com a meta de hoje já batida e nenhuma nova meta habilitada |
| 404 | `NOT_FOUND` | Recurso inexistente ou de outro usuário |
| 409 | `WORD_DUPLICATE` | Palavra já existe |
| 409 | `EMAIL_TAKEN` | E-mail já cadastrado |
| 409 | `GOAL_LOCKED` | Trocar meta com a meta atual em andamento |
| 409 | `GOAL_UNCHANGED` | Escolher a mesma meta já batida |
| 409 | `TEST_FINISHED` | Responder teste já finalizado |
| 422 | `VALIDATION_ERROR` | Falha no Zod (`details.fields`) |
| 422 | `GOAL_TOO_LOW` | Meta menor que as palavras já feitas hoje |
| 422 | `NO_WORDS` | Iniciar teste sem palavras |
| 429 | `TEST_COOLDOWN` | Teste antes de 30 min (`details.retryAfterSeconds`) |
| 429 | `RATE_LIMITED` | Excesso de requisições |
| 502 | `UPSTREAM_ERROR` | Falha total nas APIs externas |

---

## B.2 Autenticação

### `POST /api/v1/auth/registro`
Cria a conta e abre a sessão.

```json
// request
{ "email": "ana@exemplo.com", "password": "senha-forte-123", "name": "Ana" }
```
```json
// 201
{ "user": { "id": "ckx1", "email": "ana@exemplo.com", "name": "Ana", "avatar": "🦉", "timezone": "America/Sao_Paulo" } }
```
Erros: `422 VALIDATION_ERROR`, `409 EMAIL_TAKEN`, `429 RATE_LIMITED`.

### Login e sessão (Auth.js)

| Rota | Função |
|---|---|
| `POST /api/auth/callback/credentials` | Login por e-mail e senha (usado via `signIn("credentials", …)`) |
| `GET /api/auth/session` | Sessão atual: `{ "user": { "id","email","name","image" }, "expires": "..." }` ou `null` |
| `POST /api/auth/signout` | Encerra a sessão |
| `GET /api/auth/csrf` | Token CSRF do Auth.js |

### `POST /api/v1/auth/esqueci-senha`
```json
{ "email": "ana@exemplo.com" }   // 202 sempre, corpo: { "ok": true }
```

### `POST /api/v1/auth/redefinir-senha`
```json
{ "token": "abc...", "password": "nova-senha-123" }   // 200 { "ok": true } | 400 token inválido/expirado
```

### 🔒 `POST /api/v1/auth/alterar-senha`
```json
{ "currentPassword": "antiga", "newPassword": "nova-senha-123" }   // 200 { "ok": true }
```

---

## B.3 Perfil

### 🔒 `GET /api/v1/me`
```json
{
  "id": "ckx1", "email": "ana@exemplo.com", "name": "Ana", "avatar": "🦉",
  "timezone": "America/Sao_Paulo", "createdAt": "2026-11-01T12:00:00.000Z"
}
```
*(substitui `Repo.profile()`; "Estudando desde" usa `createdAt`)*

### 🔒 `PATCH /api/v1/me`
Todos os campos opcionais. `name` ≤ 24 (vazio → "Estudante"); `avatar` ∈ {🦉 🦊 🐼 🐯 🐸 🦄 🐙 🚀}; `timezone` IANA válido.
```json
{ "name": "Ana", "avatar": "🦊" }   // 200 → mesmo corpo do GET /me
```

### 🔒 `DELETE /api/v1/me`
```json
{ "password": "senha-atual" }   // 204; apaga a conta e todos os dados
```

### 🔒 `GET /api/v1/me/export`
JSON com palavras, metas, testes e pontos (download).

---

## B.4 Palavras

### 🔒 `GET /api/v1/words`

| Query | Padrão | Descrição |
|---|---|---|
| `q` | — | Filtra por inglês **ou** português, sem diferenciar maiúsculas/acentos |
| `offset` | 0 | — |
| `limit` | 15 | máx. 50. "Últimas palavras" usa `limit=10`; "Todas" usa `15` |

Ordem: mais recentes primeiro.

```json
{
  "items": [
    {
      "id": "ckw9", "word": "thrive", "meaning": "prosperar",
      "example": "Plants thrive in direct sunlight.", "sourceLang": "en",
      "createdAt": "2026-11-08T14:02:00.000Z"
    }
  ],
  "total": 24, "hasMore": true, "offset": 0, "limit": 15
}
```
*(substitui `Repo.page()` e `Repo.list()`)*

### 🔒 `POST /api/v1/words`
O servidor **revalida** a regra da meta e a duplicidade.
```json
// request
{ "word": "thrive", "meaning": "prosperar", "example": "Plants thrive in direct sunlight.", "sourceLang": "en" }
```
```json
// 201
{
  "word": { "id": "ckw9", "word": "thrive", "meaning": "prosperar", "example": "…", "sourceLang": "en", "createdAt": "…" },
  "progress": { "wordsToday": 4, "goal": 5, "reached": false, "xpToday": 40 }
}
```
Erros: `409 WORD_DUPLICATE` (`details.wordId`), `403 GOAL_REQUIRED`, `403 GOAL_REACHED`, `422 VALIDATION_ERROR`.
Limites: `word` 1–80, `meaning` 1–120, `example` ≤ 200.

### 🔒 `DELETE /api/v1/words/:id`
`204`. `404` se não for do usuário. Reduz `DailyXp` do dia da palavra.

### 🔒 `GET /api/v1/words/exists?word=thrive`
```json
{ "exists": true, "wordId": "ckw9" }
```
*(usado para avisar "já anotada" antes de salvar; o `lookup` também devolve `duplicate`)*

---

## B.5 Lookup (corrige + traduz + exemplo)

### 🔒 `POST /api/v1/lookup`
Faz tudo da Parte A.6 no servidor e devolve **uma resposta**.

```json
// request
{ "term": "thrve", "skipSpell": false }
```
```json
// 200
{
  "input": "thrve",
  "term": "thrive",
  "wasCorrected": true,
  "detectedLang": "en",
  "en": "thrive",
  "pt": "prosperar",
  "example": "Plants thrive in direct sunlight.",
  "duplicate": false,
  "warnings": []
}
```

| Campo | Descrição |
|---|---|
| `input` | O que a pessoa digitou |
| `term` | Texto após a correção (igual a `input` se não houve) |
| `wasCorrected` | Se o servidor corrigiu a ortografia (cliente mostra "Corrigi “x” para “y”" e o link "Usar … mesmo", que reenvia com `skipSpell: true`) |
| `detectedLang` | Idioma do que foi digitado |
| `en` / `pt` | Par traduzido (inglês em minúsculas quando veio do português) |
| `example` | Frase em inglês ou `null` |
| `duplicate` | Palavra já existe na lista (o cliente bloqueia "Salvar") |
| `warnings` | Lista de avisos: `SPELL_UNAVAILABLE`, `EXAMPLE_NOT_FOUND`, `TRANSLATION_FALLBACK` |

Erros: `422 VALIDATION_ERROR` (vazio, > 80 caracteres), `429 RATE_LIMITED`, `502 UPSTREAM_ERROR` (tradução indisponível — a pessoa vê "Não foi possível traduzir agora").
Cache sugerido: `(term normalizado, skipSpell)` por 24 h.

---

## B.6 Meta diária

Estado devolvido (mesmo corpo em `GET` e `PUT`):

```json
{
  "date": "2026-11-08",
  "activeGoal": 5,
  "enabledToday": true,
  "enabledAt": "2026-11-08T12:10:00.000Z",
  "wordsToday": 3,
  "remaining": 2,
  "state": "IN_PROGRESS",
  "locked": true,
  "reached": false,
  "options": [
    { "value": 3,  "disabled": true,  "done": false },
    { "value": 5,  "disabled": true,  "done": false },
    { "value": 10, "disabled": true,  "done": false },
    { "value": 15, "disabled": true,  "done": false },
    { "value": 20, "disabled": true,  "done": false }
  ],
  "canAddWord": true,
  "addWordLabel": "ADD",
  "message": "Meta de 5 ativa. Faltam 2 palavra(s) para liberar outras metas."
}
```

| Campo | Valores / significado |
|---|---|
| `state` | `NONE` (sem meta hoje) · `IN_PROGRESS` · `REACHED` · `MAX_REACHED` |
| `locked` | Botões de meta travados (estado `IN_PROGRESS`) |
| `options[].disabled` | `locked` **ou** `value < wordsToday` |
| `options[].done` | `value == activeGoal` e meta batida (botão opaco) |
| `canAddWord` | `true` só em `IN_PROGRESS` |
| `addWordLabel` | `ADD` · `SET_GOAL` · `CHOOSE_NEW` · `MAX_REACHED` (o cliente escolhe o texto do botão) |
| `message` | Texto sugerido para a linha de estado (opcional; o cliente pode montar) |

Os textos de botão por estado estão no doc 03 (seção 1).

### 🔒 `GET /api/v1/goals/today`
Devolve o estado acima. *(substitui o cálculo local de `locked`, `active`, `canEnable`, `reached`)*

### 🔒 `PUT /api/v1/goals/today`
Habilita uma meta ("Habilitar meta diária").
```json
{ "goal": 10 }
```
`200` → estado atualizado (`IN_PROGRESS`, e `enabledAt` = agora; cria um `GoalLog`).
Erros: `409 GOAL_LOCKED` (meta em andamento), `409 GOAL_UNCHANGED` (mesma meta já batida), `422 GOAL_TOO_LOW` (`goal < wordsToday`), `422 VALIDATION_ERROR` (fora de 3/5/10/15/20).

### 🔒 `GET /api/v1/goals/history?days=7`
```json
{ "items": [ { "date": "2026-11-02", "goal": 5 }, { "date": "2026-11-03", "goal": 5 } ] }
```
Meta vigente de cada dia (último `GoalLog` até o fim do dia; padrão 5).

---

## B.7 Estatísticas

### 🔒 `GET /api/v1/stats/summary`
Alimenta os cards hero, as pílulas do topo e o resumo do Perfil.
```json
{
  "totalWords": 24,
  "wordsToday": 3,
  "weekWords": 14,
  "avgPerDay": 2.0,
  "bestDay": 5,
  "streak": 6,
  "bestStreak": 6,
  "goal": 5,
  "progressPercent": 60
}
```

### 🔒 `GET /api/v1/stats/daily?days=7`
`days` ∈ {7, 14, 30}. Alimenta "Sua evolução" (7) e "Seu desempenho" (7/14).
```json
{
  "scaleMax": 5,
  "days": [
    { "date": "2026-11-02", "weekday": 0, "words": 3, "goal": 5, "hit": false, "isToday": false },
    { "date": "2026-11-08", "weekday": 6, "words": 3, "goal": 5, "hit": false, "isToday": true }
  ],
  "totals": { "total": 24, "avgPerDay": 3.4, "bestDay": 5 }
}
```

| Campo | Regra |
|---|---|
| `weekday` | 0 = domingo … 6 = sábado (o cliente mostra D S T Q Q S S) |
| `goal` | Meta vigente do dia (histórico). **Para hoje, o cliente pode substituir pela meta selecionada** (pré-visualização) sem consultar o servidor |
| `hit` | `words ≥ goal` |
| `scaleMax` | `max(words de todos os dias, goal dos dias passados)`, mínimo 1 — **não inclui a meta de hoje**, para que escolher meta não reescale os dias anteriores |

---

## B.8 Testes

Fluxo: **disponibilidade → iniciar → responder (×n) → finalizar**.

### 🔒 `GET /api/v1/tests/availability`
```json
{
  "available": false,
  "hasWords": true,
  "wordsCount": 24,
  "lastFinishedAt": "2026-11-08T20:10:00.000Z",
  "nextAvailableAt": "2026-11-08T20:40:00.000Z",
  "secondsLeft": 1500
}
```
O cliente mostra "⏳ Próximo teste liberado em MM:SS" contando a partir de `nextAvailableAt`.

### 🔒 `POST /api/v1/tests`
Inicia um teste (não recebe corpo).
```json
// 201
{
  "testId": "ckt1",
  "total": 5,
  "questions": [
    { "id": "q1", "position": 1, "type": "MULTIPLE_CHOICE", "prompt": "prosperar", "options": ["borrow", "thrive", "reach", "wander"] },
    { "id": "q2", "position": 2, "type": "TYPED", "prompt": "colheita" }
  ]
}
```
- **Nenhum gabarito** é enviado.
- Erros: `429 TEST_COOLDOWN` (`details.retryAfterSeconds`), `422 NO_WORDS`.
- Se já existir teste `IN_PROGRESS`, devolve o mesmo (retomar) — decisão de produto; o protótipo sempre começa um novo.

### 🔒 `POST /api/v1/tests/:id/answers`
```json
{ "questionId": "q1", "answer": "thrive" }
```
```json
// 200
{ "correct": true, "correctAnswer": "thrive", "scoreSoFar": 1, "answered": 1, "total": 5 }
```
Correção: compara `norm(answer)` com `norm(gabarito)`. Responder duas vezes a mesma pergunta → `409 TEST_FINISHED`/`ALREADY_ANSWERED`.

### 🔒 `POST /api/v1/tests/:id/finish`
Exige todas as perguntas respondidas. Registra `finishedAt`, atualiza `DailyXp` (+5 por acerto) e inicia o intervalo de 30 min.
```json
// 200
{
  "testId": "ckt1", "score": 4, "total": 5, "percent": 80,
  "icon": "TROPHY", "title": "Muito bem!",
  "finishedAt": "2026-11-08T20:15:00.000Z",
  "nextAvailableAt": "2026-11-08T20:45:00.000Z",
  "xpEarned": 20
}
```
`icon`: `TROPHY` (≥ 80) · `CLAP` (≥ 50) · `MUSCLE`. `title`: "Perfeito!" (100) · "Muito bem!" (≥ 60) · "Continue praticando!".
*(O gráfico/histórico usa outra regra de ícone: 🏆 ≥ 80, 👏 ≥ 60, 💪 — manter as duas como estão no protótipo ou unificar.)*

### 🔒 `POST /api/v1/tests/:id/abandon`
O ✕ antes do resultado. `204`. Não conta nem bloqueia. (Pode ser omitido: testes `IN_PROGRESS` antigos viram `ABANDONED` por *job*.)

### 🔒 `GET /api/v1/tests?offset=0&limit=10`
Histórico (mais recente primeiro; só `FINISHED`).
```json
{
  "items": [ { "id": "ckt1", "finishedAt": "2026-11-08T20:15:00.000Z", "score": 4, "total": 5, "percent": 80 } ],
  "total": 5, "hasMore": false, "offset": 0, "limit": 10
}
```

### 🔒 `GET /api/v1/tests/summary`
```json
{ "count": 5, "best": 100, "average": 74, "last": 60 }
```
Valores em porcentagem; `null` quando não há testes.

### 🔒 `GET /api/v1/tests/chart?limit=10`
Últimos testes em ordem **cronológica** (antigo → novo).
```json
{ "items": [ { "id": "ckt0", "finishedAt": "2026-11-04T20:00:00.000Z", "percent": 60, "band": "BLUE" } ] }
```
`band`: `GREEN` (≥ 80) · `BLUE` (60–79) · `ORANGE` (< 60).

---

## B.9 Ranking

Pontos da semana = soma dos últimos 7 dias de `DailyXp` (10 × palavra + 5 × acerto).

### 🔒 `GET /api/v1/ranking?period=week&offset=0&limit=10`
```json
{
  "period": { "from": "2026-11-02", "to": "2026-11-08" },
  "items": [
    { "rank": 1, "userId": "cku1", "name": "Ana Souza", "avatar": "🦊", "xp": 682, "isMe": false },
    { "rank": 22, "userId": "ckx1", "name": "Ana", "avatar": "🦉", "xp": 315, "isMe": true }
  ],
  "total": 31, "hasMore": true, "offset": 0, "limit": 10
}
```
*(substitui `Repo.ranking()`; "Carregar mais" = `offset += 10`)*

### 🔒 `GET /api/v1/ranking/top`
Os 3 primeiros (pódio).
```json
{ "items": [ { "rank": 1, "userId": "…", "name": "Ana Souza", "avatar": "🦊", "xp": 682, "isMe": false }, { "rank": 2, "…": "…" }, { "rank": 3, "…": "…" } ] }
```

### 🔒 `GET /api/v1/ranking/compare`
Eu + os 2 mais próximos **acima**; se eu sou o 1º ou 2º, completa com os de baixo.
```json
{
  "days": ["2026-11-02","2026-11-03","2026-11-04","2026-11-05","2026-11-06","2026-11-07","2026-11-08"],
  "mode": "ABOVE",
  "me":     { "rank": 22, "name": "Ana", "avatar": "🦉", "xp": 315, "daily": [30,50,20,60,40,75,40], "cumulative": [30,80,100,160,200,275,315] },
  "others": [
    { "rank": 21, "name": "Rafa Teles",    "avatar": "🐯", "xp": 322, "daily": [0,0,0,0,0,0,0], "cumulative": [0,0,0,0,0,0,0] },
    { "rank": 20, "name": "Wesley Paz",    "avatar": "🐙", "xp": 335, "daily": [0,0,0,0,0,0,0], "cumulative": [0,0,0,0,0,0,0] }
  ],
  "gapToNext": 8
}
```

| Campo | Regra |
|---|---|
| `mode` | `ABOVE` (2 acima) · `MIXED` (1 acima + 1 abaixo) · `BELOW` (sou o 1º: 2 abaixo) |
| `others[0]` | O mais próximo **acima** de mim (ou abaixo, no modo `BELOW`) |
| `gapToNext` | `others[0].xp − me.xp + 1`, mínimo 1 (texto "faltam X XP para passar …"). Como líder: `me.xp − others[0].xp` (texto "Vantagem de X XP") |
| `cumulative` | Soma corrida de `daily` — é o que o gráfico de linhas desenha |

Cores no cliente: eu = azul, `others[0]` = laranja, `others[1]` = vermelho.

---

## B.10 Utilitário

### `GET /api/v1/health`
`{ "ok": true, "time": "2026-11-08T20:15:00.000Z" }` — sem autenticação.

---

## B.11 Mapa: tela × endpoints

| Tela / ação | Endpoints |
|---|---|
| Cabeçalho (🔥, 📘) e card laranja | `GET /stats/summary` |
| Botão "Fazer teste" (Início e Testes) | `GET /tests/availability` |
| Meta diária | `GET /goals/today`, `PUT /goals/today` |
| Sua evolução | `GET /stats/daily?days=7` (+ meta selecionada aplicada no cliente) |
| Últimas palavras | `GET /words?limit=10`, `DELETE /words/:id` |
| Anotar palavra | `POST /lookup`, `POST /words` |
| Palavras: card verde | `GET /stats/summary` |
| Palavras: desempenho | `GET /stats/daily?days=7\|14` |
| Todas as palavras | `GET /words?q&offset&limit=15` |
| Teste | `POST /tests`, `POST /tests/:id/answers` (×n), `POST /tests/:id/finish` |
| Testes: hero, gráfico e histórico | `GET /tests/summary`, `GET /tests/chart`, `GET /tests?limit=10` |
| Ranking | `GET /ranking/top`, `GET /ranking/compare`, `GET /ranking?offset&limit=10` |
| Perfil | `GET/PATCH /me`, `GET /stats/summary`, `GET /tests/summary`, `POST /auth/alterar-senha`, `DELETE /me`, `GET /me/export`, `signOut` |
| Login / cadastro | `POST /auth/registro`, `signIn("credentials")`, `GET /api/auth/session` |

---

## B.12 Idempotência, concorrência e limites

| Tema | Regra |
|---|---|
| Palavra duplicada em duas abas | A *constraint* única garante; a segunda recebe `409` |
| Dois "Habilitar meta" | Última escrita vale; validar estado dentro de uma transação |
| Responder pergunta duas vezes | `409` na segunda |
| Limites de taxa sugeridos | `/auth/*`: 5/15 min · `/lookup`: 30/min por usuário · demais: 120/min |
| Timeout das integrações | 4 s por chamada externa; `lookup` total ≤ 10 s |
| Paralelismo no `lookup` | Datamuse e LanguageTool podem rodar em paralelo; MyMemory depende da correção; Tatoeba depende da tradução |

---

# PARTE C — Endpoints implementados no projeto

Esta seção descreve as rotas que existem atualmente no Next.js e substitui a
proposta `/api/v1` da Parte B quando houver diferenças. As rotas de negócio
validam a sessão Better Auth no servidor, derivam o usuário da sessão e acessam
o PostgreSQL por meio dos repositórios Prisma. A interface consome esses endpoints;
não usa classes ou dados mockados para as funcionalidades abaixo.

| Método e rota | Autenticação | Responsabilidade |
|---|---|---|
| `GET /api/home` | 🔒 | Dados do início: totais, atividade da semana, metas, palavras recentes e último teste |
| `GET /api/home/summary` | 🔒 | Totais, sequência e XP exibidos no cabeçalho |
| `POST /api/home/daily-goal` | 🔒 | Habilita ou atualiza a meta diária; corpo `{ "goal": 3 \| 5 \| 10 \| 15 \| 20 }` |
| `GET /api/words?query=&offset=0&limit=15` | 🔒 | Pesquisa e paginação das palavras do usuário |
| `POST /api/words` | 🔒 | Valida e salva uma palavra, atualizando a conclusão da meta quando necessário |
| `DELETE /api/words/:id` | 🔒 | Remove somente uma palavra pertencente ao usuário autenticado |
| `GET /api/words/overview` | 🔒 | Resumo, desempenho de 7/14 dias e palavras recentes |
| `POST /api/words/lookup` | 🔒 | Consulta os serviços externos no servidor e verifica duplicidade |
| `GET /api/tests` | 🔒 | Histórico, estatísticas e disponibilidade do teste |
| `GET /api/tests/session` | 🔒 | Estado de acesso e perguntas para uma sessão de teste |
| `POST /api/tests/complete` | 🔒 | Valida respostas e regras de acesso no servidor e registra o resultado |
| `GET /api/profile` | 🔒 | Perfil e estatísticas do usuário autenticado |
| `GET /api/ranking?offset=0&limit=10` | 🔒 | Página do ranking semanal |
| `GET /api/ranking/top` | 🔒 | Pódio semanal |
| `GET /api/ranking/compare` | 🔒 | Comparação semanal do usuário com participantes próximos |
| `ALL /api/auth/[...all]` | Conforme operação | Autenticação, sessão e demais operações Better Auth |

Entradas externas são validadas com Zod. Os endpoints de palavras retornam
`400` para entrada inválida, `401` sem sessão, `404` quando a palavra não
pertence ao usuário e `409` para duplicidade ou regras de meta. O salvamento de
teste retorna um estado de domínio (`completed`, `invalid`, `words`, `goal` ou
`cooldown`), com status HTTP apropriado. Falhas de provedores de tradução são
retornadas como `502`, sem expor detalhes internos.

As APIs de ranking mantêm os caminhos existentes; as telas de início, palavras,
testes e perfil foram migradas para consumir os endpoints próprios. O endpoint
de autenticação continua sendo gerenciado pelo Better Auth.
