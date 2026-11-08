"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { TestAccessData } from "@/features/tests/application/get-test-access-data";
import {
  formatTestCountdown,
  getTestCooldownRemaining,
  getTestLockReason,
  normalizeAnswer,
  type VocabularyQuestion,
} from "@/features/tests/domain/vocabulary-test";
import { completeVocabularyTestAction } from "@/features/tests/presentation/actions";
import styles from "./vocabulary-test-screen.module.css";

interface VocabularyTestScreenProps {
  data: TestAccessData & { questions: VocabularyQuestion[] };
}

interface CompletedTest {
  score: number;
  total: number;
  completedAt: number;
}

interface SubmittedAnswer {
  wordId: string;
  answer: string;
}

function getCompletionError(status: string): string {
  if (status === "goal") {
    return "A meta diária ainda não foi concluída. Volte para a tela inicial e termine a meta para iniciar o teste.";
  }

  if (status === "cooldown") {
    return "O intervalo de 30 minutos ainda não terminou. Aguarde para iniciar outro teste.";
  }

  if (status === "words") {
    return "Adicione palavras antes de iniciar um teste.";
  }

  return "Não foi possível registrar o teste. Tente novamente.";
}

export function VocabularyTestScreen({ data }: VocabularyTestScreenProps) {
  const [now, setNow] = useState(data.now);
  const [hasStarted, setHasStarted] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [hasAnswered, setHasAnswered] = useState(false);
  const [answerIsCorrect, setAnswerIsCorrect] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [answers, setAnswers] = useState<SubmittedAnswer[]>([]);
  const [completedTest, setCompletedTest] = useState<CompletedTest | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(Date.now()), 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  const accessState = {
    goal: data.goal,
    todayWords: data.todayWords,
    wordCount: data.words.length,
    lastTestAt: data.lastTestAt,
  };
  const lockReason = getTestLockReason(accessState, now);
  const cooldownRemaining = getTestCooldownRemaining(data.lastTestAt, now);
  const currentQuestion = data.questions[questionIndex];

  async function handleAnswer() {
    if (!currentQuestion || isSubmitting) {
      return;
    }

    if (!hasAnswered) {
      const isCorrect =
        normalizeAnswer(selectedAnswer) ===
        normalizeAnswer(currentQuestion.word);

      setAnswerIsCorrect(isCorrect);
      setHasAnswered(true);

      if (isCorrect) {
        setCorrectAnswers((current) => current + 1);
      }

      return;
    }

    const nextAnswers = [
      ...answers,
      { wordId: currentQuestion.id, answer: selectedAnswer },
    ];

    if (questionIndex < data.questions.length - 1) {
      setAnswers(nextAnswers);
      setQuestionIndex((current) => current + 1);
      setSelectedAnswer("");
      setHasAnswered(false);
      setError("");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const result = await completeVocabularyTestAction(nextAnswers);

      if (result.status !== "completed") {
        setError(getCompletionError(result.status));
        return;
      }

      setCompletedTest({
        score: result.score,
        total: result.total,
        completedAt: result.completedAt,
      });
    } catch {
      setError("Não foi possível salvar o resultado do teste.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (completedTest) {
    const percentage = Math.round(
      (completedTest.score / completedTest.total) * 100,
    );
    const remaining = getTestCooldownRemaining(completedTest.completedAt, now);

    return (
      <div className={styles.screen}>
        <div className={styles.result}>
          <div aria-hidden="true" className={styles.trophy}>
            {percentage >= 80 ? "🏆" : percentage >= 50 ? "👏" : "💪"}
          </div>
          <h1>
            {percentage === 100
              ? "Perfeito!"
              : percentage >= 60
                ? "Muito bem!"
                : "Continue praticando!"}
          </h1>
          <strong className={styles.score}>
            {completedTest.score}/{completedTest.total}
          </strong>
          <p>Você acertou {percentage}% das palavras.</p>
          <div className={styles.resultStats}>
            <div>
              <strong>{completedTest.score}</strong>
              <span>Acertos</span>
            </div>
            <div>
              <strong>{completedTest.total - completedTest.score}</strong>
              <span>Erros</span>
            </div>
            <div>
              <strong>{percentage}%</strong>
              <span>Nota</span>
            </div>
          </div>
          <p aria-live="polite" className={styles.cooldown}>
            ⏳ Próximo teste em {formatTestCountdown(remaining)}
          </p>
          <Link className={styles.primaryButton} href="/">
            Voltar para o início
          </Link>
        </div>
      </div>
    );
  }

  if (lockReason) {
    const message =
      lockReason === "words"
        ? "Anote palavras antes de iniciar um teste."
        : lockReason === "goal"
          ? data.goal === null
            ? "Defina e conclua sua meta diária para liberar o teste."
            : `Conclua sua meta diária (${data.todayWords}/${data.goal}) para liberar o teste.`
          : `Próximo teste liberado em ${formatTestCountdown(cooldownRemaining)}.`;

    return (
      <div className={styles.screen}>
        <header className={styles.header}>
          <Link
            aria-label="Voltar para o início"
            className={styles.close}
            href="/"
          >
            ×
          </Link>
          <span>Teste de vocabulário</span>
          <span aria-hidden="true" className={styles.headerSpacer} />
        </header>
        <section className={styles.locked}>
          <span aria-hidden="true" className={styles.lockIcon}>
            {lockReason === "cooldown" ? "⏳" : "🎯"}
          </span>
          <h1>Teste indisponível</h1>
          <p aria-live="polite">{message}</p>
          <Link className={styles.primaryButton} href="/">
            Voltar para o início
          </Link>
        </section>
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <div className={styles.screen}>
        <header className={styles.header}>
          <Link
            aria-label="Voltar para o início"
            className={styles.close}
            href="/"
          >
            ×
          </Link>
          <span>Teste de vocabulário</span>
          <span aria-hidden="true" className={styles.headerSpacer} />
        </header>
        <section className={styles.intro}>
          <div aria-hidden="true" className={styles.logo}>
            🧠
          </div>
          <h1>Teste de vocabulário</h1>
          <p>Traduza as palavras para o inglês.</p>
          <p>{data.questions.length} perguntas selecionadas da sua lista.</p>
          <button
            className={styles.primaryButton}
            onClick={() => setHasStarted(true)}
            type="button"
          >
            Começar teste
          </button>
        </section>
      </div>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  const percentage = Math.round((questionIndex / data.questions.length) * 100);

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <Link aria-label="Sair do teste" className={styles.close} href="/">
          ×
        </Link>
        <span>Teste de vocabulário</span>
        <span className={styles.liveScore}>⭐ {correctAnswers}</span>
      </header>
      <div
        aria-label={`Progresso: pergunta ${questionIndex + 1} de ${data.questions.length}`}
        className={styles.progressTrack}
        role="progressbar"
        aria-valuemax={data.questions.length}
        aria-valuemin={0}
        aria-valuenow={questionIndex}
      >
        <div
          className={styles.progressFill}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className={styles.questionCount}>
        {String(questionIndex + 1).padStart(2, "0")}/
        {String(data.questions.length).padStart(2, "0")}
      </p>
      <section className={styles.question}>
        <p className={styles.prompt}>
          {currentQuestion.options
            ? "Qual é a tradução em inglês de"
            : "Escreva em inglês"}
        </p>
        <h1>{currentQuestion.translation}</h1>
        {currentQuestion.options ? (
          <div className={styles.options}>
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrectOption =
                normalizeAnswer(option) ===
                normalizeAnswer(currentQuestion.word);
              const optionClass = [
                styles.option,
                isSelected ? styles.selected : "",
                hasAnswered && isCorrectOption ? styles.correct : "",
                hasAnswered && isSelected && !answerIsCorrect
                  ? styles.incorrect
                  : "",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <button
                  aria-pressed={isSelected}
                  className={optionClass}
                  disabled={hasAnswered}
                  key={option}
                  onClick={() => setSelectedAnswer(option)}
                  type="button"
                >
                  <i>{index + 1}</i>
                  {option}
                </button>
              );
            })}
          </div>
        ) : (
          <input
            autoComplete="off"
            autoCapitalize="none"
            className={`${styles.answerInput} ${
              hasAnswered
                ? answerIsCorrect
                  ? styles.correct
                  : styles.incorrect
                : ""
            }`}
            disabled={hasAnswered}
            onChange={(event) => setSelectedAnswer(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && selectedAnswer.trim()) {
                void handleAnswer();
              }
            }}
            placeholder="Digite em inglês"
            spellCheck={false}
            value={selectedAnswer}
          />
        )}
        {hasAnswered && !answerIsCorrect && (
          <p className={styles.correctAnswer}>
            Resposta certa: <strong>{currentQuestion.word}</strong>
          </p>
        )}
        {error && (
          <p aria-live="polite" className={styles.error}>
            {error}
          </p>
        )}
      </section>
      <footer className={styles.footer}>
        <button
          className={styles.primaryButton}
          disabled={!selectedAnswer.trim() || isSubmitting}
          onClick={() => void handleAnswer()}
          type="button"
        >
          {isSubmitting
            ? "Salvando resultado..."
            : hasAnswered
              ? questionIndex === data.questions.length - 1
                ? "Ver resultado"
                : "Continuar"
              : "Confirmar"}
        </button>
      </footer>
    </div>
  );
}

export function VocabularyTestSkeleton() {
  return (
    <div aria-label="Carregando teste" className={styles.screen} role="status">
      <div className={styles.skeletonHeader} />
      <div className={styles.skeletonProgress} />
      <div className={styles.skeletonQuestion} />
      <div className={styles.skeletonOption} />
      <div className={styles.skeletonOption} />
      <div className={styles.skeletonOption} />
    </div>
  );
}
