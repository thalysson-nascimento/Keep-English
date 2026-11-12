# Keep English — Telas, layouts e componentes

> Documento 3 de 5. Descreve **cada tela** na ordem em que os elementos aparecem, com textos exatos (microcopy), estados e comportamento.
> Medidas, cores e tipografia estão em `02-design-system.md`; regras de negócio em `01-visao-geral-e-funcionalidades.md`.

Convenções: `[ ]` = botão · `( )` = campo · `{ }` = valor dinâmico · 🔥 etc. = emojis usados como ícones.

---

## 0. Estrutura da página (casca do app)

```
┌─────────────────────────────────────┐  ← largura máx. 520 px, centralizado
│ keep english           🔥 6   📘 24 │  ← cabeçalho (aparece em todas as abas)
│                                     │
│ ┌ conteúdo da aba ativa ──────────┐ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [      + ANOTAR PALAVRA      ]      │  ← botão flutuante (só no Início)
├─────────────────────────────────────┤
│  🏠    📚    🎯    🏆    👤         │  ← navegação fixa
└─────────────────────────────────────┘
```

- Só **uma aba** fica visível por vez; trocar de aba rola a página ao topo.
- Cabeçalho: logotipo verde à esquerda; à direita 🔥 (sequência) e 📘 (total de palavras).
- Telas cheias (teste, todas as palavras) cobrem tudo, inclusive navegação e botão flutuante.

---

## 1. Início (🏠)

```
Boa noite! Vamos treinar seu inglês hoje?
┌──────────────────────────────────────┐
│ PALAVRAS ANOTADAS                    │
│ 24 no total                          │  ← número 68 px
│ ████████░░░░░░░░░░░░                 │  ← barra de progresso (20 px)
│ 3 de 5 hoje                      60% │
│ ┌────────┬───────────┬───────────┐   │
│ │   3    │     6     │    14     │   │  ← faixa escura
│ │  HOJE  │ SEQUÊNCIA │  SEMANA   │   │
│ └────────┴───────────┴───────────┘   │
└──────────────────────────────────────┘
                     [ 🎯 FAZER TESTE ]    ← azul suave, à direita
                     ⏳ Próximo teste liberado em 24:59

Meta diária
┌──────────────────────────────────────┐
│ Quantas palavras você quer anotar... │
│ [3] [5] [10] [15] [20]               │
│ [      HABILITAR META DIÁRIA     ]   │
│ Mensagem de estado                   │
└──────────────────────────────────────┘

Sua evolução
┌──────────────────────────────────────┐
│ 🔥3   🔥5   🔥2   🔥5   🔥4   🔥5  🔥0 │
│  ▂     █     ▃     █     ▆     █   ▁  │
│  D     S     T     Q     Q     S   S  │
└──────────────────────────────────────┘

Últimas palavras
┌──────────────────────────────────────┐
│ 💬 thrive                          ✕ │
│    prosperar                         │
│    “Plants thrive in sunlight.”      │
│ ──────────────────────────────────── │
│ ... (até 10)                         │
└──────────────────────────────────────┘
[       VER MAIS PALAVRAS →        ]
```

**Elementos, em ordem**

| # | Elemento | Observações |
|---|---|---|
| 1 | Saudação | 15 px cinza; muda com a hora e com a meta |
| 2 | Card laranja (hero) | Ver 4.3 do doc 01. Barra tem brilho interno |
| 3 | Linha do botão de teste | Alinhada à direita, margem superior 18 px; dica de contagem abaixo, alinhada à direita |
| 4 | `h2` "Meta diária" + cartão | Ver estados na tabela do doc 01 (4.5) |
| 5 | `h2` "Sua evolução" + cartão | Gráfico de 7 dias. **Sem legenda** (o 🔥 já comunica) |
| 6 | `h2` "Últimas palavras" + cartão | 10 itens; estado vazio com 🌱 |
| 7 | Botão "Ver mais palavras →" | Estilo soft largo; leva à aba Palavras |
| 8 | Botão flutuante | Fixo, acima da navegação |

**Textos do botão flutuante por estado**

| Estado | Texto | Habilitado |
|---|---|---|
| Sem meta habilitada hoje | 🔒 Defina a meta diária | Não |
| Meta em andamento | + Anotar palavra | Sim |
| Meta batida | 🔒 Escolha a nova meta diária | Não |
| Meta máxima (20) batida | 🎉 Meta máxima batida hoje | Não |

---

## 2. Folha "Anotar palavra"

```
░░░░░░░░░░░░ fundo escurecido ░░░░░░░░░░░░
┌──────────────────────────────────────┐
│ Nova palavra                         │
│ PALAVRA (PORTUGUÊS OU INGLÊS)        │
│ ( thrive ou prosperar              ) │
│ [ 🔎 Traduzir e buscar exemplo ]     │
│ Corrigi “thrve” para “thrive”.       │
│   Inglês → português. Pronto!        │
│   Usar “thrve” mesmo                 │
│ TRADUÇÃO                             │
│ ( prosperar )  ← bloqueado           │
│ FRASE DE EXEMPLO (EM INGLÊS)         │
│ ( Plants thrive in direct sunlight.) │  ← bloqueado
│ [           SALVAR           ]       │
│          CANCELAR                    │
└──────────────────────────────────────┘
```

| Elemento | Comportamento |
|---|---|
| Campo de palavra | Foco automático ao abrir; `autocomplete="off"`, `autocapitalize="none"` |
| Botão 🔎 | Fica desabilitado (opacidade .6, cursor de espera) durante a busca |
| Linha de status | Altura mínima 18 px para não "pular" o layout; texto cinza 13 px |
| Link "Usar … mesmo" | Azul, sublinhado, 900; só aparece quando houve correção |
| Campos Tradução e Frase | `readonly`, `tabindex=-1`, aparência acinzentada |
| Salvar | Desabilitado até haver tradução e não ser duplicada |
| Cancelar | Texto azul em caixa alta; fecha sem salvar. Tocar no fundo também fecha |

**Mensagens de status (todas)**

| Situação | Texto |
|---|---|
| Verificando ortografia | "Verificando ortografia…" |
| Buscando | "Traduzindo e buscando exemplo…" |
| Sucesso | "[Corrigi “x” para “y”. ] Inglês → português. Pronto!" |
| Sucesso (PT) | "Português → inglês. Pronto!" |
| Sem frase | "… Não encontrei frase de exemplo para esta palavra." |
| Duplicada | "Você já anotou esta palavra, então ela não será contabilizada. …" |
| Erro | "Não foi possível traduzir: {motivo}." |

---

## 3. Palavras (📚)

```
┌──────────────────────────────────────┐   ← card VERDE
│ PALAVRAS SALVAS                      │
│ 24 no total                          │
│ ┌────────┬───────────┬───────────┐   │
│ │   14   │    2,0    │     5     │   │
│ │ SEMANA │ MÉDIA/DIA │ MELHOR DIA│   │
│ └────────┴───────────┴───────────┘   │
└──────────────────────────────────────┘

Seu desempenho
┌──────────────────────────────────────┐   ← degradê azul, texto branco
│ Palavras por dia   [7 dias][14 dias] │
│ ┌──────┐ ┌──────┐ ┌──────┐           │
│ │  24  │ │ 3,4  │ │  5   │           │
│ │ TOTAL│ │MÉDIA │ │MELHOR│           │
│ └──────┘ └──────┘ └──────┘           │
│  ▂  █  ▃  █  ▆  █  ▁                 │
│  D  S  T  Q  Q  S  S                 │
└──────────────────────────────────────┘

Últimas palavras
┌ (10 itens, mesmo layout do Início) ──┐
[    VER TODAS AS PALAVRAS    ]
```

- Alternar **7 / 14 dias** recalcula quadros e barras; no modo 14 dias, o rótulo vira o **dia do mês**.
- Barras brancas translúcidas; **hoje** em branco sólido. O número acima da barra some quando é 0.
- O botão "Ver todas as palavras" fica oculto se não há palavras.

### 3.1 Todas as palavras (tela cheia)

```
┌──────────────────────────────────────┐
│ ←  Todas as palavras      24 palavras│
│ ( 🔍  Pesquisar palavra ou tradução )│
│ ┌ lista ────────────────────────────┐│
│ │ 💬 thrive                       ✕ ││
│ │ ...                               ││
│ └───────────────────────────────────┘│
│        Você chegou ao fim 🎉         │
└──────────────────────────────────────┘
```

| Comportamento | Detalhe |
|---|---|
| Página | 15 itens por requisição |
| Gatilho de carga | `scrollTop + altura ≥ altura total − 160 px` |
| Tela curta | Se a lista não preencher a tela, continua carregando |
| Busca | 250 ms de *debounce*; ignora maiúsculas e acentos; busca em inglês **e** português |
| Contador | "{n} palavra(s)" — total do filtro atual |
| Corrida de requisições | Resposta antiga é descartada (token de requisição) |
| Remover | ✕ remove a palavra e recarrega a lista a partir do início |

---

## 4. Teste (tela cheia)

### 4.1 Pergunta de múltipla escolha

```
┌──────────────────────────────────────┐
│ [🧠] Teste de vocabulário   ⭐ 2   ✕ │
│      Traduza para o inglês           │
│ ████████░░░░░░░░░░░░░░               │  ← progresso (16 px)
│              02/05                   │
│                                      │
│ Qual é a tradução em inglês de       │
│ prosperar                            │  ← 34 px
│                                      │
│ ┌────────────────────────────────┐   │
│ │ [1] borrow                     │   │
│ └────────────────────────────────┘   │
│ ┌────────────────────────────────┐   │
│ │ [2] thrive                     │   │
│ └────────────────────────────────┘   │
│ ... 4 opções                         │
│                                      │
│ [          CONFIRMAR           ]     │  ← fixo no rodapé
└──────────────────────────────────────┘
```

### 4.2 Pergunta de digitação

Mesmo cabeçalho; texto auxiliar "Escreva em inglês", palavra em português e um campo grande (placeholder "Digite em inglês", foco automático). **Enter** confirma. Depois de confirmar, o campo fica verde ou vermelho e, se errou, aparece "Resposta certa: **{palavra}**".

### 4.3 Estados da opção

| Estado | Visual |
|---|---|
| Normal | Cartão com borda cinza e marcador numérico `1–4` |
| Selecionada | Borda e texto azuis, fundo azul translúcido, sombra azul escura |
| Após confirmar — certa | Verde |
| Após confirmar — escolhida errada | Vermelha |
| Após confirmar — demais | Desabilitadas, opacidade .5 |

### 4.4 Aviso no topo

Faixa de largura total fixa no topo, sobre o cabeçalho, desliza de cima (`-120 %` → 0), texto centralizado 17/900 branco.

| Resultado | Cor | Texto |
|---|---|---|
| Acertou | Verde `#58cc02` | 🎉 Acertou! Muito bem! |
| Errou | Vermelho `#ff4b4b` | 😕 Errou. Resposta certa: <u>{palavra}</u> |

Some em 2,8 s. O botão do rodapé vira **Continuar** (verde se acertou, **vermelho** se errou) ou **Ver resultado** na última pergunta.

### 4.5 Resultado

```
┌──────────────────────────────────────┐
│ [🧠] Teste de vocabulário   ⭐ 4   ✕ │
│ ████████████████████████             │
│             Concluído                │
│                🏆                    │
│            Muito bem!                │
│              4/5                     │
│     Você acertou 80% das palavras.   │
│ ┌────────┐ ┌────────┐ ┌────────┐     │
│ │   4    │ │   1    │ │  80%   │     │
│ │ ACERTOS│ │  ERROS │ │  NOTA  │     │
│ └────────┘ └────────┘ └────────┘     │
│ [          FINALIZAR           ]     │
└──────────────────────────────────────┘
```

---

## 5. Testes (🎯)

```
┌──────────────────────────────────────┐   ← card AZUL
│ TESTES REALIZADOS                    │
│ 5 no total                           │
│ ┌────────┬───────────┬───────────┐   │
│ │  100%  │    74%    │    60%    │   │
│ │MELHOR  │  MÉDIA    │  ÚLTIMO   │   │
│ └────────┴───────────┴───────────┘   │
└──────────────────────────────────────┘
                     [ 🎯 FAZER TESTE ]
                     ⏳ Próximo teste liberado em 12:03
Evolução das notas
┌ barras (últimos 10) ─────────────────┐
│ 60%  80%  60% 100%                   │
│  ▅    ▇    ▅   █                     │
│ 04/11 06/11 07/11 08/11              │
└──────────────────────────────────────┘
Histórico
┌ 🏆 4/5 acertos            80% ───────┐
│    08/11 às 20:15                    │
└──────────────────────────────────────┘
```

Cores das barras: verde (≥ 80 %), azul (60–79 %), laranja (< 60 %). Ícones do histórico: 🏆 (≥ 80), 👏 (≥ 60), 💪 (abaixo). Sem testes: 🎯 "Nenhum teste ainda. Faça o primeiro para ver sua evolução!" (nas duas áreas).

---

## 6. Ranking (🏆)

```
🏆 Ranking semanal: 10 pontos por palavra nova e 5 por acerto no teste. ...

┌──────────────────────────────────────┐   ← cartão sem padding inferior
│              👑                      │
│    🦊       🐼(76px)      🐯         │
│  Diego Alves  Ana Souza   Gabi Nunes │
│  663 XP       682 XP      633 XP     │
│ ┌──────┐   ┌────────┐   ┌──────┐     │
│ │  2   │   │   1    │   │  3   │     │  ← blocos: 90 / 120 / 70 px
│ └──────┘   │        │   └──────┘     │
└──────────────────────────────────────┘

Sua posição
┌──────────────────────────────────────┐
│ Você está em 22º · faltam 8 XP para  │
│ passar Rafa Teles                    │  ← informação no topo do gráfico
│ Pontos acumulados na semana          │
│  (gráfico de 3 linhas, 7 pontos)     │
│  D   S   T   Q   Q   S   S           │
│   🦉         🦊          🐼          │
│  Você      Rafa       Wesley         │
│ 22º·315 XP 21º·322 XP 20º·335 XP     │
└──────────────────────────────────────┘

Classificação geral
┌ 🥇 🦊 Ana Souza ............ 682 XP ─┐
│ 🥈 ...                               │
│ 🥉 ...                               │
│  4 ...  (10 por vez)                 │
└──────────────────────────────────────┘
[        CARREGAR MAIS        ]
```

| Elemento | Detalhe |
|---|---|
| Pódio | Ordem visual 2º · 1º · 3º; alinhados pela base; nomes truncados com reticências |
| Informação | `<b>Você está em Nº</b>` + "faltam X XP…" ou "🏆 Você lidera! Vantagem de X XP sobre {nome}" |
| Gráfico | SVG de 3 linhas (azul = você, laranja = acima, vermelho = 2º acima) |
| Avatares | Borda 4 px na cor da linha; nome ("Você" ou 1º nome); "Nº · pontos XP" |
| Lista | Posição (🥇🥈🥉 ou número 17/900 cinza), avatar em quadrado, nome, rótulo "Semana", pontos em laranja |
| Linha do usuário | Fundo azul claro, raio 14 px, "(você)" após o nome |
| Carregar mais | +10 por clique; botão oculto no fim |

---

## 7. Perfil (👤)

```
┌──────────────────────────────────────┐
│               🦉                     │  ← 96 px; toque troca o avatar
│          ( Estudante )               │  ← editável, centralizado
│   Estudando desde 1 de novembro...   │
└──────────────────────────────────────┘
Resumo
┌────────────┐ ┌────────────┐
│     📘     │ │     🔥     │
│     24     │ │      6     │
│ PALAVRAS   │ │ SEQUÊNCIA  │
│  SALVAS    │ │  ATUAL     │
├────────────┤ ├────────────┤
│ 🏅 MAIOR   │ │ 🎯 TESTES  │
│ SEQUÊNCIA  │ │  FEITOS    │
├────────────┤ ├────────────┤
│ ⭐ NOTA    │ │ 🚩 META    │
│  MÉDIA     │ │  DIÁRIA    │
└────────────┘ └────────────┘
Dados
┌──────────────────────────────────────┐
│ [ CARREGAR DADOS DE EXEMPLO ]        │
│ [  APAGAR TODOS OS DADOS  ]  (verm.) │
└──────────────────────────────────────┘
```

No projeto com autenticação, esta tela ganha: e-mail da conta, alterar senha, sair (*logout*), exportar dados e excluir conta (ver doc 04).

---

## 8. Estados globais

| Situação | Comportamento |
|---|---|
| Lista sem itens | Estado vazio com emoji grande e texto cinza |
| Carregando (futuro, com API) | *Skeleton* nos cartões; botões com `aria-busy` e rotação de "⏳" |
| Erro de rede (futuro) | Toast vermelho + botão "Tentar de novo" no local da falha |
| Toast | Topo, azul, 1,8 s |
| Safe areas | Respeitadas em topo, rodapé, folha e telas cheias |
| Rolagem do corpo | Bloqueada (`overflow: hidden`) enquanto uma tela cheia está aberta |

---

## 9. Mapa de componentes sugerido para o Next.js

| Componente | Usado em |
|---|---|
| `AppShell` (cabeçalho, navegação, safe areas) | Todas |
| `BottomNav` | Todas |
| `HeroCard` (variantes `orange`, `green`, `blue`) | Início, Palavras, Testes |
| `ProgressBar` (variantes card e teste) | Início, Teste |
| `StatsStrip` (3 estatísticas) | Hero |
| `GoalCard` (chips + botão + mensagem) | Início |
| `EvolutionChart` (7 dias com 🔥) | Início |
| `PerformanceCard` + `BarChart` | Palavras |
| `ScoreChart` | Testes |
| `WordRow`, `WordList`, `EmptyState` | Início, Palavras, Todas, Histórico |
| `AddWordSheet` | Início |
| `QuizScreen` (`Question`, `OptionCard`, `Banner`, `Result`) | Teste |
| `AllWordsScreen` (busca + rolagem infinita) | Palavras |
| `Podium`, `RankChart` (SVG), `RankRow`, `AvatarRing` | Ranking |
| `ProfileCard`, `StatTile` | Perfil |
| `Toast`, `Sheet`, `Overlay` | Global |
| `Button` (`primary`, `soft`, `danger`, `ghost`), `Chip`, `Card`, `TextField` | Global |
