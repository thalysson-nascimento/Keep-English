# Verificação da exclusão de conta

## Documentos legais

Com o aplicativo em execução local, confira privacidade e termos contra a prévia do Blogger:

```text
node --test tests/legal-documents-parity.test.mjs
```

O teste verifica título, introdução, todas as seções, versão, data, aviso e link de privacidade do Google, com o idioma de interface em português e inglês. Os documentos permanecem em português para corresponder integralmente ao Blogger. A fonte editável é `src/features/auth/content/legal-documents.json`; a cópia do pacote Blogger é gerada automaticamente.

## Conta e dados

O teste de integração utiliza PostgreSQL e cria duas contas descartáveis com identificadores aleatórios. Não utiliza nem exclui a conta compartilhada de testes. Executar com as dependências existentes e uma conexão PostgreSQL válida em `.env` ou `.env.development.local`:

```text
node --import ./scripts/with-project-variables.mjs --import ./tests/server-only-hook.mjs --conditions=react-server --import tsx --test tests/auth-delete-account.integration.test.ts
```

Verifica sessão obrigatória, rejeição de origem externa, autenticação recente, cookie revogado, exclusão de todas as relações e preservação de outra conta, mesmo com um identificador alheio enviado no corpo. A limpeza final se restringe às duas contas criadas pelo próprio teste.

O carregador `with-project-variables.mjs` usa o arquivo local `.variables` sem exibir valores. Esse arquivo deve continuar fora do Git. Para criar a conta separada para exclusão manual:

```text
node --import ./scripts/with-project-variables.mjs --import tsx prisma/seed.ts --deletion-test
```

Conta pública de teste: `delete@test.com`, senha `123456`. A conta inclui palavra, meta concluída e resultado de teste. O seed normal continua criando `user@test.com` com a mesma senha pública. As credenciais são exclusivas dos testes fechados.

Para revisar somente a interface com respostas simuladas:

```text
node tests/preview-delete-account.mjs
```

Abra o endereço local informado. O componente e as traduções são os reais; o serviço de autenticação é substituído apenas nessa prévia. Isso permite conferir Cancelar, Excluir, Aguarde..., erro, sessão antiga e retorno ao login, sem apagar nenhuma conta. Essa prévia não comprova exclusão no banco.
