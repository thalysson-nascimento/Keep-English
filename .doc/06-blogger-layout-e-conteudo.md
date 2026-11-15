# Keep English — proposta de layout e conteúdo para Blogger

Data: 15/11/2026. Status: proposta para revisão; sem publicação ou tema construído.

## Identidade confirmada pelo usuário

- Aplicativo: Keep English.
- Nome público do desenvolvedor na Google Play: Datingmatch Studio. Não presumir razão social ou CNPJ.
- Suporte: thalysson.developer@gmail.com.
- Logo: imagem anexada pelo usuário, em `C:/Users/thalysson/Downloads/keep-english (1).png`. Balão branco com check verde, marcador laranja e chama; preservar proporções e fundo original.

## Entendimento do produto e evidências

Keep English é um caderno pessoal de vocabulário de inglês: salvar palavras, consultar tradução e exemplos, treinar com testes e acompanhar metas, sequência e evolução. Há ranking semanal.

Fontes analisadas: `.doc/01-visao-geral-e-funcionalidades.md`, `.doc/02-design-system.md`, `src/shared/styles/tokens.css`, `prisma/schema.prisma`, `src/core/auth/auth.ts`, `src/features/words/infrastructure/public-word-lookup.ts`, `src/features/profile/presentation/profile-screen.tsx` e `src/features/ranking/infrastructure/prisma-ranking-repository.ts`.

- Observado: Next.js, React, TypeScript, Prisma/PostgreSQL e Better Auth; cadastro por e-mail e senha configurado; armazenamento de conta e aprendizado no servidor.
- Observado: nome, e-mail, avatar, credenciais de autenticação, sessões, palavras, metas e resultados de testes no modelo de dados. Sessões têm campos opcionais de IP e agente do navegador; confirmar preenchimento na implantação.
- Observado: consultas pelo servidor a Datamuse, LanguageTool, MyMemory e Tatoeba. Palavras/textos de consulta são enviados conforme o fluxo; não afirmar que os dados ficam somente no aparelho.
- Observado: ranking consulta nome, avatar e atividade para calcular classificação. A política deve esclarecer o que outros usuários veem.
- Observado: páginas de privacidade e termos têm estrutura inicial, com três seções cada.
- Não encontrado no fluxo analisado: ação de exclusão de conta no perfil ou configuração explícita de exclusão no Better Auth. Relações em cascata no banco não comprovam um fluxo de exclusão funcionando.
- Planejado na documentação, sem configuração observada: Google OAuth.
- Desconhecido: pacote Android distribuído, URL da loja, hospedagem em produção, backups, logs, retenção, fornecedores adicionais, publicidade, analytics, público etário e operação do atendimento.

## Direção visual proposta

Site institucional com área de artigos, apresentação do aplicativo e central de ajuda. Primeira versão em português; inglês é uma possibilidade posterior, com documentos completos equivalentes.

| Papel | Cor de referência |
| --- | --- |
| Marca e destaques | Verde `#58CC02` |
| Profundidade | Verde `#46A302` |
| Sequência e detalhes | Laranja `#FF9600` |
| Apoio e links | Azul `#1CB0F6` |
| Fundo | Branco `#FFFFFF` |
| Texto | Cinza `#4B4B4B` |
| Bordas | Cinza `#E5E5E5` |

Cores baseadas nos tokens existentes, sem afirmar extração exata dos pixels da logo. Nunito ou fonte arredondada com alternativa de sistema. Cartões com cantos de 20–24 px e sombras inferiores discretas. Verde e laranja como acentos; medir contraste dos textos e botões, escurecendo as cores funcionais quando necessário. Peso ou tamanho da fonte não substituem contraste adequado.

Desktop: conteúdo centralizado até aproximadamente 1120 px; abertura com texto e logo em duas colunas; recursos em três colunas. Celular: uma coluna, navegação simples e áreas de toque confortáveis. Documentos: coluna até 760 px, corpo de 16–18 px, entrelinha confortável, índice e retorno no alto à esquerda. Links legais sempre visíveis no rodapé.

## Estrutura da página inicial

1. Cabeçalho: logo e Keep English; links Como funciona, Artigos e Ajuda.
2. Abertura: título “Seu inglês cresce, palavra por palavra.” Texto: “Anote palavras, consulte traduções e exemplos e pratique com testes. Acompanhe suas metas e transforme o estudo em um hábito diário.” Ação inicial: “Conheça o Keep English”, levando à seção de recursos. Adicionar download somente com URL confirmada.
3. Como funciona: “Anote uma palavra”, “Entenda com tradução e exemplo”, “Pratique e acompanhe sua evolução”.
4. Recursos: vocabulário pessoal; testes; metas e sequência; evolução e ranking. Sem promessa de fluência, estatísticas fictícias ou disponibilidade em loja não confirmada.
5. Artigos: sugestões editoriais “Como criar seu caderno de vocabulário”, “Como estudar palavras em contexto” e “Como montar uma rotina de revisão”. Exibir cartões quando houver artigos completos.
6. Ajuda: suporte, privacidade, termos e exclusão de conta.
7. Rodapé: Keep English; “Desenvolvedor: Datingmatch Studio”; e-mail de suporte; links dos documentos.

## Páginas fixas propostas

- `/p/sobre.html`: propósito e funcionamento do Keep English.
- `/p/privacidade.html`: política de privacidade.
- `/p/termos-de-uso.html`: termos de uso.
- `/p/excluir-conta.html`: solicitação de exclusão de conta e dados.
- `/p/contato.html`: suporte e dúvidas.

Rotas propostas para criação posterior no Blogger, ainda inexistentes.

## Conteúdo da política de privacidade

Identificação do aplicativo e do desenvolvedor público; contato; dados da conta e do aprendizado; autenticação e sessões; finalidades e bases legais a definir por operação; visibilidade do ranking; serviços de tradução/correção/exemplos; hospedagem e eventuais transferências internacionais; cookies e tratamento próprio do Blogger; retenção e backups; exclusão e direitos; público etário; segurança e alterações do documento.

O texto final depende da operação real. Confirmar fornecedores e suas práticas antes de afirmar retenção, anonimização, ausência de compartilhamento ou ausência de rastreamento. Manter coerência entre o Blogger, as páginas internas do app e as declarações na Play Console.

## Conteúdo dos termos de uso

Identificação; finalidade educacional; cadastro e responsabilidade pelas credenciais; uso permitido; integridade do ranking; propriedade do aplicativo e conteúdo do usuário; limitações de traduções e exemplos automáticos; disponibilidade; suspensão e encerramento; exclusão; alterações e contato. Cobranças e assinaturas só entram se existirem. Evitar renúncias genéricas a direitos do consumidor ou garantias de resultado no aprendizado.

## Exclusão de conta: proposta prioritária

Página pública independente, acessível sem login e sem reinstalar o app. Título: “Excluir sua conta do Keep English”. Identificar Datingmatch Studio e explicar consequências antes da solicitação.

Proposta inicial: botão “Solicitar exclusão por e-mail” e endereço visível `thalysson.developer@gmail.com`, com assunto “Exclusão de conta — Keep English”. Orientar envio pelo e-mail cadastrado; oferecer confirmação de titularidade por processo proporcional, sem solicitar senha. Abrir o e-mail não significa que a solicitação foi enviada ou concluída.

Explicar quais dados serão apagados: conta, palavras, metas, histórico de testes e participação no ranking, conforme implementação validada. Definir exceções justificadas e duração, retenção em backups e prazo operacional antes de publicar compromissos. Sair da conta e desinstalar o app não são exclusão.

Adicionar um caminho claro no perfil do app, que pode encaminhar à página pública. O atendimento por e-mail é uma proposta de operação; precisa de procedimento real para verificar, executar e confirmar pedidos.

Google Play exige caminho no app e recurso web para solicitar exclusão quando há criação de conta; admite e-mail de suporte como caminho no recurso web. A página precisa identificar o aplicativo/desenvolvedor e permitir iniciar o pedido. Fonte oficial consultada em 15/11/2026: https://support.google.com/googleplay/android-developer/answer/13327111 .

## Decisões pendentes antes do conteúdo legal final

Confirmar versão Android e link da loja, público-alvo/idade, países atendidos, hospedagem e fornecedores, anúncios/analytics/SDKs, política de logs e backups, prazo e operação de exclusão. Datingmatch Studio foi confirmado como nome público, não como identificação jurídica completa.

## Limites desta etapa

Análise de documentação e código; proposta editorial e visual. Sem alteração no aplicativo, teste de exclusão, XML Blogger, importação ou publicação. Logo inspecionada na imagem anexada à conversa.
