import { LegalDocument } from "@/features/auth/presentation/legal-document";
import { getRequestLocale } from "@/shared/i18n/server";
import { translate } from "@/shared/i18n/messages";

export default async function TermsPage() {
  const locale = await getRequestLocale();

  return (
    <LegalDocument
      description={translate(locale, "legal.terms.description")}
      sections={[
        {
          title: translate(locale, "legal.terms.account.title"),
          text: translate(locale, "legal.terms.account.text"),
        },
        {
          title: translate(locale, "legal.terms.availability.title"),
          text: translate(locale, "legal.terms.availability.text"),
        },
        {
          title: translate(locale, "legal.terms.review.title"),
          text: translate(locale, "legal.terms.review.text"),
        },
      ]}
      title={translate(locale, "legal.terms.title")}
    />
  );
}
