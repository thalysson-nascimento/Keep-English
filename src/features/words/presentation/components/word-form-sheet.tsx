"use client";

import { useState, type FormEvent } from "react";
import {
  createWordAction,
  lookupWordAction,
} from "@/features/words/presentation/actions";
import type { Word } from "@/features/words/domain/word";
import type { WordLookup } from "@/features/words/domain/word-lookup";
import { useI18n } from "@/shared/i18n/locale-provider";
import styles from "./word-form-sheet.module.css";

interface WordFormSheetProps {
  onClose: () => void;
  onCreated: (word: Word) => void;
}

export function WordFormSheet({ onClose, onCreated }: WordFormSheetProps) {
  const { t } = useI18n();
  const [word, setWord] = useState("");
  const [lookup, setLookup] = useState<WordLookup | null>(null);
  const [duplicate, setDuplicate] = useState(false);
  const [correctedFrom, setCorrectedFrom] = useState<string | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLookup(
    event?: FormEvent<HTMLFormElement>,
    skipCorrection = false,
    originalWord = word,
  ) {
    event?.preventDefault();
    const input = originalWord.trim();

    if (!input || isLookingUp || isSaving) {
      return;
    }

    setIsLookingUp(true);
    setLookup(null);
    setDuplicate(false);
    setMessage(t("word.add.checking"));

    try {
      setMessage(t("word.add.translating"));
      const result = await lookupWordAction({
        word: input,
        skipCorrection,
      });

      if (result.status === "invalid") {
        setMessage(t("word.add.invalid"));
        return;
      }

      setLookup(result.lookup);
      setDuplicate(result.duplicate);
      setCorrectedFrom(result.lookup.correctedWord ? input : null);
      if (result.lookup.correctedWord) {
        setWord(result.lookup.correctedWord);
      }

      const correctionMessage = result.lookup.correctedWord
        ? t("word.add.corrected", {
            input,
            word: result.lookup.correctedWord,
          })
        : "";
      const duplicateMessage = result.duplicate ? t("word.add.duplicate") : "";
      const direction =
        result.lookup.sourceLanguage === "pt"
          ? t("word.add.direction.ptEn")
          : t("word.add.direction.enPt");
      const exampleMessage = result.lookup.example
        ? t("word.add.ready")
        : t("word.add.noExample");

      setMessage(
        `${duplicateMessage}${correctionMessage}${direction} ${exampleMessage}`,
      );
    } catch {
      setMessage(t("word.add.translateError"));
    } finally {
      setIsLookingUp(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!lookup || duplicate || isSaving) {
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      const result = await createWordAction({
        word: lookup.word,
        translation: lookup.translation,
        example: lookup.example || null,
      });

      if (result.status === "duplicate") {
        setDuplicate(true);
        setMessage(t("word.add.duplicate"));
        return;
      }

      if (result.status === "goal-required") {
        setMessage(t("word.add.goalRequired"));
        return;
      }

      if (result.status === "goal-reached") {
        setMessage(t("word.add.goalReached"));
        return;
      }

      if (result.status === "invalid") {
        setMessage(t("word.add.invalidInput"));
        return;
      }

      onCreated(result.word);
    } catch {
      setMessage(t("word.add.saveFailed"));
    } finally {
      setIsSaving(false);
    }
  }

  function handleWordChange(value: string) {
    setWord(value);
    setLookup(null);
    setDuplicate(false);
    setCorrectedFrom(null);
    setMessage("");
  }

  const translationValue =
    lookup?.sourceLanguage === "pt" ? lookup.word : (lookup?.translation ?? "");

  return (
    <div className={styles.backdrop} onClick={onClose} role="presentation">
      <section
        aria-labelledby="word-sheet-title"
        aria-modal="true"
        className={styles.sheet}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <h2 id="word-sheet-title">{t("word.add.title")}</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="word">{t("word.add.label")}</label>
          <input
            autoCapitalize="none"
            autoComplete="off"
            autoFocus
            disabled={isLookingUp || isSaving}
            id="word"
            maxLength={80}
            onChange={(event) => handleWordChange(event.target.value)}
            placeholder={t("word.add.placeholder")}
            required
            value={word}
          />

          <button
            className={styles.lookup}
            disabled={!word.trim() || isLookingUp || isSaving}
            onClick={() => void handleLookup()}
            type="button"
          >
            {isLookingUp ? (
              <>
                <span aria-hidden="true" className={styles.skeleton} />
                {t("word.add.searching")}
              </>
            ) : (
              t("word.add.search")
            )}
          </button>

          <p aria-live="polite" className={styles.message}>
            {message}
            {correctedFrom && lookup && (
              <>
                {" "}
                <button
                  className={styles.undo}
                  disabled={isLookingUp || isSaving}
                  onClick={() =>
                    void handleLookup(undefined, true, correctedFrom)
                  }
                  type="button"
                >
                  {t("word.add.useAnyway", { word: correctedFrom })}
                </button>
              </>
            )}
          </p>

          <label htmlFor="translation">{t("word.add.translation")}</label>
          <input
            className={styles.readOnly}
            id="translation"
            placeholder={t("word.add.translationPlaceholder")}
            readOnly
            tabIndex={-1}
            value={translationValue}
          />

          <label htmlFor="example">{t("word.add.example")}</label>
          <input
            className={styles.readOnly}
            id="example"
            placeholder={t("word.add.examplePlaceholder")}
            readOnly
            tabIndex={-1}
            value={lookup?.example ?? ""}
          />

          <div className={styles.spacer} />
          <button
            className={`${styles.save} ${isSaving ? styles.savingButton : ""}`}
            disabled={!lookup || duplicate || isLookingUp || isSaving}
            type="submit"
          >
            {isSaving ? (
              <>
                <span aria-hidden="true" className={styles.skeleton} />
                {t("word.add.saving")}
              </>
            ) : (
              t("word.add.save")
            )}
          </button>
          <button
            className={styles.cancel}
            disabled={isLookingUp || isSaving}
            onClick={onClose}
            type="button"
          >
            {t("word.add.cancel")}
          </button>
        </form>
      </section>
    </div>
  );
}
