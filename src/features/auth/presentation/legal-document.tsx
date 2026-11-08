import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import styles from "./legal-document.module.css";

interface LegalDocumentProps {
  title: string;
  description: string;
  sections: Array<{ title: string; text: string }>;
}

export function LegalDocument({
  title,
  description,
  sections,
}: LegalDocumentProps) {
  return (
    <main className={styles.screen}>
      <Link
        aria-label="Voltar ao cadastro"
        className={styles.back}
        href="/registro"
      >
        <ArrowLeft aria-hidden="true" />
      </Link>
      <h1>{title}</h1>
      <p className={styles.notice}>
        Documento inicial do projeto. Precisa de revisão antes da publicação
        definitiva.
      </p>
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
