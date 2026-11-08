import { LegalDocument } from "@/features/auth/presentation/legal-document";

export default function PrivacyPage() {
  return (
    <LegalDocument
      description="Esta versão inicial descreve os dados usados pela aplicação durante o desenvolvimento."
      sections={[
        {
          title: "Dados da conta",
          text: "A aplicação armazena nome, e-mail e avatar para identificar sua conta. A autenticação e as senhas são gerenciadas pelo Better Auth.",
        },
        {
          title: "Dados de aprendizagem",
          text: "Palavras salvas, metas diárias e resultados de testes são associados à sua conta para apresentar o progresso e o ranking.",
        },
        {
          title: "Armazenamento",
          text: "No ambiente de desenvolvimento atual, os dados ficam em uma base SQLite local. Antes da disponibilização pública, este documento e as práticas de tratamento de dados precisam ser revisados.",
        },
      ]}
      title="Política de privacidade"
    />
  );
}
