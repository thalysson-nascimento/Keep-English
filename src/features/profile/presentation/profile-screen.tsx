"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { z } from "zod";
import { SignOutButton } from "@/features/auth/presentation/sign-out-button";
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
  { key: "savedWords", icon: "📘", label: "Palavras salvas" },
  { key: "currentStreak", icon: "🔥", label: "Sequência atual" },
  { key: "longestStreak", icon: "🏅", label: "Maior sequência" },
  { key: "completedTests", icon: "🎯", label: "Testes feitos" },
  { key: "averageScore", icon: "⭐", label: "Nota média" },
  { key: "dailyGoal", icon: "🚩", label: "Meta diária" },
] as const;

async function fetchProfile(signal: AbortSignal): Promise<ProfileData> {
  const response = await fetch("/api/profile", {
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw new Error(
      response.status === 401
        ? "Sua sessão expirou. Entre novamente para consultar seu perfil."
        : "Não foi possível carregar os dados do perfil.",
    );
  }

  const result: unknown = await response.json();
  const parsed = profileSchema.safeParse(result);

  if (!parsed.success) {
    throw new Error("Os dados recebidos para o perfil são inválidos.");
  }

  return parsed.data;
}

function formatEnrollmentDate(date: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
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

function ProfileSkeleton() {
  return (
    <div aria-label="Carregando perfil" className={styles.profile}>
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
          requestError.message.startsWith("Sua sessão expirou")
        ) {
          router.replace("/login");
          return;
        }

        setError(
          requestError instanceof Error
            ? requestError.message
            : "Não foi possível carregar os dados do perfil.",
        );
      });

    return () => controller.abort();
  }, [retry, router]);

  if (!profile && !error) {
    return <ProfileSkeleton />;
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
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className={styles.profile}>
      <section aria-label="Informações da conta" className={styles.hero}>
        <div aria-label={`Avatar ${profile.avatar}`} className={styles.avatar}>
          {profile.avatar}
        </div>
        <h1 className={styles.name}>{profile.name}</h1>
        <p className={styles.joined}>
          Estudando desde {formatEnrollmentDate(profile.createdAt)}
        </p>
      </section>

      <h2 className={styles.sectionTitle}>Resumo</h2>
      <section aria-label="Resumo do aprendizado" className={styles.statsGrid}>
        {profileStats.map(({ key, icon, label }) => (
          <div className={styles.statCard} key={key}>
            <span aria-hidden="true" className={styles.statIcon}>
              {icon}
            </span>
            <strong className={styles.statValue}>
              {formatStatValue(key, profile)}
            </strong>
            <span className={styles.statLabel}>{label}</span>
          </div>
        ))}
      </section>

      <SignOutButton />
    </div>
  );
}
