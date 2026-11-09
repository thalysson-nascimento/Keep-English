"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  formatTestCountdown,
  getTestCooldownRemaining,
  getTestLockReason,
  type TestAccessState,
} from "@/features/tests/domain/vocabulary-test";
import { useI18n } from "@/shared/i18n/locale-provider";
import styles from "./tests-screen.module.css";

interface TestStartButtonProps {
  access: TestAccessState & { now: number };
}

export function TestStartButton({ access }: TestStartButtonProps) {
  const { t } = useI18n();
  const [now, setNow] = useState(access.now);
  const lockReason = getTestLockReason(access, now);
  const cooldownRemaining = getTestCooldownRemaining(access.lastTestAt, now);
  const hint =
    lockReason === "words"
      ? t("testOverview.lockWords")
      : lockReason === "goal"
        ? access.goal === null
          ? t("testOverview.lockGoal")
          : t("testOverview.completeGoal", {
              today: access.todayWords,
              goal: access.goal,
            })
        : lockReason === "cooldown"
          ? t("testOverview.cooldown", {
              time: formatTestCountdown(cooldownRemaining),
            })
          : "";

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(Date.now()), 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <div className={styles.testAction}>
      {lockReason ? (
        <button className={styles.testButton} disabled type="button">
          {t("testOverview.testAction")}
        </button>
      ) : (
        <Link className={styles.testButton} href="/teste">
          {t("testOverview.testAction")}
        </Link>
      )}
      <p aria-live="polite" className={styles.testHint}>
        {hint}
      </p>
    </div>
  );
}
