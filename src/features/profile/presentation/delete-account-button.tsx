"use client";

import { useRef, useState } from "react";
import { authClient } from "@/core/auth/auth-client";
import { useI18n } from "@/shared/i18n/locale-provider";
import styles from "./delete-account-button.module.css";

export function DeleteAccountButton() {
  const { t } = useI18n();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const requestInProgress = useRef(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [needsSignIn, setNeedsSignIn] = useState(false);

  function openDialog() {
    setError("");
    setNeedsSignIn(false);
    dialogRef.current?.showModal();
  }

  async function deleteAccount() {
    if (requestInProgress.current) return;

    requestInProgress.current = true;
    setIsDeleting(true);
    setError("");

    try {
      const result = await authClient.deleteUser({});

      if (result.error) {
        const expired =
          result.error.code === "SESSION_EXPIRED" ||
          result.error.status === 401;
        setNeedsSignIn(expired);
        setError(
          t(expired ? "profile.delete.signInAgain" : "profile.delete.error"),
        );
        return;
      }

      if (!result.data?.success || result.data.message !== "User deleted") {
        setError(t("profile.delete.error"));
        return;
      }

      // A full navigation clears the authenticated page and its cached data.
      window.location.replace("/login");
    } catch {
      setError(t("profile.delete.error"));
    } finally {
      requestInProgress.current = false;
      setIsDeleting(false);
    }
  }

  return (
    <>
      <button className={styles.trigger} onClick={openDialog} type="button">
        {t("profile.delete.open")}
      </button>
      <dialog
        aria-describedby="delete-account-description"
        aria-labelledby="delete-account-title"
        className={styles.dialog}
        onCancel={(event) => {
          if (requestInProgress.current) event.preventDefault();
        }}
        ref={dialogRef}
      >
        <h2 id="delete-account-title">{t("profile.delete.title")}</h2>
        <p id="delete-account-description">{t("profile.delete.description")}</p>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        <div aria-busy={isDeleting} className={styles.actions}>
          <button
            autoFocus
            className={styles.cancel}
            disabled={isDeleting}
            onClick={() => dialogRef.current?.close()}
            type="button"
          >
            {t("common.cancel")}
          </button>
          {needsSignIn ? (
            <a className={styles.confirm} href="/login">
              {t("auth.signIn")}
            </a>
          ) : (
            <button
              className={styles.confirm}
              disabled={isDeleting}
              onClick={() => void deleteAccount()}
              type="button"
            >
              {isDeleting
                ? t("profile.delete.wait")
                : t("profile.delete.confirm")}
            </button>
          )}
        </div>
      </dialog>
    </>
  );
}
