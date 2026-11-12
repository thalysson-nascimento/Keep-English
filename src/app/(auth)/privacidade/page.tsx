import { LegalDocument } from "@/features/auth/presentation/legal-document";
import { getRequestLocale } from "@/shared/i18n/server";
import { translate } from "@/shared/i18n/messages";

export default async function PrivacyPage() {
  const locale = await getRequestLocale();

  return (
    <LegalDocument
      description={translate(locale, "legal.privacy.description")}
      sections={[
        {
          title: translate(locale, "legal.privacy.account.title"),
          text: translate(locale, "legal.privacy.account.text"),
        },
        {
          title: translate(locale, "legal.privacy.learning.title"),
          text: translate(locale, "legal.privacy.learning.text"),
        },
        {
          title: translate(locale, "legal.privacy.storage.title"),
          text: translate(locale, "legal.privacy.storage.text"),
        },
      ]}
      title={translate(locale, "legal.privacy.title")}
    />
  );
}
