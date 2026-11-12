"use client";

import Link from "next/link";
import { useState } from "react";
import type { Word } from "@/features/words/domain/word";
import {
  notifyAccountDataChanged,
  requestApiVoid,
} from "@/shared/lib/api-client";
import { useI18n } from "@/shared/i18n/locale-provider";
import { WordList } from "./word-list";
import styles from "./words-screen.module.css";

interface RecentWordsProps {
  initialWords: Word[];
  total: number;
}

export function RecentWords({ initialWords, total }: RecentWordsProps) {
  const { t } = useI18n();
  const [words, setWords] = useState(initialWords);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleDelete(id: string) {
    setDeletingId(id);
    setError("");

    try {
      await requestApiVoid(`/api/words/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      setWords((currentWords) => currentWords.filter((word) => word.id !== id));
      notifyAccountDataChanged();
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
