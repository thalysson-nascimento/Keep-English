# SEO do Keep English — tema 1.3.0

O tema melhora a apresentação e a compreensão do conteúdo por buscadores. Não há garantia de indexação, posição, tráfego ou nota 100: esses resultados dependem também do Google, do conteúdo, da publicação e do desempenho real do site.

## Implementado no XML

- Título e descrição específicos para o início e cada documento integrado.
- Uma URL canônica por página, com os endereços reais dos três posts legais preservados.
- Open Graph e cartões de compartilhamento com resumos editoriais, sem copiar menus ou setas de retorno.
- Dados estruturados WebSite, Organization, WebPage e navegação BreadcrumbList. Os guias, quando acessados como páginas próprias, usam Article; os documentos legais continuam sendo WebPage.
- Sem avaliações, preços, prêmios, datas de publicação ou endereço empresarial inventados.
- Conteúdo em português identificado por `lang` e `inLanguage`, sem traduções ou `hreflang` fictícios.
- Uma hierarquia de títulos consistente, imagens com dimensões e texto alternativo e foco visível nos links.
- Tratamento de não indexação para buscas internas, arquivos e páginas de erro na ramificação nativa do Blogger. As páginas úteis permanecem indexáveis.
- Os cinco links que apontavam para páginas ainda não publicadas agora levam a conteúdo da página inicial. Os três guias completos ficam acessíveis em seções expansíveis, com HTML legível sem depender de uma chamada de rede.
- A navegação dos três posts legais publicados não mudou.

Nas rotas gerenciadas, o tema emite seus próprios metadados para evitar duplicar os campos Open Graph do cabeçalho padrão. Em posts e rotas adicionais, preserva o cabeçalho nativo do Blogger. Configurações de robôs no painel devem permanecer coerentes com a visibilidade pública desejada.

## Instalação

Faça backup do tema atual e envie `template.xml` em Blogger → Tema → Restaurar. A validação local não confirma que o arquivo já foi instalado na sua conta.

## Configurações no painel

1. Em Configurações → Privacidade, confira **Visível para mecanismos de pesquisa**.
2. Em Configurações → Metatags, ative a descrição de pesquisa e use o resumo abaixo. Isso também ajuda o cabeçalho nativo de novas postagens.

   Anote palavras em inglês, consulte traduções e exemplos, pratique com testes e acompanhe suas metas diárias com o Keep English.

3. Em Configurações → Básico → Favicon, envie a logo quadrada de `assets/keep-english.png`. Ela tem 512 × 512 pixels e aproximadamente 70 KB; o painel deve confirmar a aceitação do arquivo.
4. Não substitua o robots.txt automaticamente: a auditoria encontrou o arquivo padrão funcionando, com o sitemap anunciado. Não bloqueie as postagens legais ou o conteúdo de estudo.
5. Se existirem regras personalizadas de cabeçalho de robôs, confira se não estão marcando o início e as páginas úteis como `noindex`. O painel não foi alterado nesta entrega.

## Search Console

Adicione ou selecione a propriedade `https://keepenglishworld.blogspot.com/` em [Google Search Console](https://search.google.com/search-console). Use a mesma conta responsável pelo blog quando possível e conclua a verificação indicada pelo serviço.

Se for solicitado um código de tag HTML, informe apenas o valor de `content` em `search_console_verification`, no arquivo `source/seo.json`, e gere/reinstale o tema. O campo fica vazio até o Google fornecer o código; nenhum código de verificação foi inventado.

Envie os sitemaps nativos:

- `https://keepenglishworld.blogspot.com/sitemap.xml`
- `https://keepenglishworld.blogspot.com/sitemap-pages.xml`

O sitemap de páginas estava vazio na auditoria porque ainda não havia páginas fixas publicadas. Não é necessário fabricar um arquivo substituto. Após instalar o tema, use a inspeção de URL para conferir o início e os três documentos legais. Uma solicitação de indexação não garante que o Google indexe a página ou quando isso acontecerá.

## Imagem para compartilhamento

O tema já fornece título e descrição para compartilhamento. Para acrescentar uma imagem, envie a logo a uma hospedagem pública do Blogger e copie a URL HTTPS da imagem para `social_image_url` em `source/seo.json`. Depois gere e reinstale o tema.

Não foi usado um endereço inventado ou uma imagem em base64 como `og:image`: serviços de compartilhamento precisam conseguir buscar a imagem por URL. O valor permanece vazio até existir uma URL real. A mesma imagem será usada como logo estruturada; use a logo do app nesse campo.

## Publicar os guias como páginas próprias

Hoje os guias completos estão no início, pois suas URLs `/p/...` ainda não existem. Para criar URLs próprias, publique os conteúdos de `pages/`, confira os endereços reais e atualize `source/routes.json`. Remova os respectivos destinos de `unpublished_link_targets` em `source/seo.json` e gere novamente. Os guias deixam de ser repetidos integralmente no início e passam a ser abertos por seus links próprios.

Não altere os endereços legais que já funcionam. Se um endereço tiver de mudar, configure um redirecionamento no Blogger; editar o XML não cria redirecionamentos HTTP.

## Manutenção e confirmação

`source/seo.json` concentra títulos, descrições e destinos temporários. `source/routes.json` contém os caminhos publicados. Se o blog mudar de domínio, atualize essa configuração antes de gerar outro tema.

```text
python blogger/build.py
python blogger/verify.py
python -m unittest discover -s blogger/tests
python .github/agents/blogger/scripts/validate_theme.py --theme blogger/template.xml --profile blogger/reports/project.json
python blogger/package.py
```

Depois da instalação, confira no HTML público se existe apenas um título, uma descrição e um link canônico para cada documento. Teste os dados estruturados no [Rich Results Test](https://search.google.com/test/rich-results). Dados estruturados válidos não garantem que um resultado especial seja exibido.

Fontes oficiais consultadas em 15/11/2026:

- [Guia de SEO do Google](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [SEO no Blogger](https://support.google.com/blogger/answer/41373)
- [Configurações do Blogger](https://support.google.com/blogger/answer/9691230)
- [Dados estruturados](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)
- [Organização](https://developers.google.com/search/docs/appearance/structured-data/organization)
- [Artigos](https://developers.google.com/search/docs/appearance/structured-data/article)
- [Regras de robôs](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag)
