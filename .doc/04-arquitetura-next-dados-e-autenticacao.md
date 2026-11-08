# Keep English — Arquitetura (Next.js), modelo de dados e autenticação

> Documento 4 de 5. Mistura **o que o protótipo já faz** com **propostas de arquitetura** para o projeto real.
> Tudo marcado como *Sugestão* é uma recomendação para decidir, não algo que já exista.

---

## 1. Visão geral da arquitetura

```
Navegador (React)                    Servidor Next.js                       Externos
─────────────────                    ────────────────                       ────────
Páginas / componentes   ──fetch──▶   Route Handlers  /api/v1/*   ──────▶   MyMemory
TanStack Query (cache)  ◀──JSON──    Serviços de domínio                    Datamuse
Cookie de sessão        ───────────▶ Auth (sessão)                          LanguageTool
                                     Prisma ─────▶ Banco (SQLite→Postgres)  Tatoeba
```

Camadas no servidor (de fora para dentro):

1. **Route Handlers** (`app/api/v1/**/route.ts`): HTTP, validação de entrada (Zod), autenticação, formatação de erro.
2. **Serviços de domínio** (`src/server/services`): regras de negócio (meta, teste, ranking, palavras). Não conhecem HTTP.
3. **Repositórios** (`src/server/repos`): acesso ao banco via Prisma.
4. **Integrações** (`src/server/integrations`): clientes das APIs externas (tradução, ortografia, exemplos), com cache e *timeouts*.

No protótipo, as camadas 1–3 estão **todas dentro do objeto `Repo`** (no navegador) e a camada 4 são as funções `mm`, `resolve`, `spell`, `sentence`. A troca para o Next.js é, na prática, mover cada uma para o seu lugar (tabela da seção 9).

---

## 2. Stack (Sugestão)

| Área | Escolha | Motivo |
|---|---|---|
| Framework | **Next.js (App Router)** + TypeScript | Pedido do projeto; RSC para telas estáticas, Route Handlers para a API |
| Estilo | **Tailwind CSS** com os tokens do doc 02 (ou CSS Modules + variáveis CSS) | Os valores do design são fixos e curtos; tokens mapeiam 1:1 |
| Fonte | `next/font/google` → Nunito 600/700/800/900 | Sem *layout shift* e sem requisição externa em tempo de execução |
| Dados no cliente | **TanStack Query** | Cache, *invalidate* após mutações, paginação infinita (`useInfiniteQuery`) |
| Validação | **Zod** (entrada e saída) | Um schema por endpoint, compartilhado com o cliente |
| Banco | **Prisma** + **SQLite** em desenvolvimento → **PostgreSQL** em produção | Você pediu SQLite no início; Prisma permite trocar sem reescrever |
| Autenticação | **Auth.js (NextAuth v5)** — provider *Credentials* (e-mail + senha), opcional Google | Sessão em cookie *httpOnly*; ver seção 6 |
| Hash de senha | **Argon2id** (ou bcrypt custo ≥ 12) | Padrão atual |
| Datas | `date-fns` + `date-fns-tz` (ou Temporal quando disponível) | Limites de dia por fuso horário |
| Testes | Vitest (unidade/serviços) + Playwright (fluxos) | Regras de meta/teste/ranking merecem testes |
| Limite de uso | `@upstash/ratelimit` (ou middleware próprio) | Proteger login e APIs externas |
| Deploy | Vercel + Postgres gerenciado (Neon/Supabase) | Simples para Next.js |

---

## 3. Estrutura de pastas (Sugestão)

```
keep-english/
├─ prisma/
│  ├─ schema.prisma
│  ├─ migrations/
│  └─ seed.ts                      # dados de exemplo (modo demo)
├─ public/
├─ src/
│  ├─ app/
│  │  ├─ (auth)/
│  │  │  ├─ login/page.tsx
│  │  │  ├─ registro/page.tsx
│  │  │  └─ esqueci-senha/page.tsx
│  │  ├─ (app)/                    # área autenticada (layout com cabeçalho + navegação)
│  │  │  ├─ layout.tsx
│  │  │  ├─ page.tsx               # Início
│  │  │  ├─ palavras/page.tsx
│  │  │  ├─ palavras/todas/page.tsx
│  │  │  ├─ testes/page.tsx
│  │  │  ├─ teste/page.tsx         # tela cheia do teste
│  │  │  ├─ ranking/page.tsx
│  │  │  └─ perfil/page.tsx
│  │  ├─ api/
│  │  │  ├─ auth/[...nextauth]/route.ts
│  │  │  └─ v1/
│  │  │     ├─ auth/registro/route.ts
│  │  │     ├─ me/route.ts
│  │  │     ├─ words/route.ts            # GET lista, POST cria
│  │  │     ├─ words/[id]/route.ts       # DELETE
│  │  │     ├─ lookup/route.ts           # corrige + traduz + exemplo
│  │  │     ├─ goals/today/route.ts
│  │  │     ├─ stats/daily/route.ts
│  │  │     ├─ stats/summary/route.ts
│  │  │     ├─ tests/route.ts            # GET histórico, POST inicia
│  │  │     ├─ tests/[id]/answers/route.ts
│  │  │     ├─ tests/[id]/finish/route.ts
│  │  │     ├─ tests/availability/route.ts
│  │  │     └─ ranking/{route.ts,top/route.ts,compare/route.ts}
│  │  ├─ layout.tsx                # fonte, tema, providers
│  │  └─ globals.css               # variáveis do doc 02
│  ├─ components/                  # ver mapa do doc 03 (seção 9)
│  │  ├─ ui/                       # Button, Chip, Card, TextField, Sheet, Toast
│  │  ├─ home/  words/  tests/  quiz/  ranking/  profile/
│  ├─ lib/
│  │  ├─ api-client.ts             # fetch tipado (cliente)
│  │  ├─ dates.ts                  # dayKey, limites de dia por fuso
│  │  ├─ text.ts                   # fold/norm (acentos), looksPt
│  │  └─ constants.ts              # GOALS, COOLDOWN, XP
│  ├─ server/
│  │  ├─ auth.ts                   # configuração do Auth.js
│  │  ├─ db.ts                     # PrismaClient singleton
│  │  ├─ http.ts                   # erros, respostas, withAuth()
│  │  ├─ services/  words.ts goals.ts stats.ts tests.ts ranking.ts lookup.ts
│  │  ├─ repos/     (consultas Prisma)
│  │  └─ integrations/ mymemory.ts datamuse.ts languagetool.ts tatoeba.ts
│  ├─ schemas/                     # Zod (requests/responses)
│  └─ types/
├─ tests/
├─ .env.example
└─ next.config.ts
```

---

## 4. Estratégia de renderização

| Tela | Tipo | Observação |
|---|---|---|
| Login / registro | Server Component + formulário (Client) | Sem dados do usuário |
| Layout `(app)` | Server Component | Lê a sessão; redireciona para `/login` se não houver |
| Início, Palavras, Testes, Ranking, Perfil | Client Components com TanStack Query (dados iniciais podem vir pré-carregados por RSC) | Muitas animações e estado local |
| Teste | Client Component | Fluxo com estado local + chamadas por pergunta |
| Todas as palavras | Client Component com `useInfiniteQuery` | Rolagem infinita e busca |

**Navegação entre abas:** rotas reais (`/`, `/palavras`, `/testes`, `/ranking`, `/perfil`) com a barra inferior como `<Link>`. O botão flutuante só é renderizado em `/`.

**Telas cheias:** `/teste` e `/palavras/todas` podem ser rotas dedicadas (melhor para o botão voltar do navegador) com layout próprio, sem a navegação inferior. A folha "Anotar palavra" continua como componente modal.

---

## 5. Modelo de dados (Prisma — Sugestão)

```prisma
datasource db { provider = "sqlite" /* trocar para "postgresql" em produção */ url = env("DATABASE_URL") }
generator client { provider = "prisma-client-js" }

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String?              // nulo se entrar só com Google
  name          String   @default("Estudante")   // até 24 caracteres
  avatar        String   @default("🦉")
  timezone      String   @default("America/Sao_Paulo")
  emailVerified DateTime?
  createdAt     DateTime @default(now())
  words         Word[]
  goalLogs      GoalLog[]
  tests         Test[]
  dailyXp       DailyXp[]
  sessions      Session[]            // se usar sessão em banco
  accounts      Account[]            // provedores OAuth (Auth.js)
}

model Word {
  id         String   @id @default(cuid())
  userId     String
  term       String                  // inglês, exibição (ex.: "thrive")
  termKey    String                  // inglês minúsculo, sem acentos (unicidade)
  meaning    String                  // português
  example    String?                 // frase em inglês
  sourceLang String                  // "en" | "pt" — idioma digitado
  createdAt  DateTime @default(now())
  localDate  String                  // "YYYY-MM-DD" no fuso do usuário (facilita estatísticas)
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, termKey])        // REGRA: palavra não repete por usuário
  @@index([userId, createdAt])
  @@index([userId, localDate])
}

model GoalLog {                      // cada "Habilitar meta diária" gera uma linha
  id        String   @id @default(cuid())
  userId    String
  goal      Int                      // 3 | 5 | 10 | 15 | 20
  enabledAt DateTime @default(now())
  localDate String                   // dia em que foi habilitada
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, localDate])
}

model Test {
  id         String   @id @default(cuid())
  userId     String
  startedAt  DateTime @default(now())
  finishedAt DateTime?               // preenchido ao chegar no resultado
  total      Int                     // nº de perguntas (≤ 5)
  score      Int?                    // acertos (só após finalizar)
  status     String   @default("IN_PROGRESS")   // IN_PROGRESS | FINISHED | ABANDONED
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  questions  TestQuestion[]

  @@index([userId, finishedAt])
}

model TestQuestion {
  id          String  @id @default(cuid())
  testId      String
  position    Int                    // 1..total
  wordId      String
  type        String                 // "MULTIPLE_CHOICE" | "TYPED"
  prompt      String                 // palavra em português exibida
  options     String?                // JSON string[] (só múltipla escolha)
  answer      String                 // gabarito em inglês — NUNCA enviado ao cliente antes de responder
  given       String?                // resposta do usuário
  correct     Boolean?
  answeredAt  DateTime?
  test        Test    @relation(fields: [testId], references: [id], onDelete: Cascade)

  @@unique([testId, position])
}

model DailyXp {                      // agregado para o ranking (evita recalcular tudo)
  userId    String
  localDate String                   // "YYYY-MM-DD"
  xp        Int      @default(0)     // 10×palavras + 5×acertos
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@id([userId, localDate])
  @@index([localDate, xp])
}
```

> No SQLite do Prisma não há `enum`/`Json` nativos; usar `String` (como acima). No PostgreSQL, trocar por `enum` e `Json`.

### 5.1 Derivações (nada disso precisa de tabela própria)

| Dado | Como obter |
|---|---|
| Palavras de hoje | `COUNT(*)` em `Word` com `localDate = hoje` |
| Meta habilitada hoje | Último `GoalLog` com `localDate = hoje` |
| Meta de um dia passado | Último `GoalLog` com `enabledAt ≤ fim daquele dia`; se não houver, 5 |
| Estado da meta (A/B/C) | `habilitada hoje?` + `palavras hoje ≥ meta?` (ver doc 01, 4.5) |
| Sequência atual / maior | Datas distintas em `Word.localDate` (consulta com janelas ou cálculo em memória) |
| Intervalo do teste | `agora − MAX(Test.finishedAt) < 30 min` |
| Nota do teste | `score / total` |
| Pontos da semana | `SUM(DailyXp.xp)` dos últimos 7 dias |

### 5.2 Atualização de `DailyXp`

- Ao **criar palavra**: `upsert` em `DailyXp(userId, hoje)` com `xp += 10`.
- Ao **finalizar teste**: `xp += 5 × score` no dia de `finishedAt`.
- Ao **remover palavra**: `xp -= 10` no dia da palavra (decisão de produto: remover pode ou não reduzir pontos — sugerir **reduzir**, para evitar abuso de adicionar/remover).

### 5.3 Ranking semanal (SQL de referência — PostgreSQL)

```sql
WITH semana AS (
  SELECT "userId", SUM(xp) AS total
  FROM "DailyXp"
  WHERE "localDate" >= to_char(current_date - 6, 'YYYY-MM-DD')
  GROUP BY "userId"
)
SELECT u.id, u.name, u.avatar, COALESCE(s.total, 0) AS total,
       RANK() OVER (ORDER BY COALESCE(s.total,0) DESC, u."createdAt" ASC) AS rank
FROM "User" u
LEFT JOIN semana s ON s."userId" = u.id
ORDER BY rank
OFFSET :offset LIMIT :limit;
```

Observações:
- O ranking global usa a **data do servidor/UTC** para a janela de 7 dias; o dia de cada usuário (`localDate`) já foi calculado no fuso dele.
- Desempate: no protótipo o usuário vem antes; no servidor usar um critério estável (ex.: quem chegou ao total primeiro / conta mais antiga).
- Para muitos usuários: índice em `(localDate, xp)` e *cache* de 1–5 min do top/paginação.

---

## 6. Autenticação

### 6.1 Requisitos

- Cadastro e login por **e-mail + senha**; opcional **Google**.
- Sessão por **cookie `httpOnly`, `Secure`, `SameSite=Lax`**.
- Todas as rotas `/api/v1/*` (exceto cadastro, recuperação e *health*) exigem sessão.
- Cada consulta filtra por `userId` da sessão — **nunca** aceitar `userId` vindo do cliente.
- A tela `(app)` redireciona para `/login` sem sessão; `(auth)` redireciona para `/` com sessão.

### 6.2 Fluxos

**Cadastro**
1. `POST /api/v1/auth/registro` `{ email, password, name }`.
2. Valida (e-mail válido e único; senha ≥ 8 caracteres, recomendação de ≥ 1 letra e 1 número; nome ≤ 24).
3. Gera hash Argon2id, cria `User`.
4. (Opcional) envia e-mail de verificação; permitir uso imediato com aviso até verificar.
5. Cria a sessão e redireciona para `/`.

**Login**
1. Formulário chama `signIn("credentials", { email, password })` (Auth.js).
2. `authorize()` busca o usuário por e-mail, compara o hash em tempo constante; mesmo erro genérico para e-mail inexistente e senha errada ("E-mail ou senha incorretos").
3. Emite cookie de sessão (JWT assinado ou sessão em banco).
4. *Rate limit*: ex. 5 tentativas / 15 min por IP + e-mail; após isso, 429.

**Logout:** `signOut()` limpa o cookie. Botão no Perfil.

**Esqueci a senha**
1. `POST /api/v1/auth/esqueci-senha` `{ email }` → sempre responde 202 (não revelar se existe).
2. Gera token aleatório (≥ 32 bytes), guarda **apenas o hash** com validade de 30 min.
3. E-mail com link `/redefinir-senha?token=…`.
4. `POST /api/v1/auth/redefinir-senha` `{ token, password }` → troca o hash e invalida todas as sessões e tokens.

**Excluir conta:** `DELETE /api/v1/me` com confirmação de senha; apaga `User` (cascata em todas as tabelas).

### 6.3 Sessão: JWT × banco (Sugestão)

| Opção | Prós | Contras |
|---|---|---|
| **JWT em cookie** (Auth.js + Credentials exige este modo) | Sem consulta por requisição, simples | Revogação imediata é mais difícil (usar `tokenVersion` no `User`) |
| Sessão em banco | Revogação instantânea | Uma consulta por requisição |

Recomendado para começar: **JWT em cookie** com `tokenVersion` no `User` (incrementar em troca de senha/logout geral).

### 6.4 Segurança

- Hash Argon2id; nunca registrar senhas em logs.
- CSRF: Auth.js protege os formulários de login; para os endpoints próprios com cookie, exigir `Origin` igual ao do site e `SameSite=Lax`, e método `POST/PATCH/DELETE` apenas.
- Cabeçalhos: `Content-Security-Policy` (permitir `fonts.googleapis.com` só se não usar `next/font`), `X-Content-Type-Options`, `Referrer-Policy`, `Strict-Transport-Security`.
- *Rate limit* em `/auth/*`, `/lookup` e `/tests`.
- Validação com Zod em **todas** as entradas; limites de tamanho (`term` ≤ 80 caracteres, `example` ≤ 200, nome ≤ 24, busca `q` ≤ 80).
- Mensagens de erro genéricas na autenticação.
- Variáveis de ambiente (`.env.example`): `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, `GOOGLE_ID/SECRET` (opcional), `MYMEMORY_EMAIL` (opcional, aumenta a cota), `LANGUAGETOOL_API_KEY` (opcional, plano pago), `UPSTASH_*` (rate limit).

---

## 7. Regras de negócio que ficam no servidor

| Regra | Onde | Observações |
|---|---|---|
| Palavra única por usuário | Constraint `@@unique([userId, termKey])` + `409` | `termKey` = minúsculo sem acentos |
| Estado e trava da meta | `goals.service` | `PUT /goals/today` valida: sem meta hoje, ou meta batida e nova **maior** que a ativa; recusa valores < palavras de hoje |
| Anotar palavra | `words.service` | Recusa (`403 GOAL_REQUIRED`) se não houver meta habilitada hoje ou se a meta de hoje já foi batida |
| Intervalo de 30 min | `tests.service` | Compara `finishedAt` do último teste; `POST /tests` devolve `429 TEST_COOLDOWN` com `retryAfterSeconds` |
| Montagem do teste | `tests.service` | Até 5 palavras, 70 % múltipla escolha (se ≥ 3 distratores), gabarito guardado no servidor |
| Correção | `tests.service` | Compara com `fold`; devolve só `correct` e `correctAnswer` depois que a pergunta é respondida |
| Pontos | `stats.service` | Atualiza `DailyXp` nas mutações |
| Ranking | `ranking.service` | Consulta agregada com cache curto |
| Dia do usuário | `lib/dates.ts` | Todo `localDate` é calculado com o fuso salvo em `User.timezone` |

---

## 8. Estado no cliente

- **TanStack Query** com chaves: `["me"]`, `["words", {q}]`, `["words","recent"]`, `["stats","summary"]`, `["stats","daily", days]`, `["goal","today"]`, `["tests","summary"]`, `["tests","list"]`, `["tests","availability"]`, `["ranking","top"]`, `["ranking","compare"]`, `["ranking","list"]`.
- **Invalidação:** criar/remover palavra → `words`, `stats`, `goal`, `ranking`, `me`; finalizar teste → `tests`, `stats`, `ranking`, `goal`.
- **Estado local (React):** meta **selecionada** (pendente) — não vai ao servidor até clicar em "Habilitar"; aba do gráfico (7/14 dias); estado da folha e do teste em andamento.
- **Contagem regressiva do teste:** calcular no cliente com `nextAvailableAt` vindo de `GET /tests/availability` (`setInterval` de 1 s); ao zerar, refazer a consulta.
- **Animações dos gráficos:** manter os mesmos elementos do DOM entre renders (como no protótipo) para a transição CSS funcionar; no React, usar chaves estáveis por dia e atualizar apenas `style.height`/classes.

---

## 9. Do protótipo para o projeto (mapa de migração)

| No protótipo | Vira no Next.js |
|---|---|
| `Repo.page()` / `list()` | `GET /api/v1/words?q&offset&limit` → `words.service.list` |
| `Repo.add()` | `POST /api/v1/words` |
| `Repo.remove()` | `DELETE /api/v1/words/:id` |
| `Repo.meta()` + `setMeta()` (meta, `goalOn`, `goalDay`, `goalAt`, `goalLog`) | `GET/PUT /api/v1/goals/today` + tabela `GoalLog` |
| `meta.testAt` | `MAX(Test.finishedAt)` |
| `Repo.tests()` / `addTest()` | `GET /api/v1/tests`, fluxo `POST /tests` → `answers` → `finish` |
| `Repo.profile()` / `setProfile()` | `GET/PATCH /api/v1/me` |
| `Repo.ranking*()` | `GET /api/v1/ranking`, `/top`, `/compare` |
| `Repo.seed()` / `reset()` | `prisma/seed.ts` (modo demo) / `DELETE /me` |
| `mm`, `resolve`, `spell`, `sentence` | `integrations/*` + `POST /api/v1/lookup` (uma chamada só) |
| `renderOthers()` e cálculos (streak, médias, melhor dia) | `GET /api/v1/stats/summary` e `/stats/daily` |
| `dayKey()` | `localDate` calculado no servidor com o fuso do usuário |
| Funções `startQuiz`, `answer`, `finishQuiz` | Estado do componente `QuizScreen` + endpoints de teste (o sorteio e o gabarito passam a ser do servidor) |
| `localStorage` chave `keep-english-v3` | Banco de dados |

---

## 10. Plano de implementação em fases (Sugestão)

1. **Fundação:** projeto Next + TypeScript + Tailwind, fonte, tokens, tema claro/escuro, `AppShell` e navegação.
2. **Banco e autenticação:** Prisma + SQLite, `User`, Auth.js (credenciais), telas de login/registro, proteção de rotas.
3. **Palavras:** `Word`, `POST/GET/DELETE /words`, folha "Anotar palavra", listas e tela "Todas as palavras" (busca + paginação).
4. **Lookup:** integrações MyMemory/Datamuse/LanguageTool/Tatoeba no servidor, `POST /lookup`, cache e *rate limit*.
5. **Meta e evolução:** `GoalLog`, `GET/PUT /goals/today`, gráfico de 7 dias com 🔥, `stats/*`.
6. **Testes:** `Test`/`TestQuestion`, fluxo de perguntas com gabarito no servidor, intervalo de 30 min, aba Testes.
7. **Ranking:** `DailyXp`, endpoints de ranking, pódio, gráfico SVG e lista paginada.
8. **Perfil:** `GET/PATCH /me`, trocar senha, sair, excluir conta, exportar dados.
9. **Qualidade:** testes de serviços (meta, teste, ranking), Playwright nos fluxos principais, acessibilidade, revisão de contraste.
10. **Produção:** migrar para PostgreSQL, variáveis de ambiente, deploy, monitoramento.
