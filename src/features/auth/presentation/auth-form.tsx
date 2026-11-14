"use client";

import { authClient } from "@/core/auth/auth-client";
import { avatarOptions, defaultAvatar } from "@/features/auth/domain/avatars";
import { ArrowLeft, Eye, EyeOff, KeyRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useI18n } from "@/shared/i18n/locale-provider";
import styles from "./auth-form.module.css";

interface AuthFormProps {
  mode: "login" | "register" | "forgot" | "reset";
  initialEmail?: string;
  initialPassword?: string;
  token?: string;
}

export function AuthFormSkeleton() {
  const { t } = useI18n();
  return (
    <div
      aria-busy="true"
      aria-label={t("common.loading")}
      className={styles.screen}
    />
  );
}

export function AuthForm({
  mode,
  initialEmail,
  initialPassword,
  token,
}: AuthFormProps) {
  const { t } = useI18n();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState(
    mode === "login" ? (initialEmail ?? "") : "",
  );
  const [password, setPassword] = useState(
    mode === "login" ? (initialPassword ?? "") : "",
  );
  const [avatar, setAvatar] = useState<string>(defaultAvatar);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRegistering = mode === "register";
  const isForgotPassword = mode === "forgot";
  const isResettingPassword = mode === "reset";

  const title = isRegistering
    ? t("auth.register.title")
    : isForgotPassword
      ? t("auth.forgot.title")
      : isResettingPassword
        ? t("auth.reset.title")
        : t("auth.login.title");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (isRegistering && !acceptedTerms) {
      setError(t("auth.register.acceptTerms"));
      return;
    }

    setIsSubmitting(true);

    try {
      if (isForgotPassword) {
        await requestPasswordReset();
      } else if (isResettingPassword) {
        await resetPassword();
      } else {
        await authenticate();
      }
    } catch {
      setError(t("auth.requestError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function requestPasswordReset() {
    const result = await authClient.requestPasswordReset({
      email: email.trim(),
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });

    if (result.error) {
      setError(
        result.error.code === "RESET_PASSWORD_DISABLED"
          ? t("auth.forgot.unavailable")
          : t("auth.forgot.error"),
      );
      return;
    }

    setSuccess(t("auth.forgot.success"));
  }

  async function resetPassword() {
    if (!token) {
      setError(t("auth.reset.invalidLink"));
      return;
    }

    const result = await authClient.resetPassword({
      newPassword: password,
      token,
    });

    if (result.error) {
      setError(t("auth.reset.error"));
      return;
    }

    setSuccess(t("auth.reset.success"));
  }

  async function authenticate() {
    const result = isRegistering
      ? await authClient.signUp.email({
          name: name.trim(),
          email: email.trim(),
          password,
          avatar,
          callbackURL: "/",
        })
      : await authClient.signIn.email({
          email: email.trim(),
          password,
          callbackURL: "/",
        });

    if (result.error) {
      setError(
        isRegistering
          ? t("auth.register.createError")
          : t("auth.login.invalidCredentials"),
      );
      return;
    }

    router.replace("/");
    router.refresh();
  }

  return (
    <section className={styles.screen}>
      {(isForgotPassword || isRegistering || isResettingPassword) && (
        <Link aria-label={t("auth.back")} className={styles.back} href="/login">
          <ArrowLeft aria-hidden="true" />
        </Link>
      )}

      {mode === "login" && (
        <header className={styles.brand}>
          <Image
            alt=""
            className={styles.logo}
            height={116}
            priority
            src="/keep-english-app-icon.png"
            width={108}
          />
          <p className={styles.appName}>
            <span>keep</span> english
          </p>
          <p className={styles.tagline}>{t("auth.tagline")}</p>
        </header>
      )}

      {isForgotPassword && (
        <div aria-hidden="true" className={styles.recoveryIcon}>
          <KeyRound />
        </div>
      )}

      <header className={styles.heading}>
        <h1>{title}</h1>
        <p>
          {isRegistering
            ? t("auth.register.description")
            : isForgotPassword
              ? t("auth.forgot.description")
              : isResettingPassword
                ? t("auth.reset.description")
                : t("auth.login.description")}
        </p>
      </header>

      {isRegistering && (
        <fieldset className={styles.avatarFieldset}>
          <div
            aria-label={t("auth.register.selectedAvatar", { avatar })}
            className={styles.selectedAvatar}
          >
            {avatar}
          </div>

          <legend>{t("auth.register.chooseAvatar")}</legend>

          <div className={styles.avatarGrid}>
            {avatarOptions.map((option, index) => (
              <button
                aria-label={t("auth.register.selectAvatar", {
                  number: index + 1,
                })}
                aria-pressed={avatar === option}
                className={styles.avatarOption}
                key={`${option}-${index}`}
                onClick={() => setAvatar(option)}
                type="button"
              >
                {option}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <form className={styles.form} onSubmit={handleSubmit}>
        {isRegistering && (
          <label className={styles.field}>
            <span>{t("auth.register.name")}</span>
            <input
              autoComplete="name"
              maxLength={80}
              onChange={(event) => setName(event.target.value)}
              required
              value={name}
            />
          </label>
        )}

        {!isResettingPassword && (
          <label className={styles.field}>
            <span>{t("auth.email")}</span>
            <input
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>
        )}

        {!isForgotPassword && (
          <label className={styles.field}>
            <span>
              {isResettingPassword
                ? t("auth.reset.password")
                : t("auth.password")}
            </span>

            <span className={styles.passwordInput}>
              <input
                autoComplete={
                  isRegistering || isResettingPassword
                    ? "new-password"
                    : "current-password"
                }
                minLength={isRegistering || isResettingPassword ? 8 : undefined}
                onChange={(event) => setPassword(event.target.value)}
                required
                type={passwordVisible ? "text" : "password"}
                value={password}
              />

              <button
                aria-label={
                  passwordVisible
                    ? t("auth.hidePassword")
                    : t("auth.showPassword")
                }
                className={styles.visibilityToggle}
                onClick={() => setPasswordVisible((visible) => !visible)}
                type="button"
              >
                {passwordVisible ? <EyeOff /> : <Eye />}
              </button>
            </span>
          </label>
        )}

        {isRegistering && (
          <div className={styles.terms}>
            <input
              checked={acceptedTerms}
              onChange={(event) => setAcceptedTerms(event.target.checked)}
              type="checkbox"
            />

            <span>
              {t("auth.register.termsPrefix")}{" "}
              <Link href="/termos">
                <strong>{t("auth.register.terms")}</strong>
              </Link>{" "}
              {t("auth.register.and")}{" "}
              <Link href="/privacidade">
                <strong>{t("auth.register.privacy")}</strong>
              </Link>
              .
            </span>
          </div>
        )}

        {mode === "login" && (
          <Link className={styles.forgotLink} href="/esqueci-senha">
            {t("auth.login.forgotPassword")}
          </Link>
        )}

        {error && (
          <p aria-live="polite" className={styles.error} role="alert">
            {error}
          </p>
        )}

        {success && (
          <p aria-live="polite" className={styles.success} role="status">
            {success}
          </p>
        )}

        <button className={styles.submit} disabled={isSubmitting} type="submit">
          {isSubmitting
            ? t("auth.login.submitting")
            : isRegistering
              ? t("auth.register.submit")
              : isForgotPassword
                ? t("auth.forgot.submit")
                : isResettingPassword
                  ? t("auth.reset.submit")
                  : t("auth.login.submit")}
        </button>
      </form>

      {mode === "login" ? (
        <div className={styles.registerPrompt}>
          <span>{t("auth.login.or")}</span>
          <Link className={styles.alternate} href="/registro">
            {t("auth.login.createAccount")}
          </Link>
        </div>
      ) : (
        <Link
          className={`${styles.alternate} ${
            isRegistering
              ? styles.registerAlternate
              : isForgotPassword
                ? styles.forgotAlternate
                : ""
          }`}
          href="/login"
        >
          {isRegistering
            ? t("auth.register.haveAccount")
            : isForgotPassword
              ? t("auth.backToLogin")
              : t("auth.signIn")}
        </Link>
      )}
    </section>
  );
}
