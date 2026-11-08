import { LegalDocument } from "@/features/auth/presentation/legal-document";

export default function TermsPage() {
  return (
    <LegalDocument
      description="O Keep English é uma aplicação em desenvolvimento para apoiar o registro e a prática de vocabulário em inglês."
      sections={[
        {
          title: "Uso da conta",
          text: "Mantenha seus dados de acesso em segurança e utilize a aplicação de forma lícita e respeitosa. As funcionalidades podem mudar enquanto o produto estiver em desenvolvimento.",
        },
        {
          title: "Disponibilidade",
          text: "Esta versão é experimental e pode sofrer interrupções, alterações ou perda de dados. Não utilize a aplicação para armazenar informações críticas.",
        },
        {
          title: "Contato e revisão",
          text: "Este texto é um rascunho informativo e não substitui termos revisados para a operação pública do serviço.",
        },
      ]}
      title="Termos de uso"
    />
  );
}
