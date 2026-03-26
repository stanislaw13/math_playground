"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/client";
import HintSystem, { type HintStep } from "@/components/lessons/HintSystem";

interface DetectiveQuestion {
  shapeName: string;
  givenText: string;
  askText: string;
  answer: number;
  hints: HintStep[];
}

function generateQuestions(t: (key: string) => string, aS: string, pS: string): DetectiveQuestion[] {
  const questions: DetectiveQuestion[] = [];

  // Rectangle: given area and one side, find the other
  const rw = Math.floor(Math.random() * 10) + 2;
  const rh = Math.floor(Math.random() * 10) + 2;
  const rArea = rw * rh;
  questions.push({
    shapeName: t("areas.rectangle"),
    givenText: `${aS} = ${rArea}, b = ${rh}`,
    askText: "a = ?",
    answer: rw,
    hints: [
      { text: `${t("areas.formula")}: ${aS} = a · b` },
      { text: `a = ${aS} ÷ b`, latex: `a = \\frac{${aS}}{b}` },
      { text: `a = ${rArea} ÷ ${rh} = ${rw}`, latex: `a = \\frac{${rArea}}{${rh}} = ${rw}` },
    ],
  });

  // Rectangle: given perimeter and one side, find the other
  const rw2 = Math.floor(Math.random() * 8) + 2;
  const rh2 = Math.floor(Math.random() * 8) + 2;
  const rPerim = 2 * (rw2 + rh2);
  questions.push({
    shapeName: t("areas.rectangle"),
    givenText: `${pS} = ${rPerim}, a = ${rw2}`,
    askText: "b = ?",
    answer: rh2,
    hints: [
      { text: `${t("areas.formula")}: ${pS} = 2(a + b)` },
      { text: `b = ${pS}/2 - a`, latex: `b = \\frac{${pS}}{2} - a` },
      { text: `b = ${rPerim}/2 - ${rw2} = ${rh2}`, latex: `b = \\frac{${rPerim}}{2} - ${rw2} = ${rh2}` },
    ],
  });

  // Square: given area, find side
  const sq = Math.floor(Math.random() * 10) + 2;
  questions.push({
    shapeName: t("areas.square"),
    givenText: `${aS} = ${sq * sq}`,
    askText: "a = ?",
    answer: sq,
    hints: [
      { text: `${t("areas.formula")}: ${aS} = a²` },
      { text: `a = √${aS}`, latex: `a = \\sqrt{${aS}}` },
      { text: `a = √${sq * sq} = ${sq}`, latex: `a = \\sqrt{${sq * sq}} = ${sq}` },
    ],
  });

  // Square: given perimeter, find side
  const sq2 = Math.floor(Math.random() * 10) + 2;
  questions.push({
    shapeName: t("areas.square"),
    givenText: `${pS} = ${sq2 * 4}`,
    askText: "a = ?",
    answer: sq2,
    hints: [
      { text: `${t("areas.formula")}: ${pS} = 4a` },
      { text: `a = ${pS} ÷ 4`, latex: `a = \\frac{${pS}}{4}` },
      { text: `a = ${sq2 * 4} ÷ 4 = ${sq2}`, latex: `a = \\frac{${sq2 * 4}}{4} = ${sq2}` },
    ],
  });

  // Triangle: given area and base, find height
  const tb = Math.floor(Math.random() * 10) + 2;
  const th = Math.floor(Math.random() * 10) + 2;
  const tArea = (tb * th) / 2;
  questions.push({
    shapeName: t("areas.triangle"),
    givenText: `${aS} = ${tArea}, a = ${tb}`,
    askText: "h = ?",
    answer: th,
    hints: [
      { text: `${t("areas.formula")}: ${aS} = (a · h) / 2` },
      { text: `h = 2${aS} ÷ a`, latex: `h = \\frac{2 \\cdot ${aS}}{a}` },
      { text: `h = 2·${tArea} ÷ ${tb} = ${th}`, latex: `h = \\frac{2 \\cdot ${tArea}}{${tb}} = ${th}` },
    ],
  });

  // Diamond: given area and one diagonal, find the other
  const dd1 = Math.floor(Math.random() * 10) + 2;
  const dd2 = Math.floor(Math.random() * 10) + 2;
  const dArea = (dd1 * dd2) / 2;
  questions.push({
    shapeName: t("areas.diamond"),
    givenText: `${aS} = ${dArea}, d₁ = ${dd1}`,
    askText: "d₂ = ?",
    answer: dd2,
    hints: [
      { text: `${t("areas.formula")}: ${aS} = (d₁ · d₂) / 2` },
      { text: `d₂ = 2${aS} ÷ d₁`, latex: `d_2 = \\frac{2 \\cdot ${aS}}{d_1}` },
      { text: `d₂ = 2·${dArea} ÷ ${dd1} = ${dd2}`, latex: `d_2 = \\frac{2 \\cdot ${dArea}}{${dd1}} = ${dd2}` },
    ],
  });

  // Trapezoid: given area, height, and one base, find the other
  const ta = Math.floor(Math.random() * 8) + 3;
  const tbs = Math.floor(Math.random() * 5) + 1;
  const tth = Math.floor(Math.random() * 8) + 2;
  const trArea = ((ta + tbs) * tth) / 2;
  questions.push({
    shapeName: t("areas.trapezoid"),
    givenText: `${aS} = ${trArea}, a = ${ta}, h = ${tth}`,
    askText: "b = ?",
    answer: tbs,
    hints: [
      { text: `${t("areas.formula")}: ${aS} = (a + b) · h / 2` },
      { text: `b = 2${aS}/h - a`, latex: `b = \\frac{2 \\cdot ${aS}}{h} - a` },
      { text: `b = 2·${trArea}/${tth} - ${ta} = ${tbs}`, latex: `b = \\frac{2 \\cdot ${trArea}}{${tth}} - ${ta} = ${tbs}` },
    ],
  });

  // Shuffle
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }

  return questions;
}

export default function Detective() {
  const t = useTranslations();
  const tg = useTranslations("games");
  const aS = t("areas.areaSymbol");
  const pS = t("areas.perimeterSymbol");
  const { user } = useAuth();

  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState<DetectiveQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [finished, setFinished] = useState(false);

  const startGame = useCallback(() => {
    setQuestions(generateQuestions(t, aS, pS));
    setCurrentIndex(0);
    setUserAnswer("");
    setFeedback(null);
    setWrongAttempts(0);
    setCorrectCount(0);
    setTotalAttempts(0);
    setFinished(false);
    setStarted(true);
  }, [t, aS, pS]);

  const checkAnswer = () => {
    const parsed = parseFloat(userAnswer);
    if (isNaN(parsed)) return;
    setTotalAttempts((a) => a + 1);
    if (Math.abs(parsed - questions[currentIndex].answer) < 0.01) {
      setCorrectCount((c) => c + 1);
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
      saveAttempt();
    }
  };

  const saveAttempt = async () => {
    if (!user) return;
    const supabase = createClient();
    if (!supabase) return;
    await supabase.from("game_attempts").insert({
      user_id: user.id,
      lesson_id: "primary-areas",
      game_id: "detective",
      score: correctCount,
      max_score: questions.length,
      accuracy: questions.length > 0 ? (correctCount / questions.length) * 100 : 0,
    });
  };

  if (!started) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-8 text-center">
        <h2 className="mb-2 text-2xl font-bold">{tg("detective")}</h2>
        <p className="mb-6 text-[var(--color-text-secondary)]">{tg("detectiveDesc")}</p>
        <button onClick={startGame} className="rounded-lg bg-[var(--color-accent)] px-6 py-3 font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]">
          {tg("startGame")}
        </button>
      </div>
    );
  }

  if (finished) {
    const accuracy = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-8 text-center">
        <h2 className="mb-4 text-2xl font-bold">{t("areas.quizComplete")}</h2>
        <p className="mb-2 text-lg">{t("areas.quizScore", { score: correctCount, total: questions.length })}</p>
        <p className="mb-2 text-[var(--color-text-secondary)]">{t("areas.quizAccuracy", { accuracy })}</p>
        <p className="mb-6 text-sm text-[var(--color-text-secondary)]">{t("common.attempts")}: {totalAttempts}</p>
        <button onClick={startGame} className="rounded-lg bg-[var(--color-accent)] px-6 py-3 font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]">
          {t("areas.tryAgain")}
        </button>
      </motion.div>
    );
  }

  const q = questions[currentIndex];

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{tg("detective")}</h3>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {t("areas.questionOf", { current: currentIndex + 1, total: questions.length })}
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
          <div className="mb-4 rounded-lg bg-[var(--color-bg-tertiary)] p-4">
            <p className="mb-1 text-sm text-[var(--color-text-secondary)]">{q.shapeName}</p>
            <p className="text-lg">
              <span className="text-[var(--color-text-secondary)]">{tg("givenClue")}: </span>
              <span className="font-medium">{q.givenText}</span>
            </p>
            <p className="mt-2 text-xl font-bold text-[var(--color-accent)]">{q.askText}</p>
          </div>

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
              placeholder={t("areas.yourAnswer")}
              className="w-48 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-4 py-2 text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
              disabled={feedback === "correct"}
              autoFocus
            />
            {feedback !== "correct" && (
              <button onClick={checkAnswer} className="rounded-lg bg-[var(--color-accent)] px-4 py-2 font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]">
                {t("areas.checkAnswer")}
              </button>
            )}
            {feedback === "correct" && (
              <button onClick={nextQuestion} className="rounded-lg bg-[var(--color-success)] px-4 py-2 font-medium text-white">
                {t("areas.nextQuestion")}
              </button>
            )}
          </div>

          {feedback && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`mt-3 text-sm font-medium ${feedback === "correct" ? "text-[var(--color-success)]" : "text-[var(--color-error)]"}`}>
              {feedback === "correct" ? t("areas.correct") : t("areas.incorrect")}
            </motion.p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
