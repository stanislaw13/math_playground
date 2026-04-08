"use client";

import { useState, useCallback, useRef, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth/context";
import { getPointsForAttempt, getMaxPerQuestion } from "@/lib/scoring";
import { saveGameScore } from "@/lib/progress";
import useAdaptiveEngine from "@/hooks/useAdaptiveEngine";
import { type Difficulty, type SkillCategory } from "@/lib/adaptiveEngine";
import HintSystem, { type HintStep } from "@/components/lessons/HintSystem";
import Confetti from "@/components/ui/Confetti";

// ---------------------------------------------------------------------------
// Public API types
// ---------------------------------------------------------------------------

/**
 * A single pair shown to the student. Set `correct` to whichever side is the
 * right answer, or `"equal"` if both are the same.
 *
 * `left` and `right` accept any ReactNode — plain text, KaTeX fractions, SVG
 * shapes, images, etc.
 */
export interface ComparisonPair {
  left: ReactNode;
  right: ReactNode;
  /** Which button the student should press. */
  correct: "left" | "right" | "equal";
  /** Optional 3-step progressive hints (formula → substitution → answer). */
  hints?: HintStep[];
}

export interface ComparisonGameProps {
  // ── Identity (required for progress tracking) ──────────────────────────
  gameId: string;
  lessonId: string;

  // ── Displayed strings ──────────────────────────────────────────────────
  title: string;
  description: string;
  /**
   * Short question shown above the two cards every round.
   * E.g. "Which is bigger?", "Which shape has a larger area?"
   */
  prompt: string;

  // ── Game logic ─────────────────────────────────────────────────────────
  /**
   * Skill categories for the adaptive engine.
   * Each category will be tracked separately — define one per distinct
   * sub-skill (e.g. "fraction vs decimal", "fraction vs fraction").
   */
  categories: SkillCategory[];

  /**
   * Called each round to produce a pair. Receives the category and
   * difficulty chosen by the adaptive engine.
   *
   * You are responsible for seeding the pair's randomness here.
   * The `correct` field tells the game which button is the right answer.
   */
  generatePair: (category: string, difficulty: Difficulty) => ComparisonPair;

  /** Total questions per round. Default: 12 */
  totalQuestions?: number;

  /**
   * Show a "=" button between the two cards so students can indicate
   * both values are equal. Default: false.
   * Only needed when your pairs can genuinely be equal.
   */
  showEqualButton?: boolean;
}

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

type Choice = "left" | "right" | "equal";

interface ActivePair {
  category: string;
  pair: ComparisonPair;
}

const DEFAULT_TOTAL = 12;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ComparisonGame({
  gameId,
  lessonId,
  title,
  description,
  prompt,
  categories,
  generatePair,
  totalQuestions = DEFAULT_TOTAL,
  showEqualButton = false,
}: ComparisonGameProps) {
  const tg = useTranslations("games");
  const { user } = useAuth();
  const engine = useAdaptiveEngine(categories);

  const [phase, setPhase] = useState<"start" | "play" | "finish">("start");
  const [qIndex, setQIndex] = useState(0);
  const [active, setActive] = useState<ActivePair | null>(null);
  const [feedback, setFeedback] = useState<"correct" | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [wrongFlash, setWrongFlash] = useState<Choice | null>(null);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pickNext = useCallback((): ActivePair => {
    const { category, difficulty } = engine.pickNext();
    return { category, pair: generatePair(category, difficulty) };
  }, [engine, generatePair]);

  const startGame = useCallback(() => {
    scoreRef.current = 0;
    setScore(0);
    setQIndex(0);
    setActive(pickNext());
    setFeedback(null);
    setWrongAttempts(0);
    setWrongFlash(null);
    setPhase("play");
  }, [pickNext]);

  const handleChoice = useCallback(
    (choice: Choice) => {
      if (!active || feedback === "correct") return;

      if (choice === active.pair.correct) {
        // ── Correct ────────────────────────────────────────────────────────
        if (flashTimer.current) clearTimeout(flashTimer.current);
        setWrongFlash(null);
        const pts = getPointsForAttempt(
          wrongAttempts + 1,
          getMaxPerQuestion(totalQuestions)
        );
        scoreRef.current = Math.min(scoreRef.current + pts, 1000);
        setScore(scoreRef.current);
        setFeedback("correct");
        engine.record(active.category, true);
      } else {
        // ── Wrong ──────────────────────────────────────────────────────────
        setWrongAttempts((w) => w + 1);
        setWrongFlash(choice);
        engine.record(active.category, false);
        // Flash red for 700ms, then let the student retry
        if (flashTimer.current) clearTimeout(flashTimer.current);
        flashTimer.current = setTimeout(() => setWrongFlash(null), 700);
      }
    },
    [active, feedback, wrongAttempts, totalQuestions, engine]
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
    setActive(pickNext());
    setFeedback(null);
    setWrongAttempts(0);
    setWrongFlash(null);
  }, [qIndex, totalQuestions, pickNext, user, lessonId, gameId]);

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
    const summary = engine.getSummary();
    const isPerfect = scoreRef.current >= 1000;
    const weakCategories = summary.weakToStrong.filter((s) => s.accuracy < 0.7);

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
            {Math.round(summary.overallAccuracy * 100)}%
          </p>

          {weakCategories.length > 0 && (
            <div className="mb-6 rounded-lg bg-[var(--color-bg-tertiary)] p-4 text-left">
              <p className="mb-2 text-sm font-medium text-[var(--color-text-secondary)]">
                {tg("keepPracticing")}:
              </p>
              {weakCategories.map((s) => (
                <p key={s.id} className="text-sm">
                  {s.label} —{" "}
                  <span className="font-mono text-[var(--color-error)]">
                    {Math.round(s.accuracy * 100)}%
                  </span>
                </p>
              ))}
            </div>
          )}

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
  if (!active) return null;

  const { pair } = active;
  const hints = pair.hints ?? [];

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
      {/* ── Header: progress + hints ──────────────────────────────────────── */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {tg("questionOf", { current: qIndex + 1, total: totalQuestions })}
          </p>
          <p className="text-xs font-mono text-[var(--color-accent)]">
            {score} pts
          </p>
        </div>
        {hints.length > 0 && (
          <HintSystem steps={hints} wrongAttempts={wrongAttempts} />
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={qIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          {/* ── Prompt ──────────────────────────────────────────────────── */}
          <p className="mb-4 text-center text-sm font-medium text-[var(--color-text-secondary)]">
            {prompt}
          </p>

          {/* ── Cards ───────────────────────────────────────────────────── */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* Left */}
            <button
              className={cardClass("left")}
              onClick={() => handleChoice("left")}
              disabled={feedback === "correct"}
            >
              {pair.left}
            </button>

            {/* Equal button (optional) */}
            {showEqualButton && (
              <button
                className={equalClass()}
                onClick={() => handleChoice("equal")}
                disabled={feedback === "correct"}
              >
                =
              </button>
            )}

            {/* Right */}
            <button
              className={cardClass("right")}
              onClick={() => handleChoice("right")}
              disabled={feedback === "correct"}
            >
              {pair.right}
            </button>
          </div>

          {/* ── Feedback ────────────────────────────────────────────────── */}
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
