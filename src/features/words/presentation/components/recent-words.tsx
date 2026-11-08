"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Word } from "@/features/words/domain/word";
import { deleteWordAction } from "@/features/words/presentation/actions";
import { WordList } from "./word-list";
import styles from "./words-screen.module.css";

interface RecentWordsProps {
  initialWords: Word[];
  total: number;
}

export function RecentWords({ initialWords, total }: RecentWordsProps) {
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
        setError("Não foi possível remover a palavra.");
        return;
      }

      setWords((currentWords) => currentWords.filter((word) => word.id !== id));
      router.refresh();
    } catch {
      setError("Não foi possível remover a palavra.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <div className={styles.card}>
        <WordList
          deletingId={deletingId}
          emptyMessage="Nenhuma palavra ainda."
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
          Ver todas as palavras
        </Link>
      )}
    </>
  );
}
