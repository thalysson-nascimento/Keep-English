import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getRequestLocale } from "@/shared/i18n/server";
import { translate } from "@/shared/i18n/messages";
import styles from "./legal-document.module.css";

interface LegalDocumentProps {
  title: string;
  description: string;
  sections: Array<{ title: string; text: string }>;
}

export async function LegalDocument({
  title,
  description,
  sections,
}: LegalDocumentProps) {
  const locale = await getRequestLocale();

  return (
    <main className={styles.screen}>
      <Link
        aria-label={translate(locale, "auth.legal.back")}
        className={styles.back}
        href="/registro"
      >
        <ArrowLeft aria-hidden="true" />
      </Link>
      <h1>{title}</h1>
      <p className={styles.notice}>{translate(locale, "auth.legal.notice")}</p>
      <p>{description}</p>
      {sections.map((section) => (
        <section key={section.title}>
          <h2>{section.title}</h2>
          <p>{section.text}</p>
        </section>
      ))}
    </main>
  );
}
