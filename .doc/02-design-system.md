# Keep English — Design System

> Documento 2 de 5. Todos os valores abaixo foram extraídos do CSS real do protótipo (`keep-english-api.html`).
> Referência visual: Duolingo — cores vivas, bordas grossas, sombras "duras" por baixo dos elementos, cantos bem arredondados, fonte arredondada e pesada.

---

## 1. Princípios visuais

1. **Vivo e tátil:** quase todo elemento clicável tem uma **sombra sólida inferior** (sem desfoque) que dá efeito de botão físico; ao pressionar, o elemento "afunda" (desce e a sombra encolhe).
2. **Bordas de 2 px** em cartões, campos e botões secundários.
3. **Cantos muito arredondados** (14–26 px; barras e trilhos totalmente redondos).
4. **Fonte pesada** (700–900) e arredondada em praticamente todo o app.
5. **Mobile first:** conteúdo centralizado com largura máxima de **520 px**; no desktop só há margem lateral.
6. **Emojis** como ícones (🔥 📘 💬 🎯 🏆 👤 🏠 📚 ⭐ 🧠 👑 🥇🥈🥉 e avatares).
7. **Tema claro e escuro** automáticos, mantendo as cores de marca iguais nos dois.

---

## 2. Cores

### 2.1 Tokens de tema (variáveis CSS em `:root`)

| Token | Claro | Escuro | Uso |
|---|---|---|---|
| `--bg` | `#ffffff` | `#131f24` | Fundo da página e dos campos de texto |
| `--surface` | `#ffffff` | `#1f2c33` | Cartões, barra de navegação, folha, avatares |
| `--text` | `#4b4b4b` | `#f1f7fb` | Texto principal |
| `--muted` | `#8a8a8a` | `#8da0aa` | Texto secundário, rótulos, legendas |
| `--line` | `#e5e5e5` | `#37464f` | Bordas, divisórias, sombra dos cartões/chips |
| `--track` | `#e5e5e5` | `#37464f` | Trilhos de barra, fundo de botão e campo desabilitados |
| `--bar` | `#cde9b0` | `#3b5a2a` | Barra do gráfico "abaixo da meta" |

O tema escuro é aplicado por `@media (prefers-color-scheme: dark)` e pode ser forçado para claro com `data-theme="light"` no elemento raiz. Declarar `color-scheme: dark` no modo escuro.

### 2.2 Cores de marca

| Token | Hex | Papel |
|---|---|---|
| `--green` | `#58cc02` | Cor principal: logotipo, botão primário, progresso do teste, barra "meta batida", card "Palavras salvas" |
| `--green-d` | `#46a302` | Sombra do botão/card verde e faixa de estatísticas do card verde |
| `--blue` | `#1cb0f6` | Destaque/seleção: foco de campos, chip selecionado, contorno de hoje, toast, card "Testes", linha do usuário no ranking |
| `--blue-d` | `#1899d6` | Sombra de elementos azuis e faixa do card azul |
| `--orange` | `#ff9600` | Card principal, 🔥 sequência, pontos (XP), linha do 1º concorrente |

### 2.3 Cores fixas (não mudam com o tema)

**Card principal (laranja)**

| Elemento | Hex |
|---|---|
| Fundo do card | `#ff9600` |
| Sombra inferior (6 px) | `#d97f00` |
| Faixa de estatísticas | `#e08600` |
| Brilho da barra de progresso | `rgba(255,150,0,.30)` |
| Trilho da barra | `rgba(0,0,0,.20)` |
| Preenchimento da barra | `#ffffff` |
| Divisórias entre estatísticas | `rgba(255,255,255,.20)` |

**Botão secundário "soft" (azul suave)**

| Estado | Fundo | Borda | Sombra (4 px) | Texto |
|---|---|---|---|---|
| Claro | `#ddf4ff` | `#84d8ff` | `#84d8ff` | `#1899d6` |
| Escuro | `rgba(28,176,246,.15)` | `#1899d6` | `#1899d6` | `#84d8ff` |

**Card "Seu desempenho" (aba Palavras)**

| Elemento | Valor |
|---|---|
| Fundo | degradê `linear-gradient(165deg, #79cffc 0%, #2cb3f7 100%)` |
| Sombra inferior (5 px) | `#1899d6` |
| Texto | `#ffffff` |
| Quadros internos | `rgba(255,255,255,.20)` |
| Botões 7/14 dias (inativo / ativo) | fundo `rgba(255,255,255,.25)` texto branco / fundo `#fff` texto `#1899d6` |
| Barras | `rgba(255,255,255,.50)`; barra de hoje `#ffffff` |

**Feedback do teste**

| Estado | Fundo | Borda | Sombra | Texto |
|---|---|---|---|---|
| Opção selecionada | `rgba(28,176,246,.12)` | `--blue` | `--blue-d` | `--blue` |
| Acerto | `rgba(88,204,2,.15)` | `#58cc02` | `#58a700` | `#58a700` |
| Erro | `rgba(255,75,75,.13)` | `#ff4b4b` | `#ea2b2b` | `#ea2b2b` |
| Aviso (topo) acerto | `#58cc02` fundo, texto branco | | | |
| Aviso (topo) erro | `#ff4b4b` fundo, texto branco | | | |
| Botão "Continuar" após erro | `#ff4b4b`, sombra `#ea2b2b` | | | |

**Pódio e medalhas**

| Posição | Fundo do bloco | Sombra interna (6 px, inferior) | Altura do bloco |
|---|---|---|---|
| 1º ouro | `#ffc800` | `#e5a500` | 120 px |
| 2º prata | `#b8c0c8` | `#9aa3ab` | 90 px |
| 3º bronze | `#d98d4f` | `#b8733b` | 70 px |

**Linhas do gráfico de ranking**

| Linha | Hex |
|---|---|
| Você | `#1cb0f6` |
| Concorrente imediatamente acima | `#ff9600` |
| Segundo acima | `#ff4b4b` |

**Notas dos testes (gráfico e histórico)**

| Faixa | Cor |
|---|---|
| ≥ 80 % | `--green` |
| 60–79 % | `--blue` |
| < 60 % | `--orange` |

**Overlays**

| Elemento | Valor |
|---|---|
| Fundo escurecido da folha | `rgba(0,0,0,.50)` |
| Ícone circular (💬, avatar em lista) | `rgba(28,176,246,.15)` |
| Realce da linha do usuário no ranking | `rgba(28,176,246,.12)` |

### 2.4 Variações de card "hero"

| Variante | Fundo | Sombra | Faixa de estatísticas | Onde |
|---|---|---|---|---|
| Laranja (padrão) | `#ff9600` | `#d97f00` | `#e08600` | Início |
| Verde | `--green` | `--green-d` | `--green-d` | Palavras |
| Azul | `--blue` | `--blue-d` | `--blue-d` | Testes |

---

## 3. Tipografia

### 3.1 Família

- **Nunito** (Google Fonts), pesos carregados: **600, 700, 800, 900**.
- *Fallback:* `"Trebuchet MS", system-ui, sans-serif`.
- Peso padrão do `body`: **700**. Campos, botões e rótulos herdam a fonte (`font: inherit`).
- Carregamento: `<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&display=swap">` (no Next.js usar `next/font/google`).

### 3.2 Escala tipográfica (tamanho / peso)

| Papel | Tamanho | Peso | Extras | Cor |
|---|---|---|---|---|
| Número grande dos cards | 68 px (`line-height: 1`) | 900 | — | branco |
| Nota do resultado do teste | 56 px | 900 | — | `--green` |
| Palavra do teste (pergunta) | 34 px | 900 | `line-height: 1.1` | `--text` |
| Título do resultado (h3) | 26 px | 900 | — | `--text` |
| Logotipo "keep english" | 26 px | 900 | `letter-spacing: -.5px` | `--green` |
| Título de seção (h2) | 22 px | 900 | — | `--text` |
| Título da folha (h3) | 22 px | 900 | — | `--text` |
| Nome do perfil | 22 px | 900 | centralizado | `--text` |
| Valor das estatísticas (faixa) | 22 px | 900 | — | branco |
| Valor dos quadros do resultado | 22 px | 900 | — | `--text` |
| Valor dos quadros "pstats" | 22 px | 900 | — | branco |
| Valor dos quadros do resumo (perfil) | 24 px | 900 | — | `--text` |
| Número no bloco do pódio | 28 px | 900 | — | branco |
| Texto de opção do teste | 18 px | 800 | — | `--text` |
| Palavra em lista (`.wt b`) | 18 px | 900 | — | `--text` |
| Texto do botão primário | 17 px | 900 | `uppercase`, `letter-spacing: .8px` | branco |
| Pílulas do topo | 17 px | 900 | — | laranja / azul |
| Campo de texto | 17 px | 700 | — | `--text` |
| Campo de digitação do teste | 20 px | 700 | — | `--text` |
| Informação do ranking ("Você está em…") | 16 px | 800 | `line-height: 1.35` | `--text` |
| Saudação, mensagem de progresso | 15 px | 700 / 800 | — | `--muted` / branco |
| Botão "soft" | 15 px | 900 | `uppercase`, `letter-spacing: .6px` | `#1899d6` |
| Tradução em lista (`.wt span`) | 14 px | 700 | — | `--muted` |
| Nome no pódio e avatares do ranking | 14 px | 900 | truncado com reticências | `--text` |
| Rótulo do card (`PALAVRAS ANOTADAS`…) | 13 px | 900 | `letter-spacing: 1.2px`, `opacity: .9` | branco |
| Rótulos de campo (`label`) | 13 px | 900 | `uppercase`, `letter-spacing: .8px` | `--muted` |
| Exemplo em lista (`.wt i`) | 13 px | 700 | itálico desligado | `--muted` |
| Status, legendas, dicas | 13 px | 700 | — | `--muted` |
| Rótulos da faixa de estatísticas | 12 px | 800 | `uppercase`, `letter-spacing: .5px`, `opacity: .85` | branco |
| Rótulos dos quadros do resumo | 12 px | 800 | `uppercase`, `letter-spacing: .4px` | `--muted` |
| Rótulos dos quadros "pstats" | 11 px | 800 | `uppercase`, `letter-spacing: .4px` | branco |
| Valores/dias nas barras do gráfico de desempenho | 11 px | 800 | — | branco |
| Dia da semana no gráfico "Sua evolução" | 12 px | 800 | — | `--muted` |
| Quantidade ao lado do 🔥 | 13 px | 900 | — | `--text` |
| Emoji 🔥 do gráfico | 20 px | 400 | — | — |
| Emoji de avatar (perfil) | 52 px | — | — | — |
| Emoji de avatar (pódio 1º / demais) | 42 px / 32 px | — | — | — |
| Emoji de avatar (ranking, 3 avatares) | 28 px | — | — | — |
| Ícone da lista (`.ico`) | 22 px | — | — | — |
| Ícones da barra de navegação | 24 px (26 px nas 4 abas originais; o ranking padronizou 24) | — | — | — |
| Troféu do resultado | 80 px | — | — | — |
| Emoji de estado vazio | 46 px | — | — | — |

> Letras maiúsculas por CSS (`text-transform: uppercase`), nunca digitadas em maiúsculo no conteúdo.

### 3.3 Sugestão de tokens para o Next.js (Tailwind)

```ts
fontSize: {
  hero: ["68px", { lineHeight: "1" }],
  score: ["56px", { lineHeight: "1" }],
  quizWord: ["34px", { lineHeight: "1.1" }],
  h1: ["26px", {}],   // logo / título do resultado
  h2: ["22px", {}],
  stat: ["22px", {}],
  body: ["17px", {}],
  option: ["18px", {}],
  base: ["15px", {}],
  sm: ["14px", {}],
  xs: ["13px", {}],
  xxs: ["12px", {}],
  micro: ["11px", {}],
},
fontWeight: { medium: "700", semibold: "800", black: "900" },
letterSpacing: { label: "1.2px", button: ".8px", soft: ".6px", stat: ".5px", pill: ".4px", logo: "-.5px" },
```

---

## 4. Espaçamento e layout

### 4.1 Contêiner

| Item | Valor |
|---|---|
| Largura máxima do conteúdo | **520 px**, centralizado (`margin: 0 auto`) |
| Padding do contêiner | **16 px** nas laterais e em cima |
| Padding inferior | `180px + safe-area-bottom` (espaço para botão flutuante + navegação) |
| Safe areas | `env(safe-area-inset-top/bottom)` aplicadas na raiz, na barra de navegação, na folha, no aviso e nas telas cheias |
| Viewport | `width=device-width, initial-scale=1, viewport-fit=cover` |

### 4.2 Escala de espaçamentos usada

`2 · 4 · 5 · 6 · 8 · 10 · 12 · 14 · 16 · 18 · 20 · 22 · 24 · 28 · 34 px`

Valores principais por contexto:

| Contexto | Espaçamento |
|---|---|
| Entre o cabeçalho (logo/pílulas) e o conteúdo | 20 px |
| Entre pílulas | 14 px (gap) |
| Título de seção `h2` | margem **28 px** em cima · **12 px** embaixo |
| Saudação | 14 px embaixo |
| Padding interno do card hero | **22 px** (topo/laterais), 0 embaixo (a faixa de estatísticas encosta no fundo) |
| Número grande ↔ barra | margem `6px 0 20px` |
| Mensagem de progresso | margem `10px 0 18px` |
| Faixa de estatísticas | padding vertical 14 px; sangra as laterais (`margin: 0 -22px`) |
| Padding do cartão comum | **18 px** (mini-cartões do perfil: 14 px) |
| Linha de lista (`.word`) | padding vertical 14 px · gap 12 px · divisória de 2 px |
| Entre botões de meta (chips) | gap 8 px · topo 10 px |
| Padding do chip | `8px 16px` |
| Botão primário | padding 15 px |
| Botão "soft" | padding `12px 20px`; margem superior da linha 18 px |
| Botão "Habilitar meta" | margem superior 16 px |
| Botão "soft" largo (ver mais / carregar mais) | largura 100 %, margem superior 14 px |
| Gráfico "Sua evolução" | altura **220 px** · gap entre colunas 10 px · padding superior 4 px |
| Gráfico de desempenho / notas | altura **160 px** · gap 5 px |
| Cartões do resumo (perfil) | grade de 2 colunas · gap 12 px |
| Botões 7/14 dias | padding `6px 11px` · gap 6 px |
| Quadros "pstats" | grade de 3 colunas · gap 8 px · margem `14px 0 16px` · padding `10px 4px` |
| Campo de texto | padding `13px 14px` |
| Rótulo (`label`) | margem `12px 0 6px` |
| Folha "Anotar palavra" | padding `22px 18px (+safe)` |
| Botão flutuante | `bottom: 76px + safe`, padding lateral 16 px, mesma largura máxima |

### 4.3 Camadas (z-index)

| Elemento | z-index |
|---|---|
| Barra de navegação / botão flutuante | padrão (ordem do DOM) |
| Folha "Anotar palavra" (fundo) | 20 |
| Toast | 30 |
| Telas cheias (teste, todas as palavras) | 40 |
| Aviso de acerto/erro (topo do teste) | 50 |

---

## 5. Raios, bordas e sombras

### 5.1 Raios

| Elemento | Raio |
|---|---|
| Barras, trilhos, preenchimentos | 99 px (pílula) |
| Card hero | 24 px |
| Folha (cantos superiores) | 26 px |
| Cartão comum | 20 px |
| Botão primário, "soft", opções do teste | 16 px |
| Chip, campos, ícone da lista (`.ico`), toast, navegação ativa, quadros do resultado | 14 px |
| Bloco do pódio (cantos superiores) | 14 px |
| Quadros "pstats" | 14 px |
| Barras do gráfico "Sua evolução" | `10px 10px 6px 6px` |
| Barras do desempenho / notas | `8px 8px 4px 4px` |
| Botões 7/14 dias | 11 px |
| Marcador do número na opção | 9 px |
| Avatares | 50 % (círculo) |

### 5.2 Bordas

- Cartões, chips, campos, opções, quadros: **2 px** `--line`.
- Avatar do perfil: **3 px** `--blue`. Avatar do pódio: 3 px (`--line`, ouro no 1º, azul se for o usuário). Avatares do gráfico de ranking: **4 px** colorida.
- Barra de navegação: borda superior 2 px `--line`.
- Item de navegação ativo: borda 2 px `--blue`, fundo `rgba(28,176,246,.12)`.
- Campo em foco: borda `--blue`.

### 5.3 Sombras "duras" (sem desfoque)

| Elemento | Sombra | Ao pressionar |
|---|---|---|
| Cartão | `0 4px 0 --line` | — |
| Chip | `0 3px 0 --line` (selecionado: `0 3px 0 --blue-d`) | — |
| Botão primário | `0 5px 0 --green-d` | `translateY(4px)` + `0 1px 0 --green-d` |
| Botão primário desabilitado | `0 5px 0 --line` | — |
| Botão "soft" | `0 4px 0 #84d8ff` | `translateY(3px)` + `0 1px 0` |
| Card hero | `0 6px 0` (cor escura da variante) | — |
| Card "desempenho" | `0 5px 0 #1899d6` | — |
| Toast | `0 4px 0 --blue-d` | — |
| Logo do teste | `0 3px 0 --green-d` | — |
| Avatar do perfil | `0 4px 0 --blue-d` | — |
| Opção do teste | `0 4px 0 --line` (estados: azul / verde / vermelho) | — |
| Barra "meta batida" | `0 3px 0 --green-d` | — |
| Quadros do resultado | `0 4px 0 --line` | — |
| Avatar do usuário no pódio | `0 0 0 3px rgba(28,176,246,.3)` (anel) | — |

---

## 6. Componentes

### 6.1 Botão primário (`.btn`)

Largura 100 %, fundo `--green`, texto branco 17/900 em caixa alta, raio 16 px, sombra `0 5px 0 --green-d`.
Estados: *pressionado* (afunda 4 px) · *desabilitado* (fundo `--track`, texto `--muted`, sombra `--line`, cursor `not-allowed`) · variante **vermelha** (`#ff4b4b`/`#ea2b2b`).

### 6.2 Botão "soft" (`.soft`)

Azul suave (ver 2.3), 15/900 caixa alta, raio 16 px, padding `12px 20px`. Variante `.wide`: largura total, margem superior 14 px. Desabilitado: opacidade .5.

### 6.3 Chip de meta (`.chip`)

Fundo `--surface`, borda 2 px `--line`, sombra `0 3px 0 --line`, raio 14 px, padding `8px 16px`, texto 900.
Estados: **selecionado** (borda/texto `--blue`, fundo `rgba(28,176,246,.1)`, sombra azul escura) · **desabilitado** (opacidade .4) · **batido** (`.done`, opacidade .6).

### 6.4 Cartão (`.card`)

Fundo `--surface`, borda 2 px `--line`, raio 20 px, sombra `0 4px 0 --line`, padding 18 px. Variantes: `.perf` (degradê azul, sem borda), `.mini` (resumo do perfil, centralizado).

### 6.5 Card hero (`.hero`)

Raio 24 px, `overflow: hidden`, texto branco. Estrutura: rótulo → número grande + sufixo → (barra + mensagem) → faixa de 3 estatísticas. Cada estatística: valor 22/900 + rótulo 12/800; divisória vertical `rgba(255,255,255,.2)` entre elas (sem a última).

### 6.6 Barra de progresso (`.track` / `.fill`)

Altura 20 px, pílula. Preenchimento branco com **brilho** (faixa interna de 5 px a 4 px do topo, 10 px de recuo lateral, cor `rgba(255,150,0,.3)`). Transição de largura `.7s cubic-bezier(.3,1.3,.5,1)`.
No teste: altura **16 px**, trilho `--track`, preenchimento `--green`, transição `.4s`.

### 6.7 Item de lista de palavra (`.word`)

`[ícone 44×44] [palavra 18/900 + tradução 14 + exemplo 13 itálico-off entre “ ”] [✕]`
Ícone: quadrado arredondado 14 px, fundo `rgba(28,176,246,.15)`, emoji 22 px. ✕ com 20 px, cor `--muted`. Última linha sem divisória.

### 6.8 Campo de texto (`input`)

100 % de largura, 17/700, fundo `--bg`, borda 2 px `--line`, raio 14 px, foco com borda azul. `readonly`: opacidade .75, fundo `--track`, cursor `not-allowed`. Variantes: `.qin` (digitação do teste: 20 px, padding 16 px; estados verde/vermelho) · `.pname` (nome do perfil: 22/900, centralizado, borda transparente, fundo transparente).

### 6.9 Folha inferior (`.sheet`)

Ancorada embaixo, largura até 520 px, raio superior 26 px. Entra com animação `translateY(60px → 0)` + fade em `.25s ease`. Fundo escurecido `rgba(0,0,0,.5)`; tocar fora fecha.

### 6.10 Toast

Fixo no topo (14 px + safe), centralizado, azul, texto branco 900, padding `12px 20px`, raio 14 px. Desliza de `-90px` para 0 em `.3s`; some após **1,8 s**.

### 6.11 Navegação inferior

Fixa, fundo `--surface`, borda superior 2 px, padding `8px 10px (+safe)`, gap 6 px. 5 botões `flex: 1`, largura máxima 110 px, ícone 24 px, padding vertical 6 px, raio 14 px, borda transparente (ativo: azul).

### 6.12 Pílulas do topo

Linha com gap 14 px; cada pílula: emoji + número 17/900, gap 5 px (🔥 laranja, 📘 azul).

### 6.13 Avatares

| Onde | Tamanho | Borda |
|---|---|---|
| Perfil | 96 px | 3 px azul + sombra |
| Pódio 1º | 76 px | 3 px ouro (`#ffc800`) |
| Pódio 2º/3º | 60 px | 3 px `--line` |
| Ranking (3 avatares) | 56 px | 4 px na cor da linha |
| Logo do teste | 44 px (quadrado 14 px) | — |
| Lista (`.ico`) | 44 px (quadrado 14 px) | — |

### 6.14 Estado vazio (`.empty`)

Centralizado, padding `26px 10px`, texto `--muted`, emoji de 46 px acima.

---

## 7. Gráficos

### 7.1 "Sua evolução" (HTML/CSS)

Colunas com `flex: 1`. Ordem vertical: `.fl` (🔥 + número, margem inferior 12 px) → `.bw` (área da barra, `flex: 1`) → inicial do dia. Barra: largura 100 %, máx. 38 px, altura mínima 8 px. Transições: `height .6s cubic-bezier(.3,1.3,.5,1), background .4s, box-shadow .4s`; 🔥 `filter .4s, opacity .4s`. Estado apagado: `grayscale(1)` + opacidade .35.

### 7.2 Desempenho e notas (HTML/CSS)

Colunas `.pc` com valor (11 px, altura mínima 13 px) → área `.bw` → rótulo. Barra com altura mínima 5 px. Gráfico de notas usa as cores por faixa (2.3).

### 7.3 Posição no ranking (SVG)

`viewBox="0 0 340 170"`, largura 100 %, altura automática.

| Parâmetro | Valor |
|---|---|
| Margens internas | esquerda 10 · direita 12 · topo 10 · base 24 |
| Grade horizontal | 3 linhas (0 %, 50 %, 100 % do máximo), tracejada `4 5`, 1,5 px, cor `--line` |
| Eixo X | 7 pontos igualmente espaçados; letra do dia a `y = 164`, 11 px/800, `--muted`, centralizada |
| Eixo Y | 0 até o maior valor acumulado (mínimo 10) |
| Linha do usuário | 4,5 px; demais 3,5 px; pontas e cantos arredondados |
| Pontos | raio 3 px; último ponto raio 5,5 px com contorno de 2 px na cor da superfície |
| Ordem de desenho | concorrentes primeiro, **usuário por cima** |

---

## 8. Animações e transições

| Elemento | Propriedade | Duração / curva |
|---|---|---|
| Barra de progresso do card | `width` | `.7s cubic-bezier(.3,1.3,.5,1)` |
| Barras do gráfico de evolução | `height` | `.6s cubic-bezier(.3,1.3,.5,1)` |
| Barras do gráfico de evolução | `background`, `box-shadow` | `.4s` |
| 🔥 | `filter`, `opacity` | `.4s` |
| Barra de progresso do teste | `width` | `.4s` |
| Folha inferior | `transform`, `opacity` | `.25s ease` (`@keyframes up`) |
| Toast | `transform` | `.3s` |
| Aviso de acerto/erro | `transform` | `.3s` |
| Botões pressionados | `transform` / `box-shadow` | imediato (`:active`) |

A curva `cubic-bezier(.3,1.3,.5,1)` produz um leve "quique" (overshoot) e é a marca do movimento do app.

---

## 9. Acessibilidade

- Botões só com ícone têm `aria-label` (✕ remover/fechar, ← voltar) ou `title` (abas da navegação) — manter no Next.js e preferir `aria-label` nas abas.
- Gráfico SVG do ranking com `role="img"` e `aria-label="Pontos acumulados na semana"`.
- Estados de erro/acerto **não dependem só de cor**: texto no aviso, ícone/ênfase e cor.
- Alvos de toque grandes (botões ≥ 44 px de altura; ícones de navegação 24 px dentro de botões com padding).
- Foco visível: campo com borda azul. Ao implementar no Next.js, adicionar `:focus-visible` com anel azul em botões.
- Contraste: texto branco sobre `#ff9600`, `#58cc02` e `#2cb3f7` é o do estilo Duolingo (contraste baixo para texto pequeno); preferir 13 px ou mais, peso 800+ (já é o padrão). Rever contraste na versão final.

---

## 10. Variáveis CSS prontas para copiar

```css
:root {
  --bg:#ffffff; --surface:#ffffff; --text:#4b4b4b; --muted:#8a8a8a;
  --line:#e5e5e5; --track:#e5e5e5; --bar:#cde9b0;
  --green:#58cc02; --green-d:#46a302;
  --blue:#1cb0f6;  --blue-d:#1899d6;
  --orange:#ff9600;
  --safe-top: env(safe-area-inset-top, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg:#131f24; --surface:#1f2c33; --text:#f1f7fb; --muted:#8da0aa;
    --line:#37464f; --track:#37464f; --bar:#3b5a2a;
    color-scheme: dark;
  }
}
body { font-family:"Nunito","Trebuchet MS",system-ui,sans-serif; font-weight:700; background:var(--bg); color:var(--text); }
```
