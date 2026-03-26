"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth/context";
import { getPointsForAttempt, getMaxPerQuestion } from "@/lib/scoring";
import { saveGameScore } from "@/lib/progress";
import HintSystem, { type HintStep } from "@/components/lessons/HintSystem";

interface Question {
  shape: string;
  questionText: string;
  answer: number;
  hints: HintStep[];
}

function generateQuestions(t: (key: string) => string): Question[] {
  const questions: Question[] = [];
  const aS = t("areaSymbol");

  // Square: find area
  const sq1 = Math.floor(Math.random() * 8) + 2;
  questions.push({
    shape: t("square"),
    answer: sq1 * sq1,
    questionText: `${t("square")}: a = ${sq1}. ${aS} = ?`,
    hints: [
      { text: `${t("formula")}: ${aS} = a²` },
      { text: `${aS} = ${sq1}²`, latex: `${aS} = ${sq1}^2` },
      { text: `${aS} = ${sq1 * sq1}`, latex: `${aS} = ${sq1 * sq1}` },
    ],
  });

  // Rectangle: find area
  const rw = Math.floor(Math.random() * 7) + 2;
  const rh = Math.floor(Math.random() * 7) + 2;
  questions.push({
    shape: t("rectangle"),
    answer: rw * rh,
    questionText: `${t("rectangle")}: a = ${rw}, b = ${rh}. ${aS} = ?`,
    hints: [
      { text: `${t("formula")}: ${aS} = a · b` },
      { text: `${aS} = ${rw} · ${rh}`, latex: `${aS} = ${rw} \\cdot ${rh}` },
      { text: `${aS} = ${rw * rh}`, latex: `${aS} = ${rw * rh}` },
    ],
  });

  // Triangle: find area
  const tb = Math.floor(Math.random() * 8) + 2;
  const th = Math.floor(Math.random() * 8) + 2;
  questions.push({
    shape: t("triangle"),
    answer: (tb * th) / 2,
    questionText: `${t("triangle")}: a = ${tb}, h = ${th}. ${aS} = ?`,
    hints: [
      { text: `${t("formula")}: ${aS} = (a · h) / 2` },
      { text: `${aS} = (${tb} · ${th}) / 2`, latex: `${aS} = \\frac{${tb} \\cdot ${th}}{2}` },
      { text: `${aS} = ${(tb * th) / 2}`, latex: `${aS} = ${(tb * th) / 2}` },
    ],
  });

  // Diamond: find area
  const dd1 = Math.floor(Math.random() * 8) + 2;
  const dd2 = Math.floor(Math.random() * 8) + 2;
  questions.push({
    shape: t("diamond"),
    answer: (dd1 * dd2) / 2,
    questionText: `${t("diamond")}: d₁ = ${dd1}, d₂ = ${dd2}. ${aS} = ?`,
    hints: [
      { text: `${t("formula")}: ${aS} = (d₁ · d₂) / 2` },
      { text: `${aS} = (${dd1} · ${dd2}) / 2`, latex: `${aS} = \\frac{${dd1} \\cdot ${dd2}}{2}` },
      { text: `${aS} = ${(dd1 * dd2) / 2}`, latex: `${aS} = ${(dd1 * dd2) / 2}` },
    ],
  });

  // Trapezoid: find area
  const ta = Math.floor(Math.random() * 6) + 3;
  const tbs = Math.floor(Math.random() * 4) + 1;
  const tth = Math.floor(Math.random() * 6) + 2;
  questions.push({
    shape: t("trapezoid"),
    answer: ((ta + tbs) * tth) / 2,
    questionText: `${t("trapezoid")}: a = ${ta}, b = ${tbs}, h = ${tth}. ${aS} = ?`,
    hints: [
      { text: `${t("formula")}: ${aS} = (a + b) · h / 2` },
      { text: `${aS} = (${ta} + ${tbs}) · ${tth} / 2`, latex: `${aS} = \\frac{(${ta} + ${tbs}) \\cdot ${tth}}{2}` },
      { text: `${aS} = ${((ta + tbs) * tth) / 2}`, latex: `${aS} = ${((ta + tbs) * tth) / 2}` },
    ],
  });

  // Square: find side from area
  const sq2 = Math.floor(Math.random() * 8) + 2;
  questions.push({
    shape: t("square"),
    answer: sq2,
    questionText: `${t("square")}: ${aS} = ${sq2 * sq2}. a = ?`,
    hints: [
      { text: `${t("formula")}: ${aS} = a²` },
      { text: `a = √${aS}`, latex: `a = \\sqrt{${aS}}` },
      { text: `a = √${sq2 * sq2} = ${sq2}`, latex: `a = \\sqrt{${sq2 * sq2}} = ${sq2}` },
    ],
  });

  // Rectangle: find width from area and height
  const rw2 = Math.floor(Math.random() * 7) + 2;
  const rh2 = Math.floor(Math.random() * 7) + 2;
  questions.push({
    shape: t("rectangle"),
    answer: rw2,
    questionText: `${t("rectangle")}: ${aS} = ${rw2 * rh2}, b = ${rh2}. a = ?`,
    hints: [
      { text: `${t("formula")}: ${aS} = a · b` },
      { text: `a = ${aS} / b`, latex: `a = \\frac{${aS}}{b}` },
      { text: `a = ${rw2 * rh2} / ${rh2} = ${rw2}`, latex: `a = \\frac{${rw2 * rh2}}{${rh2}} = ${rw2}` },
    ],
  });

  // Triangle: find height from area and base
  const tb2 = Math.floor(Math.random() * 8) + 2;
  const th2 = Math.floor(Math.random() * 8) + 2;
  questions.push({
    shape: t("triangle"),
    answer: th2,
    questionText: `${t("triangle")}: ${aS} = ${(tb2 * th2) / 2}, a = ${tb2}. h = ?`,
    hints: [
      { text: `${t("formula")}: ${aS} = (a · h) / 2` },
      { text: `h = 2${aS} / a`, latex: `h = \\frac{2 \\cdot ${aS}}{a}` },
      { text: `h = 2 · ${(tb2 * th2) / 2} / ${tb2} = ${th2}`, latex: `h = \\frac{2 \\cdot ${(tb2 * th2) / 2}}{${tb2}} = ${th2}` },
    ],
  });

  // Shuffle
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }

  return questions;
}

export default function AreasQuiz() {
  const t = useTranslations("areas");
  const { user } = useAuth();
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const startQuiz = useCallback(() => {
    setQuestions(generateQuestions(t));
    setCurrentIndex(0);
    setScore(0);
    setWrongAttempts(0);
    setFinished(false);
    setStarted(true);
    setFeedback(null);
    setUserAnswer("");
  }, [t]);

  const checkAnswer = () => {
    const parsed = parseFloat(userAnswer);
    if (isNaN(parsed)) return;

    const isCorrect = Math.abs(parsed - questions[currentIndex].answer) < 0.01;

    if (isCorrect) {
      const tryNumber = wrongAttempts + 1;
      const maxPer = getMaxPerQuestion(questions.length);
      const points = getPointsForAttempt(tryNumber, maxPer);
      setScore((s) => s + points);
      setFeedback("correct");
    } else {
      setWrongAttempts((w) => w + 1);
      setFeedback("incorrect");
    }
  };

  const nextQuestion = () => {
    setFeedback(null);
    setUserAnswer("");
    setWrongAttempts(0);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1);
    } else {
      setFinished(true);
      if (user) {
        saveGameScore(user.id, "primary-areas", "areas-quiz", score, 1000);
      }
    }
  };

  if (!started) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-8 text-center">
        <h2 className="mb-2 text-2xl font-bold">{t("quizTitle")}</h2>
        <p className="mb-6 text-[var(--color-text-secondary)]">{t("quizDesc")}</p>
        <button
          onClick={startQuiz}
          className="rounded-lg bg-[var(--color-accent)] px-6 py-3 font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
        >
          {t("startQuiz")}
        </button>
      </div>
    );
  }

  if (finished) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-8 text-center"
      >
        <h2 className="mb-4 text-2xl font-bold">{t("quizComplete")}</h2>
        <p className="mb-2 text-3xl font-bold text-[var(--color-accent)]">
          {score} / 1000
        </p>
        <p className="mb-6 text-[var(--color-text-secondary)]">
          {t("quizAccuracy", { accuracy: Math.round((score / 1000) * 100) })}
        </p>
        <button
          onClick={startQuiz}
          className="rounded-lg bg-[var(--color-accent)] px-6 py-3 font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
        >
          {t("tryAgain")}
        </button>
      </motion.div>
    );
  }

  const q = questions[currentIndex];

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {t("questionOf", {
              current: currentIndex + 1,
              total: questions.length,
            })}
          </p>
          <p className="text-xs font-mono text-[var(--color-accent)]">
            {score} pts
          </p>
        </div>
        <HintSystem steps={q.hints} wrongAttempts={wrongAttempts} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <p className="mb-6 text-lg font-medium">{q.questionText}</p>

          <div className="flex items-center gap-3">
            <input
              type="number"
              step="any"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (feedback === "correct") nextQuestion();
                  else if (!feedback || feedback === "incorrect") checkAnswer();
                }
              }}
              placeholder={t("yourAnswer")}
              className="w-48 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-4 py-2 text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
              disabled={feedback === "correct"}
              autoFocus
            />
            {feedback !== "correct" && (
              <button
                onClick={checkAnswer}
                className="rounded-lg bg-[var(--color-accent)] px-4 py-2 font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
              >
                {t("checkAnswer")}
              </button>
            )}
            {feedback === "correct" && (
              <button
                onClick={nextQuestion}
                className="rounded-lg bg-[var(--color-success)] px-4 py-2 font-medium text-white"
              >
                {t("nextQuestion")}
              </button>
            )}
          </div>

          {feedback && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`mt-3 text-sm font-medium ${
                feedback === "correct"
                  ? "text-[var(--color-success)]"
                  : "text-[var(--color-error)]"
              }`}
            >
              {feedback === "correct" ? t("correct") : t("incorrect")}
            </motion.p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
