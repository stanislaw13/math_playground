"use client";

import { useState, useCallback, useRef, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth/context";
import { getPointsForAttempt, getMaxPerQuestion } from "@/lib/scoring";
import { saveGameScore } from "@/lib/progress";
import Confetti from "@/components/ui/Confetti";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface StaticComparisonPair {
  left: ReactNode;
  right: ReactNode;
  correct: "left" | "right" | "equal";
}

export interface StaticComparisonGameProps {
  gameId: string;
  lessonId: string;
  title: string;
  description: string;
  prompt: string;
  pairs: StaticComparisonPair[];
  showEqualButton?: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type Choice = "left" | "right" | "equal";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function StaticComparisonGame({
  gameId,
  lessonId,
  title,
  description,
  prompt,
  pairs,
  showEqualButton = false,
}: StaticComparisonGameProps) {
  const tg = useTranslations("games");
  const { user } = useAuth();

  const [phase, setPhase] = useState<"start" | "play" | "finish">("start");
  const [shuffled, setShuffled] = useState<StaticComparisonPair[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [wrongFlash, setWrongFlash] = useState<Choice | null>(null);
  const [score, setScore] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const scoreRef = useRef(0);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalQuestions = pairs.length;

  const startGame = useCallback(() => {
    scoreRef.current = 0;
    setScore(0);
    setQIndex(0);
    setShuffled(shuffle(pairs));
    setFeedback(null);
    setWrongAttempts(0);
    setWrongFlash(null);
    setTotalCorrect(0);
    setPhase("play");
  }, [pairs]);

  const handleChoice = useCallback(
    (choice: Choice) => {
      if (!shuffled[qIndex] || feedback === "correct") return;
      const pair = shuffled[qIndex];

      if (choice === pair.correct) {
        if (flashTimer.current) clearTimeout(flashTimer.current);
        setWrongFlash(null);
        const pts = getPointsForAttempt(
          wrongAttempts + 1,
          getMaxPerQuestion(totalQuestions),
        );
        scoreRef.current = Math.min(scoreRef.current + pts, 1000);
        setScore(scoreRef.current);
        setFeedback("correct");
        setTotalCorrect((c) => c + 1);
      } else {
        setWrongAttempts((w) => w + 1);
        setWrongFlash(choice);
        if (flashTimer.current) clearTimeout(flashTimer.current);
        flashTimer.current = setTimeout(() => setWrongFlash(null), 700);
      }
    },
    [shuffled, qIndex, feedback, wrongAttempts, totalQuestions],
  );

  const advance = useCallback(() => {
    if (qIndex + 1 >= totalQuestions) {
      setPhase("finish");
      if (user) {
        saveGameScore(user.id, lessonId, gameId, scoreRef.current, 1000);
      }
      return;
    }
    setQIndex((i) => i + 1);
    setFeedback(null);
    setWrongAttempts(0);
    setWrongFlash(null);
  }, [qIndex, totalQuestions, user, lessonId, gameId]);

  // ── Start screen ──────────────────────────────────────────────────────────
  if (phase === "start") {
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-8 text-center">
        <h2 className="mb-2 text-2xl font-bold">{title}</h2>
        <p className="mb-6 text-[var(--color-text-secondary)]">{description}</p>
        <button
          onClick={startGame}
          className="rounded-lg bg-[var(--color-accent)] px-6 py-3 font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
        >
          {tg("startGame")}
        </button>
      </div>
    );
  }

  // ── Finish screen ─────────────────────────────────────────────────────────
  if (phase === "finish") {
    const isPerfect = scoreRef.current >= 1000;
    const accuracy = totalQuestions > 0 ? totalCorrect / totalQuestions : 0;

    return (
      <>
        {isPerfect && <Confetti />}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-8 text-center"
        >
          <h2 className="mb-4 text-2xl font-bold">
            {isPerfect ? "🏆 " : ""}
            {tg("complete")}
          </h2>
          <p className="mb-1 text-3xl font-bold text-[var(--color-accent)]">
            {scoreRef.current} / 1000
          </p>
          <p className="mb-6 text-[var(--color-text-secondary)]">
            {Math.round(accuracy * 100)}%
          </p>
          <button
            onClick={startGame}
            className="rounded-lg bg-[var(--color-accent)] px-6 py-3 font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
          >
            {tg("tryAgain")}
          </button>
        </motion.div>
      </>
    );
  }

  // ── Active question ───────────────────────────────────────────────────────
  const pair = shuffled[qIndex];
  if (!pair) return null;

  const cardClass = (side: Choice) => {
    const base =
      "flex min-h-24 min-w-32 flex-1 items-center justify-center rounded-xl border-2 p-4 text-2xl font-bold transition-all duration-150 cursor-pointer select-none";

    if (feedback === "correct") {
      if (side === pair.correct) {
        return `${base} border-[var(--color-success)] bg-[var(--color-success)]/10 text-[var(--color-success)] cursor-default`;
      }
      return `${base} border-[var(--color-border)] opacity-40 cursor-default`;
    }

    if (wrongFlash === side) {
      return `${base} border-[var(--color-error)] bg-[var(--color-error)]/10 text-[var(--color-error)]`;
    }

    return `${base} border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/5`;
  };

  const equalClass = () => {
    const base =
      "flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 text-lg font-bold transition-all duration-150 cursor-pointer select-none";

    if (feedback === "correct") {
      if (pair.correct === "equal") {
        return `${base} border-[var(--color-success)] bg-[var(--color-success)]/10 text-[var(--color-success)] cursor-default`;
      }
      return `${base} border-[var(--color-border)] opacity-40 cursor-default`;
    }

    if (wrongFlash === "equal") {
      return `${base} border-[var(--color-error)] bg-[var(--color-error)]/10 text-[var(--color-error)]`;
    }

    return `${base} border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/5`;
  };

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6">
      {/* Header */}
      <div className="mb-5">
        <p className="text-sm text-[var(--color-text-secondary)]">
          {tg("questionOf", { current: qIndex + 1, total: totalQuestions })}
        </p>
        <p className="text-xs font-mono text-[var(--color-accent)]">
          {score} pts
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={qIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <p className="mb-4 text-center text-sm font-medium text-[var(--color-text-secondary)]">
            {prompt}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              className={cardClass("left")}
              onClick={() => handleChoice("left")}
              disabled={feedback === "correct"}
            >
              {pair.left}
            </button>

            {showEqualButton && (
              <button
                className={equalClass()}
                onClick={() => handleChoice("equal")}
                disabled={feedback === "correct"}
              >
                =
              </button>
            )}

            <button
              className={cardClass("right")}
              onClick={() => handleChoice("right")}
              disabled={feedback === "correct"}
            >
              {pair.right}
            </button>
          </div>

          <AnimatePresence>
            {feedback === "correct" && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-5 flex flex-col items-center gap-3"
              >
                <p className="text-sm font-semibold text-[var(--color-success)]">
                  {tg("correct")}
                </p>
                <button
                  onClick={advance}
                  className="rounded-lg bg-[var(--color-success)] px-6 py-2 font-medium text-white transition-opacity hover:opacity-90"
                >
                  {tg("next")} →
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
