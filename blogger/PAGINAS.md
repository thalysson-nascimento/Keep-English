# Páginas e postagens do Blogger

Os três documentos legais já estão publicados como postagens e foram mapeados pelos títulos e endereços reais. Não recrie nem renomeie esses três documentos. As demais páginas ainda não estão publicadas: seus links levam a seções existentes no início. Os guias completos ficam no início até serem publicados com URLs próprias. Criar páginas separadas é opcional; para isso, siga SEO.md e atualize os destinos após a publicação. Confira o endereço gerado pelo Blogger; se diferir, ajuste os links em `build.py` e `source/pages.json` e gere novamente.

| Título exato | Endereço esperado | Conteúdo de referência |
| --- | --- | --- |
| Sobre o Keep English | `/p/sobre.html` | `pages/sobre.html` |
| Politica de privacidade | `/2026/11/politica-de-privacidade.html` | `pages/privacidade.html` |
| Termos de uso | `/2026/11/termos-de-uso.html` | `pages/termos-de-uso.html` |
| Exclusão da conta | `/2026/11/exclusao-da-conta.html` | `pages/excluir-conta.html` |
| Contato e suporte | `/p/contato.html` | `pages/contato.html` |
| Como criar seu caderno de vocabulário | `/p/caderno-de-vocabulario.html` | `pages/caderno-de-vocabulario.html` |
| Como estudar palavras em contexto | `/p/palavras-em-contexto.html` | `pages/palavras-em-contexto.html` |
| Como montar uma rotina de revisão | `/p/rotina-de-revisao.html` | `pages/rotina-de-revisao.html` |

Os documentos são integrados ao tema e selecionados pelo título exato. O editor de páginas pode conter uma breve descrição: o corpo público vem do tema. Os arquivos HTML são referências completas para revisão, não devem ser colados junto com outra cópia do documento. Para editar textos legais: altere `src/features/auth/content/legal-documents.json` na raiz do projeto (fonte compartilhada com o app). Para as demais páginas, altere `source/pages.json`. Depois execute `python blogger/build.py` e reinstale o XML. Páginas adicionais com títulos diferentes exibem o corpo nativo.
