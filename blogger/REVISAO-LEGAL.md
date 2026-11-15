# Revisão necessária antes da publicação

Os documentos estão redigidos para revisão, com avisos visíveis. A exclusão no app foi implementada em Perfil → Excluir conta, com confirmação e remoção via Better Auth. O site também oferece um botão que abre uma solicitação por e-mail. O prazo confirmado pelo responsável para atendimento de pedidos por suporte é de até 30 dias; ele não atrasa a exclusão feita diretamente pelo app.

Confirmar e então atualizar os textos:

- Identificação jurídica do responsável, além do nome público Datingmatch Studio, quando aplicável.
- Público etário, países atendidos e controles para crianças e adolescentes.
- Hospedagem, operadores, países de tratamento e transferências internacionais.
- Rede de anúncios, ferramentas de análise e SDKs efetivos da versão Android. O responsável confirmou o plano de anúncio na abertura e vídeo recompensado opcional para antecipar um teste antes dos 30 minutos. Esses SDKs não foram implementados nesta tarefa.
- Registro real de IP e navegador, logs, retenção e ciclo de backups.
- Procedimento para confirmar titularidade, executar exclusão da conta e dados, tratar fornecedores e confirmar ao titular.
- Retenções justificadas e respectivos prazos, além do prazo de suporte já confirmado.
- A exclusão real no PostgreSQL foi validada com as credenciais autorizadas em `.variables`: sessão obrigatória, origem rejeitada, autenticação recente, remoção em cascata e preservação de outra conta. O teste usa contas temporárias, sem excluir a conta compartilhada nem `delete@test.com`, reservada para teste manual.
- Consistência com as páginas internas do app e o formulário Segurança dos dados da Play Console.

Depois da confirmação, substituir os trechos pendentes por informações reais e retirar os avisos de revisão. Não publicar as versões atuais como documentos finais.

## Fontes oficiais consultadas em 15/11/2026

- https://support.google.com/blogger/answer/46888 — seções e widgets.
- https://support.google.com/blogger/answer/47270 — dados do tema.
- https://support.google.com/googleplay/android-developer/answer/13327111 — exclusão de conta, caminho no app e recurso web; e-mail é uma opção para iniciar o pedido no recurso web.
- https://better-auth.com/docs/concepts/users-accounts — exclusão pelo serviço de autenticação e exigência de sessão recente.
- https://support.google.com/googleplay/android-developer/answer/9857753 — publicidade; conferir um formato próprio de abertura, sem intersticial inesperado antes da tela de carregamento. A política do SDK escolhido também precisa ser conferida.
- https://policies.google.com/privacy — referência para tratamento pela plataforma Google, a revisar na configuração final.

A página da LGPD no Planalto retornou um desafio de acesso nesta consulta; não foi usada para atribuir prazos específicos. A documentação técnica não garante aprovação em loja nem substitui avaliação jurídica das condições reais.
