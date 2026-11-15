import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getRequestLocale } from "@/shared/i18n/server";
import { translate } from "@/shared/i18n/messages";
import legalContent from "@/features/auth/content/legal-documents.json";
import styles from "./legal-document.module.css";

interface LegalDocumentProps {
  documentKey: keyof typeof legalContent.documents;
}

export async function LegalDocument({ documentKey }: LegalDocumentProps) {
  const locale = await getRequestLocale();
  const document = legalContent.documents[documentKey];

  return (
    <article className={styles.screen} lang="pt-BR">
      <Link
        aria-label={translate(locale, "auth.legal.back")}
        className={styles.back}
        href="/registro"
      >
        <ArrowLeft aria-hidden="true" />
      </Link>
      <h1>{document.title}</h1>
      <p className={styles.meta}>
        Versão {legalContent.version} · {legalContent.date}
      </p>
      <p>{document.intro}</p>
      <nav aria-label="Nesta página" className={styles.index}>
        <strong>Nesta página</strong>
        <ol>
          {document.sections.map(([title], index) => (
            <li key={title}>
              <a href={`#${documentKey}-${index + 1}`}>{title}</a>
            </li>
          ))}
        </ol>
      </nav>
      {document.sections.map(([title, text], index) => (
        <section id={`${documentKey}-${index + 1}`} key={title}>
          <h2>{title}</h2>
          <p>{text}</p>
        </section>
      ))}
      {documentKey === "privacidade" && (
        <p>
          <a href={legalContent.googlePrivacy.href}>
            {legalContent.googlePrivacy.label}
          </a>
          .
        </p>
      )}
    </article>
  );
}
