"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/core/auth/auth-client";
import { useI18n } from "@/shared/i18n/locale-provider";
import styles from "./user-profile.module.css";

export function SignOutButton() {
  const { t } = useI18n();
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function signOut() {
    setError("");
    setIsSigningOut(true);

    try {
      const result = await authClient.signOut();

      if (result.error) {
        setError(t("auth.sessionError"));
        return;
      }

      router.replace("/login");
      router.refresh();
    } catch {
      setError(t("auth.sessionError"));
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <div className={styles.signOutArea}>
      {error && (
        <p aria-live="polite" className={styles.error} role="alert">
          {error}
        </p>
      )}
      <button
        className={styles.signOut}
        disabled={isSigningOut}
        onClick={() => void signOut()}
        type="button"
      >
        {isSigningOut ? t("auth.signingOut") : t("auth.signOut")}
      </button>
    </div>
  );
}
