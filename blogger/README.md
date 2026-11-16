# Keep English — Blogger 1.3.0

## Arquivos para instalar

- `template.xml`: tema atual, pronto para enviar ao Blogger.
- `keep-english-blogger-v1.3.0.xml`: cópia versionada do mesmo tema.
- `pages/`: conteúdo completo das oito páginas.
- `PAGINAS.md`: títulos e endereços das páginas que precisam ser criadas.
- `preview/index.html`: prévia navegável no computador e celular.
- `assets/`: logo original.
- `source/`: estilos e conteúdos do site.
- `reports/`: resultados das verificações locais.
- `keep-english-blogger-v1.3.0.zip`: pacote completo de instalação.

## Instalar no Blogger

1. Faça backup do tema atual em Blogger → Tema.
2. Use Tema → Restaurar e envie `template.xml`. Também é possível colar o XML em Editar HTML.
3. Preserve as três postagens legais existentes: Politica de privacidade, Termos de uso e Exclusão da conta. O tema 1.2.1 já reconhece esses títulos e aponta para os endereços publicados em novembro de 2026. Para as demais páginas, siga `PAGINAS.md`: importar o tema não as cria automaticamente.
4. Confira os endereços gerados e ajuste os links se forem diferentes dos documentados.
5. Se o painel oferecer um tema móvel separado, use o tema de computador também no celular para manter o layout responsivo.
6. Abra cada página publicada e confira título, corpo e seta de retorno, incluindo privacidade, termos e exclusão.

Os textos fixos são integrados no XML e selecionados pelo título exato da página. O corpo no editor pode conter uma descrição curta; não cole uma segunda cópia do documento. Para alterar os textos, atualize as fontes e reinstale o XML gerado. Novas publicações normais continuam sendo exibidas pelo widget Blog.

A logo está incorporada no XML, sem depender de um endereço no computador. Se o Blogger remover a imagem incorporada, hospede `assets/keep-english.png` no Blogger e substitua a montagem da variável `logo` em `build.py` pela URL HTTPS recebida.

## Conteúdo compartilhado com o app

Privacidade e termos usam a fonte `src/features/auth/content/legal-documents.json`, na raiz do repositório. O construtor gera uma cópia em `source/legal-documents.json` para acompanhar o pacote. Os documentos são integrais em português nos dois destinos. Esta versão remove os avisos de rascunho e registra a classificação de conteúdo Livre no Brasil e a publicidade pelo Google AdMob.

## Gerar novamente

Da raiz do projeto:

```text
python blogger/build.py
python .github/agents/blogger/scripts/validate_theme.py --theme blogger/template.xml --profile blogger/reports/project.json --report blogger/reports/validation-xml.json
python blogger/verify.py
python blogger/package.py
```

O XML, os links e os documentos são verificados localmente. A importação e as URLs públicas do Blogger só podem ser confirmadas após a instalação na sua conta.

O ZIP também inclui os verificadores em `tools/`. Com o pacote extraído, é possível executar `python build.py`, `python verify.py` e `python tools/validate_theme.py --theme template.xml --profile reports/project.json` diretamente na pasta extraída.

## Correção de páginas vazias — 1.2.1

O blog publicado usa postagens em `/2026/11/` para os três documentos legais, enquanto o tema anterior apontava para `/p/`. A correção mapeia os endereços e títulos existentes em `source/routes.json` e renderiza os documentos fora do widget Blog tanto em páginas quanto em postagens. Não é necessário colar novamente os conteúdos nem recriar os três posts. Reimporte `template.xml`; a confirmação no site publicado depende dessa instalação. O layout e os textos legais foram preservados.

## SEO — versão 1.3.0

Metadados específicos, URLs canônicas, Open Graph, cartões de compartilhamento e dados estruturados foram adicionados. Os guias completos estão acessíveis no início enquanto suas páginas próprias ainda não forem publicadas. Sobre e Ajuda levam a seções existentes; os links legais permanecem nos posts já publicados. Consulte `SEO.md` para configurar visibilidade nos buscadores, descrições, favicon, imagem pública e Search Console. O tema não altera automaticamente o painel nem garante ranking.
