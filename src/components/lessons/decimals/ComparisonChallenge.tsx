"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth/context";
import { getPointsForAttempt, getMaxPerQuestion } from "@/lib/scoring";
import { saveGameScore } from "@/lib/progress";
import useAdaptiveEngine from "@/hooks/useAdaptiveEngine";
import { adaptiveInt, type Difficulty, type SkillCategory } from "@/lib/adaptiveEngine";
import HintSystem, { type HintStep } from "@/components/lessons/HintSystem";

const CATEGORIES: SkillCategory[] = [
  { id: "compare-same-length", label: "Same-Length Decimals" },
  { id: "compare-different-length", label: "Different-Length Decimals" },
  { id: "compare-near-boundary", label: "Near Whole Numbers" },
];

interface CompareQuestion {
  category: string;
  difficulty: Difficulty;
  left: number;
  right: number;
  answer: "left" | "right" | "equal";
  hints: HintStep[];
}

function generateQuestion(category: string, difficulty: Difficulty): CompareQuestion {
  const base = adaptiveInt(difficulty, [0, 5], [0, 10], [0, 15]);

  switch (category) {
    case "compare-same-length": {
      // Both have the same number of decimal digits
      const places = difficulty === "easy" ? 1 : 2;
      const factor = places === 1 ? 10 : 100;
      const a = base + (Math.floor(Math.random() * (factor - 1)) + 1) / factor;
      let b = base + (Math.floor(Math.random() * (factor - 1)) + 1) / factor;
      // Occasionally make them equal
      if (Math.random() < 0.15) b = a;
      const left = parseFloat(a.toFixed(places));
      const right = parseFloat(b.toFixed(places));
      const answer = left > right ? "left" : left < right ? "right" : "equal";
      return {
        category, difficulty, left, right, answer,
        hints: [
          { text: "Compare digit by digit from left to right" },
          { text: `Ones: ${Math.floor(left)} vs ${Math.floor(right)}` },
          { text: `${left} ${left > right ? ">" : left < right ? "<" : "="} ${right}` },
        ],
      };
    }
    case "compare-different-length": {
      // Classic misconception: 0.3 vs 0.25 — different decimal lengths
      const tenths = Math.floor(Math.random() * 9) + 1;
      const hundA = Math.floor(Math.random() * 9) + 1;
      const hundB = Math.floor(Math.random() * 9) + 1;
      // One number with 1 decimal place, one with 2
      const left = parseFloat((base + tenths / 10).toFixed(1));
      const right = parseFloat((base + hundA / 10 + hundB / 100).toFixed(2));
      const answer = left > right ? "left" : left < right ? "right" : "equal";
      return {
        category, difficulty, left, right, answer,
        hints: [
          { text: "Pad with zeros to make same length", latex: `${left.toFixed(2)} \\text{ vs } ${right.toFixed(2)}` },
          { text: "Now compare digit by digit" },
          { text: `${left} ${left > right ? ">" : left < right ? "<" : "="} ${right}` },
        ],
      };
    }
    default: { // compare-near-boundary
      // Numbers near a whole number: e.g. 4.99 vs 5.01
      const boundary = adaptiveInt(difficulty, [1, 5], [1, 10], [1, 15]);
      const offsetA = difficulty === "easy"
        ? (Math.random() < 0.5 ? -0.1 : 0.1)
        : (Math.random() < 0.5 ? -(Math.floor(Math.random() * 9) + 1) / 100 : (Math.floor(Math.random() * 9) + 1) / 100);
      const offsetB = difficulty === "easy"
        ? (Math.random() < 0.5 ? -0.2 : 0.2)
        : (Math.random() < 0.5 ? -(Math.floor(Math.random() * 9) + 1) / 100 : (Math.floor(Math.random() * 9) + 1) / 100);
      const left = parseFloat((boundary + offsetA).toFixed(2));
      const right = parseFloat((boundary + offsetB).toFixed(2));
      const answer = left > right ? "left" : left < right ? "right" : "equal";
      return {
        category, difficulty, left, right, answer,
        hints: [
          { text: "Think about which side of the whole number each decimal is" },
          { text: `${left} is ${left < boundary ? "below" : "above"} ${boundary}, ${right} is ${right < boundary ? "below" : "above"} ${boundary}` },
          { text: `${left} ${left > right ? ">" : left < right ? "<" : "="} ${right}` },
        ],
      };
    }
  }
}

const TOTAL_QUESTIONS = 12;

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
      setScore((s) => s + points);
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

  if (!started) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-8 text-center">
        <h2 className="mb-2 text-2xl font-bold">{t("comparisonTitle")}</h2>
        <p className="mb-6 text-[var(--color-text-secondary)]">{t("comparisonDesc")}</p>
        <button onClick={startGame} className="rounded-lg bg-[var(--color-accent)] px-6 py-3 font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]">
          {tg("startGame")}
        </button>
      </div>
    );
  }

  if (finished) {
    const summary = engine.getSummary();
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-8 text-center">
        <h2 className="mb-4 text-2xl font-bold">{tg("complete")}</h2>
        <p className="mb-2 text-3xl font-bold text-[var(--color-accent)]">{score} / 1000</p>
        <p className="mb-4 text-[var(--color-text-secondary)]">{Math.round(summary.overallAccuracy * 100)}%</p>
        {summary.weakToStrong.length > 0 && summary.weakToStrong[0].accuracy < 0.7 && (
          <div className="mb-4 rounded-lg bg-[var(--color-bg-tertiary)] p-4 text-left">
            <p className="mb-2 text-sm font-medium text-[var(--color-text-secondary)]">{t("keepPracticing")}:</p>
            {summary.weakToStrong.filter((s) => s.accuracy < 0.7).map((s) => (
              <p key={s.id} className="text-sm">{s.label} — {Math.round(s.accuracy * 100)}%</p>
            ))}
          </div>
        )}
        <button onClick={startGame} className="rounded-lg bg-[var(--color-accent)] px-6 py-3 font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]">
          {tg("tryAgain")}
        </button>
      </motion.div>
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
        <motion.div key={questionIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          <p className="mb-4 text-center text-sm text-[var(--color-text-secondary)]">{t("whichIsBigger")}</p>

          {/* Two big number cards + equal button */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => handleChoice("left")}
              disabled={feedback === "correct"}
              className={`flex h-24 w-36 items-center justify-center rounded-xl border-2 text-2xl font-bold transition-all ${
                feedback === "correct" && currentQ.answer === "left"
                  ? "border-[var(--color-success)] bg-[var(--color-success)]/10 text-[var(--color-success)]"
                  : "border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/5"
              }`}
            >
              {currentQ.left}
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
              className={`flex h-24 w-36 items-center justify-center rounded-xl border-2 text-2xl font-bold transition-all ${
                feedback === "correct" && currentQ.answer === "right"
                  ? "border-[var(--color-success)] bg-[var(--color-success)]/10 text-[var(--color-success)]"
                  : "border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/5"
              }`}
            >
              {currentQ.right}
            </button>
          </div>

          {feedback && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-center">
              <p className={`text-sm font-medium ${feedback === "correct" ? "text-[var(--color-success)]" : "text-[var(--color-error)]"}`}>
                {feedback === "correct" ? t("correct") : t("incorrect")}
              </p>
              {feedback === "correct" && (
                <button onClick={nextQuestion} className="mt-3 rounded-lg bg-[var(--color-success)] px-6 py-2 font-medium text-white">
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
