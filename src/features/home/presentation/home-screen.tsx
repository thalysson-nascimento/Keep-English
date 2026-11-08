"use client";

import type { HomeData } from "@/features/home/application/get-home-data";
import {
  formatTestCountdown,
  getTestCooldownRemaining,
  getTestLockReason,
} from "@/features/tests/domain/vocabulary-test";
import type { Word } from "@/features/words/domain/word";
import {
  deleteWordAction,
  enableDailyGoalAction,
  searchWordsAction,
} from "@/features/words/presentation/actions";
import { WordFormSheet } from "@/features/words/presentation/components/word-form-sheet";
import {
  WordList,
  WordListSkeleton,
} from "@/features/words/presentation/components/word-list";
import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import styles from "./home-screen.module.css";

interface HomeScreenProps {
  initialData: HomeData;
  initialNow: number;
  lastTestAt: number | null;
}

const goalOptions = [3, 5, 10, 15, 20];

export function HomeScreen({
  initialData,
  initialNow,
  lastTestAt,
}: HomeScreenProps) {
  const router = useRouter();
  const requestId = useRef(0);
  const [now, setNow] = useState(initialNow);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Word[]>([]);
  const [createdWords, setCreatedWords] = useState<Word[]>([]);
  const [searchResultCount, setSearchResultCount] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<number | null>(() =>
    initialData.goalActive && initialData.today < initialData.goal
      ? initialData.goal
      : null,
  );
  const [isEnablingGoal, setIsEnablingGoal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(Date.now()), 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      return;
    }

    const currentRequestId = ++requestId.current;
    const timeoutId = window.setTimeout(() => {
      void searchWordsAction(normalizedQuery)
        .then((result) => {
          if (currentRequestId !== requestId.current) {
            return;
          }

          if (result.status === "invalid") {
            setError("A pesquisa deve ter até 80 caracteres.");
            return;
          }

          setSearchResults(result.words);
          setSearchResultCount(result.total);
        })
        .catch(() => {
          if (currentRequestId === requestId.current) {
            setError("Não foi possível pesquisar as palavras.");
          }
        })
        .finally(() => {
          if (currentRequestId === requestId.current) {
            setIsSearching(false);
          }
        });
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
      requestId.current += 1;
    };
  }, [query]);

  async function handleDelete(id: string) {
    setDeletingId(id);
    setError("");

    try {
      const deleted = await deleteWordAction(id);

      if (!deleted) {
        setError("Não foi possível remover a palavra.");
        return;
      }

      setCreatedWords((currentWords) =>
        currentWords.filter((word) => word.id !== id),
      );

      if (query.trim()) {
        setSearchResults((currentWords) =>
          currentWords.filter((word) => word.id !== id),
        );
        setSearchResultCount((count) => Math.max(0, count - 1));
      }

      router.refresh();
    } catch {
      setError("Não foi possível remover a palavra.");
    } finally {
      setDeletingId(null);
    }
  }

  function handleCreated(word: Word) {
    setCreatedWords((currentWords) =>
      [word, ...currentWords.filter((item) => item.id !== word.id)].slice(
        0,
        10,
      ),
    );
    setIsSheetOpen(false);
    setQuery("");
    router.refresh();
  }

  async function handleEnableGoal() {
    if (selectedGoal === null || isEnablingGoal) {
      return;
    }

    setIsEnablingGoal(true);
    setError("");

    try {
      const result = await enableDailyGoalAction(selectedGoal);

      if (result.status !== "enabled") {
        setError("Não foi possível habilitar essa meta. Escolha outra meta.");
        return;
      }

      router.refresh();
    } catch {
      setError("Não foi possível habilitar a meta diária.");
    } finally {
      setIsEnablingGoal(false);
    }
  }

  const dailyGoalLocked =
    initialData.goalActive && initialData.today < initialData.goal;
  const dailyGoalReached =
    initialData.goalActive && initialData.today >= initialData.goal;
  const testLockReason = getTestLockReason(
    {
      goal: initialData.goalActive ? initialData.goal : null,
      todayWords: initialData.today,
      wordCount: initialData.total,
      lastTestAt,
    },
    now,
  );
  const testCooldownRemaining = getTestCooldownRemaining(lastTestAt, now);
  const testHint =
    testLockReason === "words"
      ? "Anote palavras para liberar o teste"
      : testLockReason === "goal"
        ? initialData.goalActive
          ? `Conclua sua meta diária para liberar o teste (${initialData.today}/${initialData.goal}).`
          : "Defina e conclua sua meta diária para liberar o teste."
        : testLockReason === "cooldown"
          ? `⏳ Próximo teste liberado em ${formatTestCountdown(testCooldownRemaining)}`
          : "";
  const progressGoal = initialData.goalActive
    ? initialData.goal
    : (selectedGoal ?? 5);
  const chartGoal =
    dailyGoalReached && selectedGoal !== null ? selectedGoal : progressGoal;
  const progressPercent = Math.min(
    100,
    Math.round((initialData.today / progressGoal) * 100),
  );
  const canEnableGoal =
    selectedGoal !== null &&
    !dailyGoalLocked &&
    (dailyGoalReached
      ? selectedGoal > initialData.goal && selectedGoal >= initialData.today
      : selectedGoal >= initialData.today);
  const goalMessage = dailyGoalLocked
    ? `Meta de ${initialData.goal} ativa. Faltam ${initialData.goal - initialData.today} palavra(s) para liberar outras metas.`
    : dailyGoalReached
      ? initialData.goal === goalOptions[goalOptions.length - 1]
        ? "Meta máxima concluída! 🎉 Volte amanhã para uma nova meta."
        : "Meta concluída! 🎉 Escolha uma meta maior para continuar anotando."
      : "Escolha uma meta e clique em habilitar para liberar o botão de anotar palavras.";
  const addWordLabel = !initialData.goalActive
    ? "🔒 Defina a meta diária"
    : dailyGoalReached
      ? initialData.goal === goalOptions[goalOptions.length - 1]
        ? "🎉 Meta máxima batida hoje"
        : "🔒 Escolha a nova meta diária"
      : "+ Anotar palavra";
  const visibleWords = query.trim()
    ? searchResults
    : [
        ...createdWords,
        ...initialData.recentWords.filter(
          (word) => !createdWords.some((created) => created.id === word.id),
        ),
      ].slice(0, 10);
  const resultCount = query.trim() ? searchResultCount : initialData.total;
  const listEmptyMessage = query.trim()
    ? "Nenhuma palavra encontrada."
    : "Nenhuma palavra ainda. Toque em “Anotar palavra” para começar!";
  const chartScale = Math.max(
    1,
    ...initialData.days.map((day) => day.count),
    ...initialData.days.slice(0, 6).map((day) => day.goal),
  );
  const chartDays = initialData.days.map((day, index) => {
    const goal = index === initialData.days.length - 1 ? chartGoal : day.goal;

    return { ...day, goal, hit: day.count >= goal };
  });

  return (
    <div className={styles.home}>
      <p className={styles.greeting}>{initialData.greeting}</p>

      <section aria-label="Resumo das palavras" className={styles.hero}>
        <small>PALAVRAS ANOTADAS</small>
        <div className={styles.total}>
          <strong>{initialData.total}</strong>
          <span>no total</span>
        </div>
        <div className={styles.progressTrack}>
          <div
            className={styles.progressFill}
            style={{
              width: `${Math.max(progressPercent, initialData.today ? 6 : 0)}%`,
            }}
          />
        </div>
        <div className={styles.progressCaption}>
          <span>
            {initialData.today} de {progressGoal} hoje
          </span>
          <span>{progressPercent}%</span>
        </div>
        <div className={styles.stats}>
          <div>
            <strong>{initialData.today}</strong>
            <span>Hoje</span>
          </div>
          <div>
            <strong>{initialData.streak}</strong>
            <span>Sequência</span>
          </div>
          <div>
            <strong>{initialData.week}</strong>
            <span>Semana</span>
          </div>
        </div>
      </section>

      <div className={styles.testRow}>
        {testLockReason === null ? (
          <Link className={styles.testButton} href="/teste">
            🎯 Fazer teste
          </Link>
        ) : (
          <button className={styles.testButton} disabled type="button">
            🎯 Fazer teste
          </button>
        )}
      </div>
      {testHint && <p className={styles.testHint}>{testHint}</p>}

      <section aria-labelledby="goal-title" className={styles.section}>
        <h2 id="goal-title">Meta diária</h2>
        <div className={styles.card}>
          <p className={styles.goalPrompt}>
            Quantas palavras você quer anotar por dia?
          </p>
          <div className={styles.goalOptions}>
            {goalOptions.map((goal) => {
              const isLockedGoalOption =
                dailyGoalLocked &&
                goal !== initialData.goal &&
                goal !== initialData.today;
              const disabled = goal < initialData.today || isLockedGoalOption;

              return (
                <button
                  aria-pressed={selectedGoal === goal}
                  className={`${styles.goalOption} ${
                    selectedGoal === goal ? styles.selectedGoal : ""
                  } ${
                    dailyGoalReached && goal === initialData.goal
                      ? styles.completedGoal
                      : ""
                  }`}
                  disabled={disabled}
                  key={goal}
                  onClick={() => setSelectedGoal(goal)}
                  type="button"
                >
                  {goal}
                </button>
              );
            })}
          </div>
          <button
            className={styles.enableGoal}
            disabled={!canEnableGoal || isEnablingGoal}
            onClick={() => void handleEnableGoal()}
            type="button"
          >
            {isEnablingGoal
              ? "Habilitando..."
              : dailyGoalLocked
                ? "Meta ativa ✓"
                : "Habilitar meta diária"}
          </button>
          <p aria-live="polite" className={styles.goalMessage}>
            {goalMessage}
          </p>
        </div>
      </section>

      <section aria-labelledby="evolution-title" className={styles.section}>
        <h2 id="evolution-title">Sua evolução</h2>
        <div className={`${styles.card} ${styles.chart}`}>
          {chartDays.map((day, index) => {
            const date = new Date(`${day.date}T12:00:00`);
            const weekday = new Intl.DateTimeFormat("pt-BR", {
              weekday: "narrow",
            }).format(date);
            const isToday = index === chartDays.length - 1;
            const height = isToday
              ? Math.min(100, Math.round((day.count / day.goal) * 100))
              : Math.round((day.count / chartScale) * 100);

            return (
              <div className={styles.chartColumn} key={day.date}>
                <div
                  className={`${styles.flameCount} ${
                    day.hit ? "" : styles.inactiveFlame
                  }`}
                >
                  <span aria-hidden="true">🔥</span>
                  <strong>{day.count}</strong>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={[
                      styles.bar,
                      day.hit ? styles.hitBar : "",
                      isToday ? styles.today : "",
                    ].join(" ")}
                    style={{ height: `${height}%` }}
                    title={
                      isToday
                        ? `${day.count} de ${day.goal} palavras da meta`
                        : `${day.count} palavras`
                    }
                  />
                </div>
                <small>{weekday}</small>
              </div>
            );
          })}
        </div>
      </section>

      <section
        aria-labelledby="words-title"
        className={`${styles.section} ${styles.wordSection}`}
      >
        <div className={styles.sectionHeading}>
          <h2 id="words-title">
            {query.trim() ? "Resultados da busca" : "Últimas palavras"}
          </h2>
          <span>
            {resultCount} {resultCount === 1 ? "palavra" : "palavras"}
          </span>
        </div>

        <label className={styles.search} htmlFor="word-search">
          <Search aria-hidden="true" />
          <input
            autoComplete="off"
            id="word-search"
            maxLength={80}
            onChange={(event) => {
              const nextQuery = event.target.value;
              setQuery(nextQuery);
              setIsSearching(Boolean(nextQuery.trim()));
              setError("");
            }}
            placeholder="Pesquisar palavra ou tradução"
            value={query}
          />
        </label>

        {error && (
          <p aria-live="polite" className={styles.error}>
            {error}
          </p>
        )}

        <div aria-busy={isSearching} className={styles.card}>
          {isSearching ? (
            <WordListSkeleton />
          ) : (
            <WordList
              deletingId={deletingId}
              emptyMessage={listEmptyMessage}
              onDelete={handleDelete}
              words={visibleWords}
            />
          )}
        </div>

        {!query.trim() &&
          initialData.total > initialData.recentWords.length && (
            <Link className={styles.moreWords} href="/palavras">
              Ver mais palavras →
            </Link>
          )}
      </section>

      <div className={styles.fab}>
        <button
          disabled={!initialData.goalActive || dailyGoalReached}
          onClick={() => setIsSheetOpen(true)}
          type="button"
        >
          {addWordLabel}
        </button>
      </div>
      {isSheetOpen && (
        <WordFormSheet
          onClose={() => setIsSheetOpen(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
