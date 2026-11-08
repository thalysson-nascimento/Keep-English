"use client";

import { authClient } from "@/core/auth/auth-client";
import { avatarOptions, defaultAvatar } from "@/features/auth/domain/avatars";
import { ArrowLeft, Eye, EyeOff, KeyRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import styles from "./auth-form.module.css";

interface AuthFormProps {
  mode: "login" | "register" | "forgot" | "reset";
  token?: string;
}

const resetEmailUnavailableMessage =
  "A recuperação de senha ainda não está configurada neste ambiente. O envio de e-mails precisa ser habilitado.";

export function AuthFormSkeleton() {
  return <div aria-busy="true" className={styles.screen} />;
}

export function AuthForm({ mode, token }: AuthFormProps) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    ? "Criar conta"
    : isForgotPassword
      ? "Perdi minha senha"
      : isResettingPassword
        ? "Criar nova senha"
        : "Entrar";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (isRegistering && !acceptedTerms) {
      setError(
        "Você precisa aceitar os termos de uso e a política de privacidade.",
      );
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
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível concluir a solicitação. Tente novamente.",
      );
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
          ? resetEmailUnavailableMessage
          : "Não foi possível solicitar a recuperação. Tente novamente.",
      );
      return;
    }

    setSuccess(
      "Se este e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha.",
    );
  }

  async function resetPassword() {
    if (!token) {
      setError("Este link de recuperação é inválido ou expirou.");
      return;
    }

    const result = await authClient.resetPassword({
      newPassword: password,
      token,
    });

    if (result.error) {
      setError("Não foi possível redefinir a senha. Solicite um novo link.");
      return;
    }

    setSuccess("Senha atualizada. Agora você já pode entrar na sua conta.");
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
          ? "Não foi possível criar a conta. Verifique os dados ou tente entrar."
          : "E-mail ou senha inválidos.",
      );
      return;
    }

    router.replace("/");
    router.refresh();
  }

  return (
    <section className={styles.screen}>
      {(isForgotPassword || isRegistering || isResettingPassword) && (
        <Link aria-label="Voltar" className={styles.back} href="/login">
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
          <p className={styles.tagline}>Anote. Pratique. Mantenha.</p>
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
            ? "Escolha seu avatar e comece a anotar suas palavras."
            : isForgotPassword
              ? "Digite o e-mail da sua conta e enviaremos um link para criar uma nova senha."
              : isResettingPassword
                ? "Escolha uma senha nova para voltar aos seus estudos."
                : "Bem-vindo de volta! Continue de onde parou."}
        </p>
      </header>

      {isRegistering && (
        <fieldset className={styles.avatarFieldset}>
          <div
            aria-label={`Avatar selecionado: ${avatar}`}
            className={styles.selectedAvatar}
          >
            {avatar}
          </div>

          <legend>Escolha seu avatar</legend>

          <div className={styles.avatarGrid}>
            {avatarOptions.map((option, index) => (
              <button
                aria-label={`Selecionar avatar ${index + 1}`}
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
            <span>Nome</span>
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
            <span>E-mail</span>
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
            <span>{isResettingPassword ? "Nova senha" : "Senha"}</span>

            <span className={styles.passwordInput}>
              <input
                autoComplete={
                  isRegistering || isResettingPassword
                    ? "new-password"
                    : "current-password"
                }
                minLength={8}
                onChange={(event) => setPassword(event.target.value)}
                required
                type={passwordVisible ? "text" : "password"}
                value={password}
              />

              <button
                aria-label={passwordVisible ? "Ocultar senha" : "Mostrar senha"}
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
              Li e aceito os{" "}
              <Link href="/termos">
                <strong>termos de uso</strong>
              </Link>{" "}
              e a{" "}
              <Link href="/privacidade">
                <strong>política de privacidade</strong>
              </Link>
              .
            </span>
          </div>
        )}

        {mode === "login" && (
          <Link className={styles.forgotLink} href="/esqueci-senha">
            Perdi minha senha
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
            ? "Aguarde..."
            : isRegistering
              ? "Cadastrar"
              : isForgotPassword
                ? "Enviar link"
                : isResettingPassword
                  ? "Salvar nova senha"
                  : "Entrar"}
        </button>
      </form>

      {mode === "login" ? (
        <div className={styles.registerPrompt}>
          <span>ou</span>
          <Link className={styles.alternate} href="/registro">
            Cadastrar
          </Link>
        </div>
      ) : (
        <Link
          className={`${styles.alternate} ${
            isRegistering ? styles.registerAlternate : ""
          }`}
          href="/login"
        >
          {isRegistering
            ? "Já tenho conta"
            : isForgotPassword
              ? "Voltar ao login"
              : "Ir para o login"}
        </Link>
      )}
    </section>
  );
}
