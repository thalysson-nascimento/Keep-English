"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { Word } from "@/features/words/domain/word";
import {
  deleteWordAction,
  getWordsPageAction,
} from "@/features/words/presentation/actions";
import { WordList } from "./word-list";
import styles from "./all-words-screen.module.css";

interface AllWordsScreenProps {
  initialWords: Word[];
  initialTotal: number;
  initialHasMore: boolean;
}

export function AllWordsScreen({
  initialWords,
  initialTotal,
  initialHasMore,
}: AllWordsScreenProps) {
  const screenRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const requestId = useRef(0);
  const appendRequestInFlight = useRef(false);
  const [query, setQuery] = useState("");
  const previousQuery = useRef(query);
  const [words, setWords] = useState(initialWords);
  const [total, setTotal] = useState(initialTotal);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadPage = useCallback(
    async (nextQuery: string, offset: number, replace: boolean) => {
      if (!replace && appendRequestInFlight.current) {
        return;
      }

      const currentRequestId = replace
        ? ++requestId.current
        : requestId.current;

      if (!replace) {
        appendRequestInFlight.current = true;
      }

      setIsLoading(true);
      setError("");

      try {
        const result = await getWordsPageAction({
          query: nextQuery,
          offset,
        });

        if (currentRequestId !== requestId.current) {
          return;
        }

        if (result.status !== "ok") {
          setError("Não foi possível carregar as palavras.");
          return;
        }

        setWords((currentWords) =>
          replace ? result.words : [...currentWords, ...result.words],
        );
        setTotal(result.total);
        setHasMore(result.hasMore);
      } catch {
        if (currentRequestId === requestId.current) {
          setError("Não foi possível carregar as palavras.");
        }
      } finally {
        if (!replace) {
          appendRequestInFlight.current = false;
        }

        if (currentRequestId === requestId.current) {
          setIsLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    if (previousQuery.current === query) {
      return;
    }

    previousQuery.current = query;
    const timeoutId = window.setTimeout(() => {
      void loadPage(query.trim(), 0, true);
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
      requestId.current += 1;
    };
  }, [loadPage, query]);

  useEffect(() => {
    const root = screenRef.current;
    const sentinel = sentinelRef.current;

    if (!root || !sentinel || !hasMore || isLoading) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void loadPage(query.trim(), words.length, false);
        }
      },
      { root, rootMargin: "160px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoading, loadPage, query, words.length]);

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
      setTotal((currentTotal) => Math.max(0, currentTotal - 1));
      await loadPage(query.trim(), 0, true);
    } catch {
      setError("Não foi possível remover a palavra.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className={styles.screen} ref={screenRef}>
      <div className={styles.wrap}>
        <header className={styles.header}>
          <Link
            aria-label="Voltar para palavras"
            className={styles.back}
            href="/palavras"
          >
            ←
          </Link>
          <h1>Todas as palavras</h1>
          <span className={styles.count}>
            {total} {total === 1 ? "palavra" : "palavras"}
          </span>
        </header>

        <label className={styles.search} htmlFor="all-words-search">
          <Search aria-hidden="true" />
          <input
            autoComplete="off"
            id="all-words-search"
            maxLength={80}
            onChange={(event) => {
              const nextQuery = event.target.value;
              requestId.current += 1;
              setQuery(nextQuery);
              setIsLoading(true);
              setError("");
            }}
            placeholder="🔍  Pesquisar palavra ou tradução"
            value={query}
          />
        </label>

        {error && (
          <p aria-live="polite" className={styles.error}>
            {error}
          </p>
        )}

        <div aria-busy={isLoading} className={styles.card}>
          {isLoading ? (
            <div aria-label="Carregando palavras" role="status">
              {[0, 1, 2].map((item) => (
                <div className={styles.skeletonWord} key={item} />
              ))}
            </div>
          ) : (
            <WordList
              deletingId={deletingId}
              emptyMessage="Nenhuma palavra encontrada."
              onDelete={handleDelete}
              words={words}
            />
          )}
        </div>

        {hasMore && (
          <div
            aria-label="Carregando mais palavras"
            className={styles.loadMore}
            ref={sentinelRef}
            role="status"
          >
            {isLoading ? (
              <span className={styles.loadingLabel}>Carregando...</span>
            ) : (
              <span />
            )}
          </div>
        )}
        {!hasMore && total > 0 && (
          <p className={styles.endMessage}>Você chegou ao fim 🎉</p>
        )}
      </div>
    </div>
  );
}
