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
import { useI18n } from "@/shared/i18n/locale-provider";
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
  const { locale, t } = useI18n();
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
            setError(t("home.words.searchError"));
            return;
          }

          setSearchResults(result.words);
          setSearchResultCount(result.total);
        })
        .catch(() => {
          if (currentRequestId === requestId.current) {
            setError(t("home.words.searchFailed"));
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
  }, [query, t]);

  async function handleDelete(id: string) {
    setDeletingId(id);
    setError("");

    try {
      const deleted = await deleteWordAction(id);

      if (!deleted) {
        setError(t("home.words.removeFailed"));
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
      setError(t("home.words.removeFailed"));
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
        setError(t("home.goal.enableError"));
        return;
      }

      router.refresh();
    } catch {
      setError(t("home.goal.dailyEnableError"));
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
      goal: initialData.latestCompletedGoal,
      todayWords: initialData.today,
      wordCount: initialData.total,
      lastTestAt,
    },
    now,
  );
  const testCooldownRemaining = getTestCooldownRemaining(lastTestAt, now);
  const testHint =
    testLockReason === "words"
      ? t("home.test.addWords")
      : testLockReason === "goal"
        ? initialData.goalActive
          ? t("home.test.completeGoal", {
              today: initialData.today,
              goal: initialData.goal,
            })
          : t("home.test.setGoal")
        : testLockReason === "cooldown"
          ? t("home.test.cooldown", {
              time: formatTestCountdown(testCooldownRemaining),
            })
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
    ? t("home.goal.active", {
        goal: initialData.goal,
        remaining: initialData.goal - initialData.today,
      })
    : dailyGoalReached
      ? initialData.goal === goalOptions[goalOptions.length - 1]
        ? t("home.goal.maximum")
        : t("home.goal.completed")
      : t("home.goal.choose");
  const addWordLabel = !initialData.goalActive
    ? t("home.add.defineGoal")
    : dailyGoalReached
      ? initialData.goal === goalOptions[goalOptions.length - 1]
        ? t("home.add.goalReachedMax")
        : t("home.add.chooseGoal")
      : t("home.add.word");
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
    ? t("home.words.noneFound")
    : t("home.words.noneYet");
  const greeting =
    initialData.greetingPeriod === "morning"
      ? t("home.greeting.morning")
      : initialData.greetingPeriod === "afternoon"
        ? t("home.greeting.afternoon")
        : t("home.greeting.evening");
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
      <p className={styles.greeting}>
        {initialData.goalReached
          ? t("home.greeting.goalReached")
          : `${greeting}! `}
        {!initialData.goalReached && t("home.greeting.prompt")}
      </p>

      <section aria-label={t("home.summary.aria")} className={styles.hero}>
        <small>{t("home.summary.label")}</small>
        <div className={styles.total}>
          <strong>{initialData.total}</strong>
          <span>{t("home.summary.total")}</span>
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
            {t("home.evolution.dayGoal", {
              count: initialData.today,
              goal: progressGoal,
            })}
          </span>
          <span>{progressPercent}%</span>
        </div>
        <div className={styles.stats}>
          <div>
            <strong>{initialData.today}</strong>
            <span>{t("home.summary.today")}</span>
          </div>
          <div>
            <strong>{initialData.streak}</strong>
            <span>{t("home.summary.streak")}</span>
          </div>
          <div>
            <strong>{initialData.week}</strong>
            <span>{t("home.summary.week")}</span>
          </div>
        </div>
      </section>

      <div className={styles.testRow}>
        {testLockReason === null ? (
          <Link className={styles.testButton} href="/teste">
            {t("home.test.start")}
          </Link>
        ) : (
          <button className={styles.testButton} disabled type="button">
            {t("home.test.start")}
          </button>
        )}
      </div>
      {testHint && <p className={styles.testHint}>{testHint}</p>}

      <section aria-labelledby="goal-title" className={styles.section}>
        <h2 id="goal-title">{t("home.goal.title")}</h2>
        <div className={styles.card}>
          <p className={styles.goalPrompt}>{t("home.goal.prompt")}</p>
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
              ? t("home.goal.enabling")
              : dailyGoalLocked
                ? t("home.goal.enabled")
                : t("home.goal.enable")}
          </button>
          <p aria-live="polite" className={styles.goalMessage}>
            {goalMessage}
          </p>
        </div>
      </section>

      <section aria-labelledby="evolution-title" className={styles.section}>
        <h2 id="evolution-title">{t("home.evolution.title")}</h2>
        <div className={`${styles.card} ${styles.chart}`}>
          {chartDays.map((day, index) => {
            const date = new Date(`${day.date}T12:00:00`);
            const weekday = new Intl.DateTimeFormat(
              locale === "en" ? "en-US" : "pt-BR",
              {
                weekday: "narrow",
              },
            ).format(date);
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
                        ? t("home.evolution.dayGoal", {
                            count: day.count,
                            goal: day.goal,
                          })
                        : t("home.evolution.dayCount", { count: day.count })
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
            {query.trim() ? t("home.words.results") : t("home.words.recent")}
          </h2>
          <span>
            {resultCount === 1
              ? t("common.countWord", { count: resultCount })
              : t("common.countWords", { count: resultCount })}
          </span>
        </div>

        <label
          aria-label={t("home.words.searchPlaceholder")}
          className={styles.search}
          htmlFor="word-search"
        >
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
            placeholder={t("home.words.searchPlaceholder")}
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
              {t("home.words.more")}
            </Link>
          )}
      </section>

      <div className={styles.fab}>
        <button
          aria-label={t("home.add.aria")}
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
