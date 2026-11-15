"use client";

import { useRef, useState } from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useI18n } from "@/shared/i18n/locale-provider";
import { requestApiJson } from "@/shared/lib/api-client";
import {
  isRewardedAdSupported,
  showRewardedAd,
} from "@/features/tests/infrastructure/browser-rewarded-ad";
import styles from "./rewarded-test-button.module.css";

const requestSchema = z.object({
  requestId: z.string().uuid(),
  granted: z.boolean(),
});
const statusSchema = z.object({ status: z.enum(["granted", "pending"]) });

async function waitForVerification(requestId: string): Promise<boolean> {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const result = await requestApiJson(
      `/api/tests/reward?requestId=${encodeURIComponent(requestId)}`,
      statusSchema,
      { cache: "no-store" },
    );
    if (result.status === "granted") return true;
    await new Promise((resolve) => window.setTimeout(resolve, 2000));
  }
  return false;
}

export function RewardedTestButton({ onGranted }: { onGranted?: () => void }) {
  const { t } = useI18n();
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const busy = useRef(false);
  const [isWatching, setIsWatching] = useState(false);
  const [error, setError] = useState("");

  async function watch() {
    if (busy.current) return;
    if (!isRewardedAdSupported()) {
      setError(t("test.reward.unavailable"));
      return;
    }
    busy.current = true;
    setIsWatching(true);
    setError("");
    try {
      const request = await requestApiJson("/api/tests/reward", requestSchema, {
        method: "POST",
      });
      if (!request.granted) {
        const earned = await showRewardedAd(request.requestId);
        if (!earned) {
          setError(t("test.reward.incomplete"));
          return;
        }
        if (!(await waitForVerification(request.requestId))) {
          setError(t("test.reward.pending"));
          return;
        }
      }
      // The destination loads access from the server, not from the native event.
      if (onGranted) onGranted();
      else router.push("/teste");
    } catch {
      setError(t("test.reward.failed"));
    } finally {
      busy.current = false;
      setIsWatching(false);
    }
  }

  return (
    <>
      <button
        className={styles.trigger}
        type="button"
        onClick={() => {
          setError("");
          dialog.current?.showModal();
        }}
      >
        {t("test.reward.open")}
      </button>
      <dialog
        ref={dialog}
        className={styles.dialog}
        aria-label={t("test.reward.title")}
        onCancel={(event) => {
          if (busy.current) event.preventDefault();
        }}
      >
        <h2>{t("test.reward.title")}</h2>
        <p>{t("test.reward.description")}</p>
        {error && <p role="alert">{error}</p>}
        <div className={styles.actions} aria-busy={isWatching}>
          <button
            autoFocus
            disabled={isWatching}
            onClick={() => dialog.current?.close()}
            type="button"
          >
            {t("common.cancel")}
          </button>
          <button
            disabled={isWatching}
            className={styles.watch}
            onClick={() => void watch()}
            type="button"
          >
            {isWatching ? t("test.reward.wait") : t("test.reward.watch")}
          </button>
        </div>
      </dialog>
    </>
  );
}
