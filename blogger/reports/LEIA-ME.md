# Validação — versão 1.1.0

- XML: passou no validador portátil, com oito rotas institucionais e um widget Blog.
- Conteúdo: nove páginas de prévia; links internos e âncoras resolvem; documentos presentes no XML e na prévia; avisos de revisão e ação de e-mail preservados.
- Navegador: início verificado em 320, 390, 768 e 1366 px, sem rolagem horizontal. Imagens carregadas. Oito páginas com título e corpo visíveis. Navegação para exclusão e retorno ao início verificadas.
- Aceitação do XML pelo Blogger: não verificada.
- Endereços e páginas publicadas: não verificados.
- Exclusão efetiva: implementada pelo Better Auth e validada com teste de integração no PostgreSQL. Conta, sessões, credenciais, palavras, metas, conclusões de metas e testes apagados; outra conta preservada. Requisições sem sessão, com origem não autorizada e com sessão antiga rejeitadas.
- Modal: componente real verificado em prévia isolada com respostas simuladas para cancelar, processar, sucesso, erro e sessão antiga; não confundir esse teste de interface com o teste separado no banco.
- TypeScript: `npm run typecheck` passou.
- Build de produção: `npm run build` passou.
- Lint: verificação do código, testes, scripts e seed concluída sem erros.

Conta reservada para validação manual no celular: `delete@test.com`, senha pública de teste `123456`. Criada via seed no PostgreSQL autorizado, com palavra, meta, conclusão e teste. A conta não foi excluída durante as verificações automatizadas. O acesso compartilhado `user@test.com` também foi sincronizado com a senha informada pelo responsável.

Os registros estruturados e as capturas estão nesta pasta. `theme-sha256.txt` identifica o XML gerado. As verificações locais não simulam o processamento do Blogger nem comprovam os SDKs da versão distribuída do app. Os documentos legais continuam em revisão quanto à rede de publicidade, retenção e configuração de produção, conforme `../REVISAO-LEGAL.md`.
