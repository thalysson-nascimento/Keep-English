# Páginas a criar no Blogger

Importar o tema não cria páginas. Publique cada página com o título exato abaixo. Confira o endereço gerado pelo Blogger; se diferir, ajuste os links em `build.py` e `source/pages.json` e gere novamente.

| Título exato | Endereço esperado | Conteúdo de referência |
| --- | --- | --- |
| Sobre o Keep English | `/p/sobre.html` | `pages/sobre.html` |
| Política de Privacidade | `/p/privacidade.html` | `pages/privacidade.html` |
| Termos de Uso | `/p/termos-de-uso.html` | `pages/termos-de-uso.html` |
| Excluir conta | `/p/excluir-conta.html` | `pages/excluir-conta.html` |
| Contato e suporte | `/p/contato.html` | `pages/contato.html` |
| Como criar seu caderno de vocabulário | `/p/caderno-de-vocabulario.html` | `pages/caderno-de-vocabulario.html` |
| Como estudar palavras em contexto | `/p/palavras-em-contexto.html` | `pages/palavras-em-contexto.html` |
| Como montar uma rotina de revisão | `/p/rotina-de-revisao.html` | `pages/rotina-de-revisao.html` |

Os documentos são integrados ao tema e selecionados pelo título exato. O editor de páginas pode conter uma breve descrição: o corpo público vem do tema. Os arquivos HTML são referências completas para revisão, não devem ser colados junto com outra cópia do documento. Para editar: altere `source/pages.json`, execute `python blogger/build.py` e reinstale o XML. Páginas adicionais com títulos diferentes exibem o corpo nativo.
