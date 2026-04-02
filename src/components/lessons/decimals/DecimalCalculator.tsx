"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth/context";
import { getPointsForAttempt, getMaxPerQuestion } from "@/lib/scoring";
import { saveGameScore } from "@/lib/progress";
import useAdaptiveEngine from "@/hooks/useAdaptiveEngine";
import { adaptiveDecimal, type Difficulty, type SkillCategory } from "@/lib/adaptiveEngine";
import HintSystem, { type HintStep } from "@/components/lessons/HintSystem";

const CATEGORIES: SkillCategory[] = [
  { id: "add-simple", label: "Addition (simple)" },
  { id: "add-carrying", label: "Addition (carrying)" },
  { id: "subtract-simple", label: "Subtraction (simple)" },
  { id: "subtract-borrowing", label: "Subtraction (borrowing)" },
];

interface CalcQuestion {
  category: string;
  difficulty: Difficulty;
  a: number;
  b: number;
  op: "+" | "−";
  answer: number;
  displayA: string;
  displayB: string;
  displayAnswer: string;
  hints: HintStep[];
}

function generateQuestion(category: string, difficulty: Difficulty): CalcQuestion {
  const dp = difficulty === "easy" ? 1 : 2;

  switch (category) {
    case "add-simple": {
      // No carrying: e.g. 2.3 + 1.4 = 3.7, or 5.12 + 3.25 = 8.37
      const a = adaptiveDecimal(difficulty, [0.1, 5.0], [1.0, 15.0], [5.0, 50.0], dp);
      const b = adaptiveDecimal(difficulty, [0.1, 4.0], [1.0, 10.0], [5.0, 40.0], dp);
      const answer = parseFloat((a + b).toFixed(dp));
      return {
        category, difficulty, a, b, op: "+", answer,
        displayA: a.toFixed(dp), displayB: b.toFixed(dp), displayAnswer: answer.toFixed(dp),
        hints: [
          { text: "Align the decimal points and add column by column" },
          { text: "Start from the rightmost digit", latex: `${a.toFixed(dp)} + ${b.toFixed(dp)}` },
          { text: `= ${answer.toFixed(dp)}`, latex: `${a.toFixed(dp)} + ${b.toFixed(dp)} = ${answer.toFixed(dp)}` },
        ],
      };
    }
    case "add-carrying": {
      // Force carrying: tenths add up to >= 10
      let a: number, b: number;
      do {
        a = adaptiveDecimal(difficulty, [0.5, 5.0], [1.0, 15.0], [5.0, 50.0], dp);
        b = adaptiveDecimal(difficulty, [0.5, 5.0], [1.0, 15.0], [5.0, 50.0], dp);
      } while (
        dp === 1
          ? (Math.round(a * 10) % 10) + (Math.round(b * 10) % 10) < 10
          : (Math.round(a * 100) % 10) + (Math.round(b * 100) % 10) < 10
      );
      const answer = parseFloat((a + b).toFixed(dp));
      return {
        category, difficulty, a, b, op: "+", answer,
        displayA: a.toFixed(dp), displayB: b.toFixed(dp), displayAnswer: answer.toFixed(dp),
        hints: [
          { text: "Watch out — you'll need to carry!" },
          { text: "Add the smallest digits first, carry 1 if the sum is ≥ 10", latex: `${a.toFixed(dp)} + ${b.toFixed(dp)}` },
          { text: `= ${answer.toFixed(dp)}`, latex: `${a.toFixed(dp)} + ${b.toFixed(dp)} = ${answer.toFixed(dp)}` },
        ],
      };
    }
    case "subtract-simple": {
      // No borrowing: each digit of a >= corresponding digit of b
      const b = adaptiveDecimal(difficulty, [0.1, 3.0], [1.0, 10.0], [5.0, 30.0], dp);
      const diff = adaptiveDecimal(difficulty, [0.1, 3.0], [0.1, 5.0], [0.1, 10.0], dp);
      const a = parseFloat((b + diff).toFixed(dp));
      const answer = parseFloat((a - b).toFixed(dp));
      return {
        category, difficulty, a, b, op: "−", answer,
        displayA: a.toFixed(dp), displayB: b.toFixed(dp), displayAnswer: answer.toFixed(dp),
        hints: [
          { text: "Align decimal points and subtract column by column" },
          { text: "Start from the rightmost digit", latex: `${a.toFixed(dp)} - ${b.toFixed(dp)}` },
          { text: `= ${answer.toFixed(dp)}`, latex: `${a.toFixed(dp)} - ${b.toFixed(dp)} = ${answer.toFixed(dp)}` },
        ],
      };
    }
    default: { // subtract-borrowing
      let a: number, b: number;
      do {
        a = adaptiveDecimal(difficulty, [1.0, 5.0], [2.0, 15.0], [5.0, 50.0], dp);
        b = adaptiveDecimal(difficulty, [0.5, 4.0], [1.0, 12.0], [3.0, 40.0], dp);
      } while (
        a <= b ||
        (dp === 1
          ? (Math.round(a * 10) % 10) >= (Math.round(b * 10) % 10)
          : (Math.round(a * 100) % 10) >= (Math.round(b * 100) % 10))
      );
      const answer = parseFloat((a - b).toFixed(dp));
      return {
        category, difficulty, a, b, op: "−", answer,
        displayA: a.toFixed(dp), displayB: b.toFixed(dp), displayAnswer: answer.toFixed(dp),
        hints: [
          { text: "You'll need to borrow from the next column" },
          { text: "Take 1 from the tenths to get 10 more hundredths", latex: `${a.toFixed(dp)} - ${b.toFixed(dp)}` },
          { text: `= ${answer.toFixed(dp)}`, latex: `${a.toFixed(dp)} - ${b.toFixed(dp)} = ${answer.toFixed(dp)}` },
        ],
      };
    }
  }
}

const TOTAL_QUESTIONS = 10;

export default function DecimalCalculator() {
  const t = useTranslations("decimals");
  const tg = useTranslations("games");
  const { user } = useAuth();
  const engine = useAdaptiveEngine(CATEGORIES);

  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [currentQ, setCurrentQ] = useState<CalcQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
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
    setUserAnswer("");
    setFeedback(null);
    setWrongAttempts(0);
    setScore(0);
    setFinished(false);
    setStarted(true);
  }, [generateNext]);

  const checkAnswer = () => {
    if (!currentQ) return;
    const parsed = parseFloat(userAnswer);
    if (isNaN(parsed)) return;
    if (Math.abs(parsed - currentQ.answer) < 0.005) {
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
      if (user) saveGameScore(user.id, "primary-decimals", "decimal-calculator", score, 1000);
      return;
    }
    setQuestionIndex((i) => i + 1);
    setCurrentQ(generateNext());
    setUserAnswer("");
    setFeedback(null);
    setWrongAttempts(0);
  };

  if (!started) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-8 text-center">
        <h2 className="mb-2 text-2xl font-bold">{t("calculatorTitle")}</h2>
        <p className="mb-6 text-[var(--color-text-secondary)]">{t("calculatorDesc")}</p>
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
          <div className="mb-6 rounded-lg bg-[var(--color-bg-tertiary)] p-6 text-center">
            <p className="text-3xl font-bold">
              {currentQ.displayA} {currentQ.op} {currentQ.displayB} = <span className="text-[var(--color-accent)]">?</span>
            </p>
          </div>

          <div className="flex items-center justify-center gap-3">
            <input
              type="number" step="any" value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (feedback === "correct") nextQuestion();
                  else checkAnswer();
                }
              }}
              placeholder={t("yourAnswer")}
              className="w-48 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-4 py-3 text-center text-lg font-mono text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
              disabled={feedback === "correct"}
              autoFocus
            />
            {feedback !== "correct" ? (
              <button onClick={checkAnswer} className="rounded-lg bg-[var(--color-accent)] px-6 py-3 font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]">
                {t("check")}
              </button>
            ) : (
              <button onClick={nextQuestion} className="rounded-lg bg-[var(--color-success)] px-6 py-3 font-medium text-white">
                {t("next")}
              </button>
            )}
          </div>

          {feedback && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className={`mt-3 text-center text-sm font-medium ${feedback === "correct" ? "text-[var(--color-success)]" : "text-[var(--color-error)]"}`}>
              {feedback === "correct" ? t("correct") : t("incorrect")}
            </motion.p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
