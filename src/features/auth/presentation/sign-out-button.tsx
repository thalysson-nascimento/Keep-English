"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/core/auth/auth-client";
import styles from "./user-profile.module.css";

export function SignOutButton() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function signOut() {
    setError("");
    setIsSigningOut(true);

    try {
      const result = await authClient.signOut();

      if (result.error) {
        setError("Não foi possível sair da conta. Tente novamente.");
        return;
      }

      router.replace("/login");
      router.refresh();
    } catch {
      setError("Não foi possível sair da conta. Tente novamente.");
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
        {isSigningOut ? "Saindo..." : "Sair da conta"}
      </button>
    </div>
  );
}
