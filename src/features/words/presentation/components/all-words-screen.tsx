"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { Word } from "@/features/words/domain/word";
import {
  notifyAccountDataChanged,
  requestApiJson,
  requestApiVoid,
} from "@/shared/lib/api-client";
import { wordsPageResponseSchema } from "@/features/words/application/words-api.schema";
import { WordList } from "./word-list";
import { useI18n } from "@/shared/i18n/locale-provider";
import styles from "./all-words-screen.module.css";

const wordsPageSize = 15;

export function AllWordsScreen() {
  const { t } = useI18n();
  const screenRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const requestId = useRef(0);
  const appendRequestInFlight = useRef(false);
  const [query, setQuery] = useState("");
  const [words, setWords] = useState<Word[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
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
        const searchParams = new URLSearchParams({
          query: nextQuery,
          offset: String(offset),
          limit: String(wordsPageSize),
        });
        const result = await requestApiJson(
          `/api/words?${searchParams}`,
          wordsPageResponseSchema,
          { cache: "no-store" },
        );

        if (currentRequestId !== requestId.current) {
          return;
        }

        setWords((currentWords) =>
          replace ? result.words : [...currentWords, ...result.words],
        );
        setTotal(result.total);
        setHasMore(result.hasMore);
      } catch {
        if (currentRequestId === requestId.current) {
          setError(t("words.all.failed"));
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
    [t],
  );

  useEffect(() => {
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
      await requestApiVoid(`/api/words/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      setWords((currentWords) => currentWords.filter((word) => word.id !== id));
      setTotal((currentTotal) => Math.max(0, currentTotal - 1));
      notifyAccountDataChanged();
      await loadPage(query.trim(), 0, true);
    } catch {
      setError(t("words.all.removeFailed"));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className={styles.screen} ref={screenRef}>
      <div className={styles.wrap}>
        <header className={styles.header}>
          <Link
            aria-label={t("words.all.back")}
            className={styles.back}
            href="/palavras"
          >
            ←
          </Link>
          <h1>{t("words.all.title")}</h1>
          <span className={styles.count}>
            {total === 1
              ? t("words.all.countWord", { count: total })
              : t("words.all.countWords", { count: total })}
          </span>
        </header>

        <label className={styles.search} htmlFor="all-words-search">
          <Search aria-hidden="true" />
          <input
            aria-label={t("words.all.search")}
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
            placeholder={`🔍  ${t("words.all.search")}`}
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
            <div aria-label={t("common.loadingWords")} role="status">
              {[0, 1, 2].map((item) => (
                <div className={styles.skeletonWord} key={item} />
              ))}
            </div>
          ) : (
            <WordList
              deletingId={deletingId}
              emptyMessage={t("words.all.none")}
              onDelete={handleDelete}
              words={words}
            />
          )}
        </div>

        {hasMore && (
          <div
            aria-label={t("words.all.loadMore")}
            className={styles.loadMore}
            ref={sentinelRef}
            role="status"
          >
            {isLoading ? (
              <span className={styles.loadingLabel}>{t("common.loading")}</span>
            ) : (
              <span />
            )}
          </div>
        )}
        {!hasMore && total > 0 && (
          <p className={styles.endMessage}>{t("words.all.end")}</p>
        )}
      </div>
    </div>
  );
}
