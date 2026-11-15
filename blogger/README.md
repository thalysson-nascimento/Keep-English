# Keep English — Blogger 1.1.0

Tema institucional responsivo, com oito páginas completas, três delas artigos de estudo. Desenvolvedor público: Datingmatch Studio. Suporte: thalysson.developer@gmail.com.

## Revisar a prévia

Abra `preview/index.html` no navegador. A navegação funciona também abrindo o arquivo diretamente. A prévia usa os blocos extraídos do XML gerado. O arquivo XML é o tema para o Blogger; os arquivos HTML são a prévia e as referências de conteúdo.

## Instalar

1. Faça backup do tema atual em Blogger → Tema antes de alterar um blog existente.
2. Em um blog de teste, use Tema → Restaurar para enviar `keep-english-blogger-v1.1.0.xml` ou substitua o HTML do tema pelo conteúdo desse arquivo.
3. Crie as páginas listadas em `PAGINAS.md`, preservando títulos exatos. O XML não cria páginas automaticamente. Confira os endereços efetivamente gerados antes de divulgar os links.
4. Se o Blogger oferecer um tema móvel separado, selecione o tema de computador para o celular, para manter este layout responsivo.
5. Verifique início, oito páginas, artigo nativo, arquivo de posts e versão móvel. Confirme logo, setas de retorno, e-mail, títulos e corpo dos documentos, sem duplicações.
6. Publique documentos legais somente depois de concluir as pendências de `REVISAO-LEGAL.md` e conferir os textos. A configuração do app e a Play Console precisam corresponder às práticas descritas.

Esta entrega não foi importada nem publicada em uma conta Blogger. A aceitação pela plataforma precisa ser verificada. A logo original está incorporada como PNG no XML, sem depender do computador do autor. Se a plataforma remover a imagem incorporada, hospede `assets/keep-english.png` no Blogger e use a URL HTTPS gerada em `build.py`, em lugar da montagem de `logo` com base64. Não use uma URL local.

## Manutenção

Privacidade e termos usam a mesma fonte do app: `src/features/auth/content/legal-documents.json`, na raiz do repositório. Edite esse arquivo para atualizar título, introdução, seções, versão, data e aviso de revisão nos dois destinos. O app exibe o documento integral em português, idioma disponível no Blogger, mesmo quando a interface estiver em inglês.

O construtor gera `source/legal-documents.json` como cópia para o pacote portátil. Não edite essa cópia no repositório: a próxima geração a substitui. Fora do repositório, ela permite consultar os documentos no pacote de instalação.

Demais fontes: `source/styles.css`, `source/pages.json`, `assets/keep-english.png` e `build.py`. Execute da raiz do projeto:

```text
python blogger/build.py
python .github/agents/blogger/scripts/validate_theme.py --theme blogger/keep-english-blogger-v1.1.0.xml --profile blogger/reports/project.json --report blogger/reports/validation-xml.json
python blogger/verify.py
```

Os conteúdos fixos são integrados ao tema, fora do widget de posts. Editar apenas o corpo da página no painel não altera esses documentos. Para revisar o conteúdo, edite as fontes e gere/reinstale o tema. Não renomeie os títulos das páginas sem atualizar o perfil e o roteamento. Publicações novas usam o widget Blog e podem ser gerenciadas normalmente pelo painel; esta primeira versão não inclui comentários no tema.

Sem scripts próprios de anúncios, analytics, formulários ou cookies adicionados. O Blogger pode ter tratamento próprio de dados e configurações adicionais. Nenhuma dependência do aplicativo foi alterada.
