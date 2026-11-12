"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Word } from "@/features/words/domain/word";
import { deleteWordAction } from "@/features/words/presentation/actions";
import { useI18n } from "@/shared/i18n/locale-provider";
import { WordList } from "./word-list";
import styles from "./words-screen.module.css";

interface RecentWordsProps {
  initialWords: Word[];
  total: number;
}

export function RecentWords({ initialWords, total }: RecentWordsProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [words, setWords] = useState(initialWords);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleDelete(id: string) {
    setDeletingId(id);
    setError("");

    try {
      const deleted = await deleteWordAction(id);

      if (!deleted) {
        setError(t("home.words.removeFailed"));
        return;
      }

      setWords((currentWords) => currentWords.filter((word) => word.id !== id));
      router.refresh();
    } catch {
      setError(t("home.words.removeFailed"));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <div className={styles.card}>
        <WordList
          deletingId={deletingId}
          emptyMessage={t("words.recent.none")}
          onDelete={handleDelete}
          words={words}
        />
      </div>
      {error && (
        <p aria-live="polite" className={styles.error}>
          {error}
        </p>
      )}
      {total > 0 && (
        <Link className={styles.allWordsButton} href="/palavras/todas">
          {t("words.recent.all")}
        </Link>
      )}
    </>
  );
}
