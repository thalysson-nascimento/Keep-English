# Keep English — Visão geral e funcionalidades

> Documento 1 de 5. Base: protótipo `keep-english-api.html` (arquivo único, dados em `localStorage`, chave `keep-english-v3`).
> Este é o documento de **produto**: o que o app é, o que faz e quais são as regras de negócio.
> Os outros quatro cobrem: 02 Design system · 03 Telas e componentes · 04 Arquitetura, dados e autenticação · 05 Endpoints e integrações.

---

## 1. O que é o app

**Keep English** é um anotador de vocabulário de inglês para treino diário, com visual gamificado inspirado no Duolingo (cores vivas, botões "gordinhos" com sombra inferior, fonte arredondada, fogo de sequência).

A pessoa digita uma palavra **em português ou em inglês**. O app:

1. corrige a ortografia (se necessário);
2. traduz para o outro idioma;
3. busca uma **frase de exemplo em inglês**;
4. salva a palavra na lista pessoal.

Depois a pessoa treina com **testes** das palavras que anotou, cumpre uma **meta diária**, acompanha sua **evolução em gráficos** e se compara com outros usuários num **ranking semanal**.

- **Plataforma:** web responsiva, pensada primeiro para celular (largura de conteúdo máxima de 520 px, centralizada no desktop).
- **Idioma da interface:** português do Brasil.
- **Idioma estudado:** inglês.
- **Tema:** claro e escuro automáticos (`prefers-color-scheme`).

### Estado atual × estado alvo

| Aspecto | Protótipo atual | Projeto alvo (Next.js) |
|---|---|---|
| Armazenamento | `localStorage` (camada `Repo`) | Banco de dados via API (Prisma) |
| Usuário | Único, local, sem login | Várias contas com autenticação |
| Ranking | 30 jogadores de exemplo fixos | Usuários reais |
| Tradução / ortografia / frase | APIs públicas chamadas direto do navegador | Chamadas pelo servidor (Route Handlers), com cache |
| Regras (meta, teste a cada 30 min) | No navegador (burláveis) | Validadas no servidor |
| Dados iniciais | "Seed" de 6 dias + 4 testes | Conta nova começa vazia (seed só em modo demo) |

---

## 2. Navegação

Barra inferior fixa com **5 abas** (apenas ícone, sem texto):

| # | Ícone | Aba | Conteúdo |
|---|---|---|---|
| 1 | 🏠 | Início | Painel do dia: card laranja, meta, evolução, últimas palavras |
| 2 | 📚 | Palavras | Total salvo, gráfico de desempenho, últimas palavras, "ver todas" |
| 3 | 🎯 | Testes | Evolução das notas e histórico dos testes |
| 4 | 🏆 | Ranking | Pódio, gráfico de posição, classificação geral |
| 5 | 👤 | Perfil | Avatar, nome, resumo e dados |

**Telas sobrepostas** (cobrem a tela inteira, não são abas):

- **Anotar palavra** — folha inferior (*bottom sheet*) aberta pelo botão flutuante, só na aba Início.
- **Teste de vocabulário** — tela cheia aberta por "Fazer teste" (Início ou Testes).
- **Todas as palavras** — tela cheia com busca e rolagem infinita, aberta por "Ver todas as palavras" (aba Palavras).

O botão flutuante **"+ Anotar palavra"** só aparece na aba Início.

---

## 3. Conceitos e regras gerais

### 3.1 "Dia"

- O dia é o **dia do calendário no fuso horário local** do usuário (meia-noite a meia-noite).
- Chave de dia no protótipo: `"ano-mês-dia"` sem zero à esquerda (ex.: `2026-11-8`).
- No projeto alvo: guardar o fuso (`timezone`, padrão `America/Sao_Paulo`) e calcular os limites do dia **no servidor**.

### 3.2 Palavra

| Campo | Regra |
|---|---|
| `word` | Sempre **em inglês**. Se a pessoa digitou em português, vale a tradução em inglês (em minúsculas). |
| `meaning` | Sempre **em português**. |
| `example` | Frase de exemplo em inglês. Opcional (pode ficar vazia). |
| Unicidade | **Não pode repetir** (comparação por `word` em minúsculas, sem diferenciar maiúsculas). |
| `createdAt` | Momento em que foi salva. Define em qual dia ela conta. |

Palavra repetida **não é salva nem contabilizada** (nem no total, nem na meta, nem no gráfico, nem nos pontos).

### 3.3 Sequência (🔥 streak)

- **Sequência atual:** número de dias consecutivos com **pelo menos 1 palavra** salva, terminando hoje. Se hoje ainda não tem palavra, a contagem começa **por ontem** (a sequência não "quebra" até o dia acabar).
- **Maior sequência:** maior série de dias consecutivos com pelo menos 1 palavra em todo o histórico.

### 3.4 Pontos (XP) do ranking

```
pontos do dia = 10 × palavras novas do dia  +  5 × acertos em testes do dia
```

O ranking é **semanal**, usando os **últimos 7 dias incluindo hoje**.

---

## 4. Funcionalidades — Aba Início

### 4.1 Cabeçalho

- Logotipo de texto "keep english" em verde.
- À direita, duas pílulas: **🔥 sequência atual** (laranja) e **📘 total de palavras** (azul).

### 4.2 Saudação

Texto cinza acima do card:

- Antes das 12h: "Bom dia!" · 12h–17h59: "Boa tarde!" · depois: "Boa noite!"
- Complemento: se a meta de hoje foi batida → "Meta de hoje concluída 🎉"; senão → "Vamos treinar seu inglês hoje?"

### 4.3 Card principal laranja

Conteúdo, de cima para baixo:

1. Rótulo `PALAVRAS ANOTADAS`.
2. Número grande com o **total de palavras** + texto "no total".
3. **Barra de progresso do dia** (branca sobre trilho escuro). Preenchimento = `palavras de hoje ÷ meta ativa`, limitado a 100 %. Se há ao menos 1 palavra hoje, o preenchimento mínimo visível é 6 %. Animação de largura de 0,7 s.
4. Linha com "`X de N hoje`" à esquerda e a porcentagem à direita.
5. Faixa inferior (mais escura) com 3 estatísticas: **Hoje**, **Sequência**, **Semana** (palavras dos últimos 7 dias).

> O card usa a **meta ativa**, não a meta apenas selecionada nos botões (ver 4.5).

### 4.4 Botão "🎯 Fazer teste"

- Azul suave, alinhado à direita, logo abaixo do card laranja.
- Desabilitado se não há palavras **ou** se o último teste terminou há menos de 30 minutos.
- Quando bloqueado por tempo, aparece abaixo: "⏳ Próximo teste liberado em MM:SS" (atualiza a cada segundo).
- Sem palavras: "Anote palavras para liberar o teste".

### 4.5 Meta diária

Card "Meta diária" com texto "Quantas palavras você quer anotar por dia?", botões **3 · 5 · 10 · 15 · 20**, botão grande **"Habilitar meta diária"** e uma linha de mensagem de estado.

**Conceitos**

- **Meta ativa:** valor que vale para o card, o gráfico e a trava (padrão inicial: 5).
- **Meta selecionada (pendente):** o que a pessoa tocou nos botões, ainda não confirmado. Só vira ativa ao clicar em "Habilitar meta diária".
- **Meta habilitada hoje:** a pessoa confirmou uma meta **neste dia**. Vale só para o dia; no dia seguinte volta ao estado A.

**Máquina de estados (por dia)**

| Estado | Condição | Botões 3/5/10/15/20 | Botão "Habilitar" | "+ Anotar palavra" | Mensagem |
|---|---|---|---|---|---|
| **A — Sem meta hoje** | Nenhuma meta habilitada hoje | Livres, exceto valores **menores** que as palavras já feitas hoje (desabilitados) | Ativo se a seleção for válida | 🔒 "Defina a meta diária" (bloqueado) | "Escolha uma meta e clique em habilitar para liberar o botão de anotar palavras." |
| **B — Em andamento** | Habilitada hoje e `hoje < meta` | **Todos desabilitados** | "Meta ativa ✓" (cinza) | "+ Anotar palavra" (liberado) | "Meta de N ativa. Faltam X palavra(s) para liberar outras metas." |
| **C — Meta batida** | Habilitada hoje e `hoje ≥ meta` | Valores menores que as palavras de hoje desabilitados; o botão da meta batida fica **opaco e selecionado**; maiores liberados | Cinza enquanto a seleção for igual à meta batida; ativo ao escolher uma **maior** | 🔒 "Escolha a nova meta diária" (bloqueado) | "Meta concluída! 🎉 Escolha uma meta maior para continuar anotando." |
| **C′ — Meta máxima** | Estado C com meta = 20 | Nenhum maior | Cinza | "🎉 Meta máxima batida hoje" (bloqueado) | "Meta máxima concluída! 🎉 Volte amanhã para uma nova meta." |

Regras adicionais:

- Ao habilitar uma nova meta no estado C, o app volta ao estado B (botões travam até bater a nova meta).
- O **teste não interfere** nas metas. Os 30 minutos valem só para o botão de teste.
- Seleção pendente inicia igual à meta ativa. Se ficar menor que as palavras de hoje, vai para a primeira meta ≥ palavras de hoje (ou 20).
- Cada habilitação é registrada em um **histórico de metas** (`{momento, meta}`), usado para saber qual era a meta de cada dia passado.

### 4.6 Sua evolução (gráfico dos últimos 7 dias)

- 7 colunas (hoje à direita). Cada coluna, de cima para baixo: **🔥 + quantidade de palavras**, **barra**, **inicial do dia** (D S T Q Q S S).
- **🔥 colorido** = meta daquele dia batida · **🔥 apagado** (cinza, 35 % de opacidade) = abaixo da meta.
- **Barra verde** com sombra = meta batida · **barra verde-clara** = abaixo. Barra de hoje tem **contorno azul**.
- **Meta de cada dia:** dias passados usam a meta que estava vigente naquele dia (via histórico de metas; padrão 5). Hoje usa: a meta ativa se travada, ou a **selecionada** (pré-visualização) se destravada.
- **Escala das barras fixa**: máximo entre as palavras de todos os dias e as metas dos **dias passados**. A meta que está sendo escolhida hoje **não** entra na escala — assim, escolher meta não mexe nos dias anteriores. Só barra e 🔥 de hoje reagem, com animação (altura 0,6 s, cor 0,4 s).
- O gráfico é atualizado "no lugar" (sem recriar elementos) para que as transições CSS funcionem; na primeira exibição as barras sobem de 0.

### 4.7 Últimas palavras

- Lista as **10** mais recentes.
- Cada linha: ícone 💬, palavra (inglês), tradução (português), frase de exemplo entre aspas, botão ✕ para remover.
- Estado vazio: 🌱 "Nenhuma palavra ainda. Toque em “Anotar palavra” para começar!"
- Botão "Ver mais palavras →" leva à aba **Palavras**.

### 4.8 Botão flutuante "+ Anotar palavra"

Ver estados na tabela da seção 4.5. Abre a folha **Anotar palavra** (seção 5).

---

## 5. Funcionalidade — Anotar palavra (fluxo completo)

Folha inferior com título "Nova palavra" e: campo **Palavra (português ou inglês)**, botão **🔎 Traduzir e buscar exemplo**, linha de status, campo **Tradução** (somente leitura), campo **Frase de exemplo (em inglês)** (somente leitura), botões **Salvar** e **Cancelar**.

Os campos Tradução e Frase são **sempre bloqueados** (preenchidos só pela busca automática; aparência acinzentada).

### 5.1 Quando a busca dispara

- Ao sair do campo (*blur*), ao apertar **Enter** ou ao tocar no botão 🔎.
- Não repete se o texto for igual ao da última busca concluída.
- Editar a palavra limpa tradução, frase e status.

### 5.2 Etapas

1. **Ortografia** (pulada se a entrada tiver espaço — expressão ou frase):
   - Se "parece português" (tem acento `ãõçáéíóúâêôà` ou termina em `ção`, `ções`, `mente`, `ável`, `inho`, `inha`): só verifica no **LanguageTool pt-BR**.
   - Senão: verifica no **Datamuse** (inglês). Palavra válida = aparece exatamente nos resultados. Se não for válida em inglês, verifica também no **LanguageTool pt-BR** (para não "corrigir" palavras portuguesas sem acento, como *casa*). Se não for válida em nenhum, usa a 1ª sugestão do Datamuse (ou a do LanguageTool).
   - Falha de rede em qualquer etapa → segue **sem corrigir**.
   - Quando corrige: troca o texto no campo e mostra "Corrigi “x” para “y”." com o link **Usar “x” mesmo**, que refaz o fluxo sem a correção.
2. **Detecção de idioma + tradução** (MyMemory):
   - Parece português → traduz `pt-BR → en`.
   - Caso contrário traduz `en → pt-BR`; se o resultado voltar **igual** à entrada (ignorando maiúsculas e acentos), tenta `pt-BR → en` e, se diferir, considera que era português.
   - Palavra em inglês fica como digitada; palavra em português vira a tradução em inglês em minúsculas.
3. **Frase de exemplo em inglês** (Tatoeba):
   - 3 ou mais palavras: a própria entrada vira o exemplo (1ª letra maiúscula + ponto final); não busca.
   - 2 palavras: busca a **expressão exata**.
   - 1 palavra: busca a palavra **e suas formas** (plural, -ing, -ed) em uma única consulta.
   - Frases com 4 a 14 palavras; escolhe a primeira que contenha a palavra/forma exata (senão, a primeira).
   - Nenhuma frase → o campo fica vazio e o status avisa.
4. **Mensagem de status** ao final (concatenada): aviso de duplicada · aviso de correção · direção ("Inglês → português." / "Português → inglês.") · "Pronto!" ou "Não encontrei frase de exemplo para esta palavra."

### 5.3 Salvar

- Habilitado só com palavra + tradução preenchidas **e** sem duplicidade.
- Duplicada: o status diz "Você já anotou esta palavra, então ela não será contabilizada." e o botão fica desabilitado. Se mesmo assim chegar ao salvar, toast "Você já anotou essa palavra 😉".
- Sucesso: fecha a folha, atualiza tudo e mostra toast "+1 palavra! Continue assim 💪".

### 5.4 Erros

"Não foi possível traduzir: {motivo}." — motivos: pedido bloqueado/sem internet, erro HTTP da API, mensagem da API de tradução.

---

## 6. Funcionalidade — Teste de vocabulário

### 6.1 Montagem

- Sorteia **até 5 palavras** da lista do usuário (menos, se ele tiver menos de 5).
- Cada pergunta mostra a **palavra em português** e pede a **tradução em inglês**.
- **Tipo da pergunta:**
  - *Múltipla escolha* (4 cards): só se existirem ≥ 3 outras palavras distintas, com 70 % de chance por pergunta. Distratores sorteados das demais palavras do usuário; ordem das opções embaralhada.
  - *Digitação:* nos demais casos (30 % de chance, ou quando há poucas palavras).

### 6.2 Tela

1. **Cabeçalho:** logo 🧠, título "Teste de vocabulário", subtítulo "Traduza para o inglês", pílula de acertos "⭐ N" e botão ✕ (à direita).
2. **Barra de progresso** e, abaixo, contador "01/05".
3. Texto auxiliar ("Qual é a tradução em inglês de" ou "Escreva em inglês"), a palavra em português em destaque, e as opções/campo.
4. **Botão inferior** fixo: "Confirmar" (desabilitado até escolher/digitar) → após confirmar vira "Continuar" (ou "Ver resultado" na última).

### 6.3 Correção

- Comparação ignora maiúsculas, acentos e caracteres que não sejam letras `a–z` ou espaço.
- **Acertou:** card verde (ou campo verde), aviso verde no topo "🎉 Acertou! Muito bem!", botão Continuar verde.
- **Errou:** card escolhido vermelho **e o correto verde**, aviso vermelho "😕 Errou. Resposta certa: …", botão Continuar vermelho. Na digitação, mostra abaixo "Resposta certa: …".
- O aviso do topo some sozinho após **2,8 s**.
- Após confirmar, os cards ficam **desabilitados** (só uma escolha por pergunta).
- A barra de progresso avança ao confirmar: `i/n` antes, `(i+1)/n` depois.

### 6.4 Resultado

| Nota | Ícone | Título |
|---|---|---|
| 100 % | 🏆 | Perfeito! |
| 80–99 % | 🏆 | Muito bem! |
| 60–79 % | 👏 | Muito bem! |
| 50–59 % | 👏 | Continue praticando! |
| < 50 % | 💪 | Continue praticando! |

Mostra a pontuação "X/N", "Você acertou Y% das palavras" e três quadros (Acertos · Erros · Nota). Botão **Finalizar** volta à tela anterior.

### 6.5 Registro e intervalo

- O teste é **registrado ao chegar na tela de resultado** (passando ou não): `{momento, acertos, total}`.
- A partir daí, **30 minutos** de bloqueio do botão de teste.
- Fechar no ✕ **antes** do resultado não registra nem bloqueia.

---

## 7. Funcionalidade — Aba Palavras

1. **Card verde "PALAVRAS SALVAS":** total salvo + faixa com **Semana**, **Média/dia** (semana ÷ 7, uma casa decimal, vírgula) e **Melhor dia** (maior número de palavras em um único dia).
2. **Card "Seu desempenho"** (fundo azul em degradê, letras brancas): título "Palavras por dia", alternância **7 dias / 14 dias**, três quadros (Total · Média/dia · Melhor dia **do período**) e gráfico de barras brancas translúcidas (hoje em branco sólido). Nas barras: valor acima (vazio quando 0) e, abaixo, a inicial do dia (7 dias) ou o **dia do mês** (14 dias).
3. **Últimas palavras** (10) e botão **"Ver todas as palavras"** (oculto se não há palavras).

### 7.1 Todas as palavras (tela cheia)

- Cabeçalho: seta ← (voltar), título "Todas as palavras", contador "N palavras" à direita.
- Campo de busca "🔍 Pesquisar palavra ou tradução" — filtra por inglês **ou** português, **sem diferenciar maiúsculas e acentos**, com *debounce* de 250 ms.
- Lista no mesmo layout das demais (ícone, palavra, tradução, exemplo, ✕).
- **Rolagem infinita:** carrega **15** por vez ao chegar a 160 px do fim; se a tela ainda não estiver cheia, carrega mais automaticamente.
- Fim da lista: "Você chegou ao fim 🎉". Sem resultados: 🔎 "Nenhuma palavra encontrada."
- Remover uma palavra recarrega a lista.

---

## 8. Funcionalidade — Aba Testes

1. **Card azul "TESTES REALIZADOS":** total + faixa com **Melhor nota**, **Média** e **Último** (porcentagens; "–" se não há testes).
2. Botão **"🎯 Fazer teste"** (mesma regra e contagem regressiva do Início).
3. **"Evolução das notas":** barras dos **últimos 10 testes** (mais antigo à esquerda). Cor por nota: **≥ 80 %** verde · **60–79 %** azul · **< 60 %** laranja. Acima, a nota; abaixo, a data `dd/mm`.
4. **"Histórico":** até 10 testes, do mais recente ao mais antigo — ícone (🏆 ≥80 · 👏 ≥60 · 💪), "X/N acertos", "dd/mm às hh:mm" e a nota à direita.
5. Estado vazio: 🎯 "Nenhum teste ainda. Faça o primeiro para ver sua evolução!"

---

## 9. Funcionalidade — Aba Ranking

Texto de abertura: "🏆 Ranking semanal: 10 pontos por palavra nova e 5 por acerto no teste." (no protótipo, completa com o aviso de que os demais jogadores são exemplo).

1. **Pódio** com 1º, 2º e 3º (ordem visual 2º–1º–3º): avatar, nome, pontos, bloco colorido (ouro / prata / bronze) com a posição; 👑 sobre o 1º. Se o usuário está no top 3, seu avatar ganha destaque azul e o nome vira "Você".
2. **"Sua posição"** — card com:
   - **Informação no topo**: "**Você está em Nº** · faltam X XP para passar {nome}" (X = diferença para o usuário imediatamente acima + 1) ou, se é o 1º, "🏆 Você lidera! Vantagem de X XP sobre {nome}". Subtexto "Pontos acumulados na semana".
   - **Gráfico de linhas** (pontos acumulados nos 7 dias) com **3 linhas**: **você (azul)**, o **imediatamente acima (laranja)** e o **segundo acima (vermelho)**. Se o usuário é 1º/2º, completa com os de baixo para manter 3 linhas.
   - **Três avatares** abaixo do gráfico: você primeiro, depois os dois outros, cada um com borda da cor da sua linha, "Nº · pontos".
3. **"Classificação geral":** lista de **10 em 10** com botão **"Carregar mais"** (some no fim). Linha: posição (🥇🥈🥉 nas 3 primeiras), avatar, nome, "Semana" e pontos em laranja; a linha do usuário é destacada em azul claro.
4. Desempate: em empate de pontos, o usuário aparece antes.

---

## 10. Funcionalidade — Aba Perfil

- **Avatar** circular (emoji). Tocar troca ciclicamente: 🦉 🦊 🐼 🐯 🐸 🦄 🐙 🚀.
- **Nome** editável (máx. 24 caracteres; vazio volta a "Estudante"). Salva ao sair do campo.
- "Estudando desde {data por extenso}".
- **Resumo** (6 quadros): 📘 Palavras salvas · 🔥 Sequência atual · 🏅 Maior sequência · 🎯 Testes feitos · ⭐ Nota média · 🚩 Meta diária.
- **Dados:** "Carregar dados de exemplo" e "Apagar todos os dados" (ambos pedem confirmação). Existem só no protótipo; no projeto alvo viram "Exportar dados" e "Excluir conta".

---

## 11. Dados de exemplo (protótipo)

Carregados na primeira abertura (e pelo botão do Perfil), para o gráfico "Sua evolução" já aparecer:

- **24 palavras** em 6 dias anteriores: 3, 5, 2, 5, 4 e 5 por dia (do mais antigo para ontem), horários a partir das 9h. Ex.: thrive, borrow, achieve, improve, reliable… (ver `SEED` no protótipo).
- **4 testes** (nota 3/5, 4/5, 3/5 e 5/5), de 5, 3, 2 e 1 dia atrás, às 20h.
- Histórico de metas com meta **5** desde 8 dias atrás; nenhuma meta habilitada hoje.
- Nome "Estudante", avatar 🦉, "desde" 7 dias atrás.
- Efeito: sequência atual **6**, 🔥 coloridos nos dias com 5 palavras, ranking em torno da 22ª posição.

---

## 12. Cálculos (referência rápida)

| Métrica | Fórmula |
|---|---|
| Palavras de hoje | Palavras com `createdAt` dentro do dia local atual |
| Progresso do card | `min(100, round(hoje ÷ meta × 100))` % (mínimo visual 6 % se hoje > 0) |
| Semana | Soma das palavras dos últimos 7 dias (incluindo hoje) |
| Média/dia (Palavras) | `semana ÷ 7` |
| Melhor dia | Máximo de palavras em um dia, em todo o histórico |
| Nota do teste | `round(acertos ÷ total × 100)` % |
| Nota média | Média aritmética das notas de todos os testes, arredondada |
| Pontos do dia | `10 × palavras + 5 × acertos` |
| Pontos acumulados (gráfico) | Soma corrida dos pontos diários nos 7 dias |
| Intervalo de teste | `agora − fim do último teste < 30 min` ⇒ bloqueado |

---

## 13. Regras que passam a ser do servidor no projeto Next.js

Porque no navegador podem ser burladas (limpando o armazenamento, alterando o relógio):

1. Unicidade da palavra por usuário.
2. Estado da meta do dia (habilitar, travar, liberar) e o histórico de metas.
3. Intervalo de 30 min entre testes e a correção das respostas (o gabarito não pode ir ao cliente antes de responder).
4. Cálculo de pontos e do ranking.
5. Limites de uso das APIs externas (cache e *rate limit*).

Detalhes em `04-arquitetura-next-dados-e-autenticacao.md` e `05-api-endpoints-e-integracoes.md`.

---

## 14. Fora do escopo atual / ideias futuras

- Metas e testes configuráveis (quantidade de perguntas, intervalo).
- Pronúncia (áudio) e repetição espaçada.
- Ligas e ranking de amigos.
- Notificações de lembrete diário.
- Importar/exportar palavras.
- Tela de ajustes (tema manual claro/escuro).
