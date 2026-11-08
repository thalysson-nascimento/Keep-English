"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  formatTestCountdown,
  getTestCooldownRemaining,
  getTestLockReason,
  type TestAccessState,
} from "@/features/tests/domain/vocabulary-test";
import styles from "./tests-screen.module.css";

interface TestStartButtonProps {
  access: TestAccessState & { now: number };
}

export function TestStartButton({ access }: TestStartButtonProps) {
  const [now, setNow] = useState(access.now);
  const lockReason = getTestLockReason(access, now);
  const cooldownRemaining = getTestCooldownRemaining(access.lastTestAt, now);
  const hint =
    lockReason === "words"
      ? "Anote palavras para liberar o teste"
      : lockReason === "goal"
        ? access.goal === null
          ? "Defina e conclua sua meta diária para liberar o teste."
          : `Conclua sua meta diária (${access.todayWords}/${access.goal}) para liberar o teste.`
        : lockReason === "cooldown"
          ? `⏳ Próximo teste liberado em ${formatTestCountdown(cooldownRemaining)}`
          : "";

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(Date.now()), 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <div className={styles.testAction}>
      {lockReason ? (
        <button className={styles.testButton} disabled type="button">
          🎯 Fazer teste
        </button>
      ) : (
        <Link className={styles.testButton} href="/teste">
          🎯 Fazer teste
        </Link>
      )}
      <p aria-live="polite" className={styles.testHint}>
        {hint}
      </p>
    </div>
  );
}
