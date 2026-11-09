"use client";

import { X } from "lucide-react";
import type { Word } from "@/features/words/domain/word";
import { useI18n } from "@/shared/i18n/locale-provider";
import styles from "./word-list.module.css";

interface WordListProps {
  words: Word[];
  deletingId: string | null;
  onDelete: (id: string) => void;
  emptyMessage: string;
}

export function WordList({
  words,
  deletingId,
  onDelete,
  emptyMessage,
}: WordListProps) {
  const { t } = useI18n();

  if (words.length === 0) {
    return (
      <div className={styles.empty}>
        <span aria-hidden="true">🌱</span>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ul className={styles.list}>
      {words.map((word) => (
        <li className={styles.word} key={word.id}>
          <span className={styles.icon} aria-hidden="true">
            💬
          </span>
          <div className={styles.details}>
            <strong>{word.word}</strong>
            <span>{word.translation}</span>
            {word.example && <q>{word.example}</q>}
          </div>
          <button
            aria-label={t("word.remove", { word: word.word })}
            className={styles.delete}
            disabled={deletingId === word.id}
            onClick={() => onDelete(word.id)}
            type="button"
          >
            <X aria-hidden="true" />
          </button>
        </li>
      ))}
    </ul>
  );
}

export function WordListSkeleton() {
  const { t } = useI18n();

  return (
    <div
      aria-label={t("common.loadingWords")}
      className={styles.skeletonList}
      role="status"
    >
      {[0, 1, 2].map((item) => (
        <div className={styles.skeletonWord} key={item} />
      ))}
    </div>
  );
}
