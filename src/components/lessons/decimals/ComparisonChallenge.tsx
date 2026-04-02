"use client";

import { useState, useCallback, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import katex from "katex";
import { useAuth } from "@/lib/auth/context";
import { getPointsForAttempt, getMaxPerQuestion } from "@/lib/scoring";
import { saveGameScore } from "@/lib/progress";
import useAdaptiveEngine from "@/hooks/useAdaptiveEngine";
import { adaptiveInt, type Difficulty, type SkillCategory } from "@/lib/adaptiveEngine";
import HintSystem, { type HintStep } from "@/components/lessons/HintSystem";
import Confetti from "@/components/ui/Confetti";

// ---------------------------------------------------------------------------
// Skill categories
// ---------------------------------------------------------------------------

const CATEGORIES: SkillCategory[] = [
  { id: "compare-same-length", label: "Same-Length Decimals" },
  { id: "compare-different-length", label: "Different-Length Decimals" },
  { id: "compare-near-boundary", label: "Near Whole Numbers" },
  { id: "compare-fraction-decimal", label: "Fraction vs Decimal" },
];

// ---------------------------------------------------------------------------
// Question interface — display uses ReactNode so fractions render via KaTeX
// ---------------------------------------------------------------------------

interface CompareQuestion {
  category: string;
  difficulty: Difficulty;
  leftValue: number;
  rightValue: number;
  leftDisplay: ReactNode;
  rightDisplay: ReactNode;
  answer: "left" | "right" | "equal";
  hints: HintStep[];
}

// ---------------------------------------------------------------------------
// KaTeX fraction helper
// ---------------------------------------------------------------------------

function FracNode({ num, den }: { num: number; den: number }) {
  const html = katex.renderToString(`\\dfrac{${num}}{${den}}`, {
    throwOnError: false,
  });
  return (
    <span
      dangerouslySetInnerHTML={{ __html: html }}
      className="text-xl leading-none"
    />
  );
}

// ---------------------------------------------------------------------------
// Fraction-vs-decimal pairs, grouped by difficulty
// ---------------------------------------------------------------------------

interface FracDecPair {
  num: number;
  den: number;
  dec: number;
  fracVal: number; // exact rational value for comparison
}

const FRAC_PAIRS: Record<Difficulty, FracDecPair[]> = {
  easy: [
    { num: 1, den: 2, dec: 0.5, fracVal: 0.5 },      // equal
    { num: 1, den: 2, dec: 0.3, fracVal: 0.5 },       // dec < frac
    { num: 1, den: 2, dec: 0.7, fracVal: 0.5 },       // dec > frac
    { num: 1, den: 4, dec: 0.25, fracVal: 0.25 },     // equal
    { num: 1, den: 4, dec: 0.5, fracVal: 0.25 },      // dec > frac
    { num: 1, den: 4, dec: 0.1, fracVal: 0.25 },      // dec < frac
  ],
  medium: [
    { num: 1, den: 3, dec: 0.3, fracVal: 1 / 3 },    // dec < frac (0.3 < 0.333)
    { num: 1, den: 3, dec: 0.4, fracVal: 1 / 3 },    // dec > frac
    { num: 2, den: 3, dec: 0.6, fracVal: 2 / 3 },    // dec < frac (0.6 < 0.667)
    { num: 2, den: 3, dec: 0.7, fracVal: 2 / 3 },    // dec > frac
    { num: 3, den: 4, dec: 0.75, fracVal: 0.75 },    // equal
    { num: 2, den: 5, dec: 0.4, fracVal: 0.4 },      // equal
  ],
  hard: [
    { num: 3, den: 4, dec: 0.7, fracVal: 0.75 },     // dec < frac
    { num: 3, den: 4, dec: 0.8, fracVal: 0.75 },     // dec > frac
    { num: 3, den: 5, dec: 0.6, fracVal: 0.6 },      // equal
    { num: 3, den: 7, dec: 0.5, fracVal: 3 / 7 },   // dec > frac (0.5 > 0.4286)
    { num: 2, den: 5, dec: 0.3, fracVal: 0.4 },      // dec < frac
    { num: 4, den: 5, dec: 0.8, fracVal: 0.8 },      // equal
    { num: 5, den: 8, dec: 0.6, fracVal: 0.625 },    // dec < frac (0.6 < 0.625)
    { num: 5, den: 8, dec: 0.65, fracVal: 0.625 },   // dec > frac
  ],
};

// ---------------------------------------------------------------------------
// Question generators
// ---------------------------------------------------------------------------

function generateQuestion(category: string, difficulty: Difficulty): CompareQuestion {
  const base = adaptiveInt(difficulty, [0, 5], [0, 10], [0, 15]);

  switch (category) {
    case "compare-same-length": {
      const places = difficulty === "easy" ? 1 : 2;
      const factor = places === 1 ? 10 : 100;
      const a = base + (Math.floor(Math.random() * (factor - 1)) + 1) / factor;
      let b = base + (Math.floor(Math.random() * (factor - 1)) + 1) / factor;
      if (Math.random() < 0.15) b = a;
      const lv = parseFloat(a.toFixed(places));
      const rv = parseFloat(b.toFixed(places));
      const answer = lv > rv ? "left" : lv < rv ? "right" : "equal";
      return {
        category, difficulty,
        leftValue: lv, rightValue: rv,
        leftDisplay: <span>{lv.toString()}</span>,
        rightDisplay: <span>{rv.toString()}</span>,
        answer,
        hints: [
          { text: "Compare digit by digit from left to right" },
          { text: `Ones: ${Math.floor(lv)} vs ${Math.floor(rv)}` },
          { text: `${lv} ${lv > rv ? ">" : lv < rv ? "<" : "="} ${rv}` },
        ],
      };
    }

    case "compare-different-length": {
      const tenths = Math.floor(Math.random() * 9) + 1;
      const hundA = Math.floor(Math.random() * 9) + 1;
      const hundB = Math.floor(Math.random() * 9) + 1;
      const lv = parseFloat((base + tenths / 10).toFixed(1));
      const rv = parseFloat((base + hundA / 10 + hundB / 100).toFixed(2));
      const answer = lv > rv ? "left" : lv < rv ? "right" : "equal";
      return {
        category, difficulty,
        leftValue: lv, rightValue: rv,
        leftDisplay: <span>{lv.toString()}</span>,
        rightDisplay: <span>{rv.toString()}</span>,
        answer,
        hints: [
          { text: "Pad with zeros to make same length", latex: `${lv.toFixed(2)} \\text{ vs } ${rv.toFixed(2)}` },
          { text: "Now compare digit by digit" },
          { text: `${lv} ${lv > rv ? ">" : lv < rv ? "<" : "="} ${rv}` },
        ],
      };
    }

    case "compare-near-boundary": {
      const boundary = adaptiveInt(difficulty, [1, 5], [1, 10], [1, 15]);
      const offA = difficulty === "easy"
        ? (Math.random() < 0.5 ? -0.1 : 0.1)
        : (Math.random() < 0.5 ? -(Math.floor(Math.random() * 9) + 1) / 100 : (Math.floor(Math.random() * 9) + 1) / 100);
      const offB = difficulty === "easy"
        ? (Math.random() < 0.5 ? -0.2 : 0.2)
        : (Math.random() < 0.5 ? -(Math.floor(Math.random() * 9) + 1) / 100 : (Math.floor(Math.random() * 9) + 1) / 100);
      const lv = parseFloat((boundary + offA).toFixed(2));
      const rv = parseFloat((boundary + offB).toFixed(2));
      const answer = lv > rv ? "left" : lv < rv ? "right" : "equal";
      return {
        category, difficulty,
        leftValue: lv, rightValue: rv,
        leftDisplay: <span>{lv.toString()}</span>,
        rightDisplay: <span>{rv.toString()}</span>,
        answer,
        hints: [
          { text: "Think about which side of the whole number each decimal is" },
          { text: `${lv} is ${lv < boundary ? "below" : "above"} ${boundary}, ${rv} is ${rv < boundary ? "below" : "above"} ${boundary}` },
          { text: `${lv} ${lv > rv ? ">" : lv < rv ? "<" : "="} ${rv}` },
        ],
      };
    }

    default: { // compare-fraction-decimal
      const pool = FRAC_PAIRS[difficulty];
      const pair = pool[Math.floor(Math.random() * pool.length)];
      const { num, den, dec, fracVal } = pair;

      // Randomly swap sides to avoid always putting decimal on the left
      const swapped = Math.random() < 0.5;
      const lv = swapped ? fracVal : dec;
      const rv = swapped ? dec : fracVal;
      const rawAnswer = dec > fracVal ? "left" : dec < fracVal ? "right" : "equal";
      // Adjust for swap
      const answer: "left" | "right" | "equal" =
        rawAnswer === "equal"
          ? "equal"
          : swapped
          ? rawAnswer === "left" ? "right" : "left"
          : rawAnswer;

      const decDisplay = <span className="font-mono">{dec.toString()}</span>;
      const fracDisplay = <FracNode num={num} den={den} />;

      const fracDecimal = (num / den).toFixed(4).replace(/0+$/, "");

      return {
        category, difficulty,
        leftValue: lv, rightValue: rv,
        leftDisplay: swapped ? fracDisplay : decDisplay,
        rightDisplay: swapped ? decDisplay : fracDisplay,
        answer,
        hints: [
          { text: `Convert the fraction: ${num}/${den} ≈ ${fracDecimal}` },
          { text: `Compare: ${dec} vs ${fracDecimal}` },
          { text: `${dec} ${dec > fracVal ? ">" : dec < fracVal ? "<" : "="} ${num}/${den}` },
        ],
      };
    }
  }
}

const TOTAL_QUESTIONS = 12;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ComparisonChallenge() {
  const t = useTranslations("decimals");
  const tg = useTranslations("games");
  const { user } = useAuth();
  const engine = useAdaptiveEngine(CATEGORIES);

  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [currentQ, setCurrentQ] = useState<CompareQuestion | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [score, setScore] = useState(0);

  const generateNext = useCallback(() => {
    const { category, difficulty } = engine.pickNext();
    return generateQuestion(category, difficulty);
  }, [engine]);

  const startGame = useCallback(() => {
    setCurrentQ(generateNext());
    setQuestionIndex(0);
    setFeedback(null);
    setWrongAttempts(0);
    setScore(0);
    setFinished(false);
    setStarted(true);
  }, [generateNext]);

  const handleChoice = (choice: "left" | "right" | "equal") => {
    if (!currentQ || feedback === "correct") return;
    if (choice === currentQ.answer) {
      const points = getPointsForAttempt(wrongAttempts + 1, getMaxPerQuestion(TOTAL_QUESTIONS));
      setScore((s) => Math.min(s + points, 1000));
      setFeedback("correct");
      engine.record(currentQ.category, true);
    } else {
      setWrongAttempts((w) => w + 1);
      setFeedback("incorrect");
      engine.record(currentQ.category, false);
    }
  };

  const nextQuestion = () => {
    if (questionIndex + 1 >= TOTAL_QUESTIONS) {
      setFinished(true);
      if (user) saveGameScore(user.id, "primary-decimals", "comparison-challenge", score, 1000);
      return;
    }
    setQuestionIndex((i) => i + 1);
    setCurrentQ(generateNext());
    setFeedback(null);
    setWrongAttempts(0);
  };

  // --- Start screen ---
  if (!started) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-8 text-center">
        <h2 className="mb-2 text-2xl font-bold">{t("comparisonTitle")}</h2>
        <p className="mb-6 text-[var(--color-text-secondary)]">{t("comparisonDesc")}</p>
        <button
          onClick={startGame}
          className="rounded-lg bg-[var(--color-accent)] px-6 py-3 font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
        >
          {tg("startGame")}
        </button>
      </div>
    );
  }

  // --- Finish screen ---
  if (finished) {
    const summary = engine.getSummary();
    const isPerfect = score >= 1000;
    return (
      <>
        {isPerfect && <Confetti />}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-8 text-center"
        >
          <h2 className="mb-4 text-2xl font-bold">
            {isPerfect ? "🏆 " : ""}{tg("complete")}
          </h2>
          <p className="mb-2 text-3xl font-bold text-[var(--color-accent)]">
            {score} / 1000
          </p>
          <p className="mb-4 text-[var(--color-text-secondary)]">
            {Math.round(summary.overallAccuracy * 100)}%
          </p>
          {summary.weakToStrong.length > 0 &&
            summary.weakToStrong[0].accuracy < 0.7 && (
              <div className="mb-4 rounded-lg bg-[var(--color-bg-tertiary)] p-4 text-left">
                <p className="mb-2 text-sm font-medium text-[var(--color-text-secondary)]">
                  {t("keepPracticing")}:
                </p>
                {summary.weakToStrong
                  .filter((s) => s.accuracy < 0.7)
                  .map((s) => (
                    <p key={s.id} className="text-sm">
                      {s.label} — {Math.round(s.accuracy * 100)}%
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

  if (!currentQ) return null;

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {t("questionOf", { current: questionIndex + 1, total: TOTAL_QUESTIONS })}
          </p>
          <p className="text-xs font-mono text-[var(--color-accent)]">{score} pts</p>
        </div>
        <HintSystem steps={currentQ.hints} wrongAttempts={wrongAttempts} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={questionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <p className="mb-4 text-center text-sm text-[var(--color-text-secondary)]">
            {t("whichIsBigger")}
          </p>

          {/* Two value cards + equal button */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => handleChoice("left")}
              disabled={feedback === "correct"}
              className={`flex h-24 w-36 items-center justify-center rounded-xl border-2 transition-all ${
                feedback === "correct" && currentQ.answer === "left"
                  ? "border-[var(--color-success)] bg-[var(--color-success)]/10 text-[var(--color-success)]"
                  : "border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/5"
              }`}
            >
              <span className="text-2xl font-bold">{currentQ.leftDisplay}</span>
            </button>

            <button
              onClick={() => handleChoice("equal")}
              disabled={feedback === "correct"}
              className={`flex h-16 w-16 items-center justify-center rounded-full border-2 text-lg font-bold transition-all ${
                feedback === "correct" && currentQ.answer === "equal"
                  ? "border-[var(--color-success)] bg-[var(--color-success)]/10 text-[var(--color-success)]"
                  : "border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/5"
              }`}
            >
              =
            </button>

            <button
              onClick={() => handleChoice("right")}
              disabled={feedback === "correct"}
              className={`flex h-24 w-36 items-center justify-center rounded-xl border-2 transition-all ${
                feedback === "correct" && currentQ.answer === "right"
                  ? "border-[var(--color-success)] bg-[var(--color-success)]/10 text-[var(--color-success)]"
                  : "border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/5"
              }`}
            >
              <span className="text-2xl font-bold">{currentQ.rightDisplay}</span>
            </button>
          </div>

          {feedback && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-center"
            >
              <p
                className={`text-sm font-medium ${
                  feedback === "correct"
                    ? "text-[var(--color-success)]"
                    : "text-[var(--color-error)]"
                }`}
              >
                {feedback === "correct" ? t("correct") : t("incorrect")}
              </p>
              {feedback === "correct" && (
                <button
                  onClick={nextQuestion}
                  className="mt-3 rounded-lg bg-[var(--color-success)] px-6 py-2 font-medium text-white"
                >
                  {t("next")}
                </button>
              )}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
