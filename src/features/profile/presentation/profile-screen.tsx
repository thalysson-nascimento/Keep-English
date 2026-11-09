"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { z } from "zod";
import { SignOutButton } from "@/features/auth/presentation/sign-out-button";
import { getIntlLocale } from "@/shared/i18n/config";
import { useI18n } from "@/shared/i18n/locale-provider";
import styles from "./profile-screen.module.css";

const profileSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  avatar: z.string(),
  createdAt: z.string().datetime(),
  savedWords: z.number().int().nonnegative(),
  currentStreak: z.number().int().nonnegative(),
  longestStreak: z.number().int().nonnegative(),
  completedTests: z.number().int().nonnegative(),
  averageScore: z.number().int().min(0).max(100).nullable(),
  dailyGoal: z.number().int().positive(),
});

type ProfileData = z.infer<typeof profileSchema>;

const profileStats = [
  { key: "savedWords", icon: "📘", label: "profile.savedWords" },
  { key: "currentStreak", icon: "🔥", label: "profile.currentStreak" },
  { key: "longestStreak", icon: "🏅", label: "profile.longestStreak" },
  { key: "completedTests", icon: "🎯", label: "profile.completedTests" },
  { key: "averageScore", icon: "⭐", label: "profile.averageScore" },
  { key: "dailyGoal", icon: "🚩", label: "profile.dailyGoal" },
] as const;

async function fetchProfile(signal: AbortSignal): Promise<ProfileData> {
  const response = await fetch("/api/profile", {
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw new Error(
      response.status === 401 ? "session-expired" : "load-failed",
    );
  }

  const result: unknown = await response.json();
  const parsed = profileSchema.safeParse(result);

  if (!parsed.success) {
    throw new Error("invalid-data");
  }

  return parsed.data;
}

function formatEnrollmentDate(date: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    timeZone: "America/Sao_Paulo",
    year: "numeric",
  }).format(new Date(date));
}

function formatStatValue(
  key: (typeof profileStats)[number]["key"],
  profile: ProfileData,
): string {
  if (key === "averageScore") {
    return profile.averageScore === null ? "—" : `${profile.averageScore}%`;
  }

  return String(profile[key]);
}

function ProfileSkeleton({ label }: { label: string }) {
  return (
    <div aria-label={label} className={styles.profile}>
      <div className={`${styles.card} ${styles.heroSkeleton}`} />
      <div className={styles.skeletonHeading} />
      <div className={styles.statsGrid}>
        {profileStats.map(({ key }) => (
          <div className={`${styles.card} ${styles.statSkeleton}`} key={key} />
        ))}
      </div>
    </div>
  );
}

export function ProfileScreen() {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    void fetchProfile(controller.signal)
      .then(setProfile)
      .catch((requestError: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        if (
          requestError instanceof Error &&
          requestError.message === "session-expired"
        ) {
          router.replace("/login");
          return;
        }

        const errorMessage =
          requestError instanceof Error &&
          requestError.message === "invalid-data"
            ? t("profile.invalidData")
            : t("profile.loadFailed");
        setError(errorMessage);
      });

    return () => controller.abort();
  }, [retry, router, t]);

  if (!profile && !error) {
    return <ProfileSkeleton label={t("common.loadingProfile")} />;
  }

  if (!profile) {
    return (
      <div className={styles.errorState} role="alert">
        <p>{error}</p>
        <button
          onClick={() => {
            setError("");
            setRetry((count) => count + 1);
          }}
          type="button"
        >
          {t("profile.retry")}
        </button>
      </div>
    );
  }

  return (
    <div className={styles.profile}>
      <section aria-label={t("profile.account")} className={styles.hero}>
        <div
          aria-label={t("profile.avatar", { avatar: profile.avatar })}
          className={styles.avatar}
        >
          {profile.avatar}
        </div>
        <h1 className={styles.name}>{profile.name}</h1>
        <p className={styles.joined}>
          {t("profile.studyingSince", {
            date: formatEnrollmentDate(
              profile.createdAt,
              getIntlLocale(locale),
            ),
          })}
        </p>
      </section>

      <h2 className={styles.sectionTitle}>{t("profile.summary")}</h2>
      <section
        aria-label={t("profile.summaryAria")}
        className={styles.statsGrid}
      >
        {profileStats.map(({ key, icon, label }) => (
          <div className={styles.statCard} key={key}>
            <span aria-hidden="true" className={styles.statIcon}>
              {icon}
            </span>
            <strong className={styles.statValue}>
              {formatStatValue(key, profile)}
            </strong>
            <span className={styles.statLabel}>{t(label)}</span>
          </div>
        ))}
      </section>

      <SignOutButton />
    </div>
  );
}
