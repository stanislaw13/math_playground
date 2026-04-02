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
import Confetti from "@/components/ui/Confetti";

// ---------------------------------------------------------------------------
// Skill categories
// ---------------------------------------------------------------------------

const CATEGORIES: SkillCategory[] = [
  { id: "place-tenths", label: "Placing Tenths" },
  { id: "place-hundredths", label: "Placing Hundredths" },
  { id: "place-mixed", label: "Mixed Decimals" },
];

// ---------------------------------------------------------------------------
// Question generation
// ---------------------------------------------------------------------------

interface PlacementQuestion {
  category: string;
  difficulty: Difficulty;
  target: number;
  rangeStart: number;
  rangeEnd: number;
  step: number;
  tolerance: number;
  hints: HintStep[];
}

function generateQuestion(category: string, difficulty: Difficulty): PlacementQuestion {
  switch (category) {
    case "place-tenths": {
      const base = adaptiveInt(difficulty, [0, 5], [0, 10], [0, 15]);
      const tenth = Math.floor(Math.random() * 9) + 1;
      const target = base + tenth / 10;
      return {
        category, difficulty, target,
        rangeStart: base, rangeEnd: base + 1, step: 0.1, tolerance: 0.05,
        hints: [
          { text: `${target} is between ${base} and ${base + 1}` },
          { text: `The tenths digit is ${tenth}`, latex: `${target} = ${base} + \\frac{${tenth}}{10}` },
          { text: `Count ${tenth} tenths from ${base}`, latex: `${target}` },
        ],
      };
    }
    case "place-hundredths": {
      const base = adaptiveInt(difficulty, [0, 3], [0, 8], [0, 15]);
      const tenth = Math.floor(Math.random() * 10);
      const hund = Math.floor(Math.random() * 9) + 1;
      const target = parseFloat((base + tenth / 10 + hund / 100).toFixed(2));
      const rStart = parseFloat((base + tenth / 10).toFixed(1));
      const rEnd = parseFloat((rStart + 0.1).toFixed(1));
      return {
        category, difficulty, target,
        rangeStart: rStart, rangeEnd: rEnd, step: 0.01, tolerance: 0.005,
        hints: [
          { text: `${target} is between ${rStart} and ${rEnd}` },
          { text: `The hundredths digit is ${hund}`, latex: `${target} = ${rStart} + \\frac{${hund}}{100}` },
          { text: `Place it at ${target}`, latex: `${target}` },
        ],
      };
    }
    default: { // place-mixed
      const base = adaptiveInt(difficulty, [0, 5], [0, 10], [0, 15]);
      const decimal = difficulty === "easy"
        ? (Math.floor(Math.random() * 4) + 1) * 0.25
        : difficulty === "medium"
          ? Math.floor(Math.random() * 99 + 1) / 100
          : Math.floor(Math.random() * 99 + 1) / 100;
      const target = parseFloat((base + decimal).toFixed(2));
      return {
        category, difficulty, target,
        rangeStart: base, rangeEnd: base + 1, step: 0.05, tolerance: 0.03,
        hints: [
          { text: `${target} is between ${base} and ${base + 1}` },
          { text: `Think about what ${target} means in tenths and hundredths` },
          { text: `Place it at ${target}`, latex: `${target}` },
        ],
      };
    }
  }
}

const TOTAL_QUESTIONS = 10;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function NumberLinePlacement() {
  const t = useTranslations("decimals");
  const tg = useTranslations("games");
  const { user } = useAuth();
  const engine = useAdaptiveEngine(CATEGORIES);

  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [currentQ, setCurrentQ] = useState<PlacementQuestion | null>(null);
  const [sliderVal, setSliderVal] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [score, setScore] = useState(0);

  const generateNext = useCallback(() => {
    const { category, difficulty } = engine.pickNext();
    return generateQuestion(category, difficulty);
  }, [engine]);

  const startGame = useCallback(() => {
    const q = generateNext();
    setCurrentQ(q);
    setSliderVal((q.rangeStart + q.rangeEnd) / 2);
    setQuestionIndex(0);
    setFeedback(null);
    setWrongAttempts(0);
    setScore(0);
    setFinished(false);
    setStarted(true);
  }, [generateNext]);

  const checkAnswer = () => {
    if (!currentQ) return;
    if (Math.abs(sliderVal - currentQ.target) <= currentQ.tolerance) {
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
      if (user) saveGameScore(user.id, "primary-decimals", "number-line-placement", score, 1000);
      return;
    }
    const q = generateNext();
    setQuestionIndex((i) => i + 1);
    setCurrentQ(q);
    setSliderVal((q.rangeStart + q.rangeEnd) / 2);
    setFeedback(null);
    setWrongAttempts(0);
  };

  if (!started) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-8 text-center">
        <h2 className="mb-2 text-2xl font-bold">{t("placementTitle")}</h2>
        <p className="mb-6 text-[var(--color-text-secondary)]">{t("placementDesc")}</p>
        <button onClick={startGame} className="rounded-lg bg-[var(--color-accent)] px-6 py-3 font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]">
          {tg("startGame")}
        </button>
      </div>
    );
  }

  if (finished) {
    const summary = engine.getSummary();
    const isPerfect = score >= 1000;
    return (
      <>
        {isPerfect && <Confetti />}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-8 text-center">
          <h2 className="mb-4 text-2xl font-bold">{isPerfect ? "🏆 " : ""}{tg("complete")}</h2>
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
      </>
    );
  }

  if (!currentQ) return null;

  // Render a simple number line with ticks using divs (lightweight, no Mafs dependency)
  const tickCount = Math.round((currentQ.rangeEnd - currentQ.rangeStart) / currentQ.step);
  const majorEvery = currentQ.step === 0.01 ? 5 : currentQ.step === 0.05 ? 2 : 1;

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
          {/* Target */}
          <div className="mb-4 rounded-lg bg-[var(--color-bg-tertiary)] p-4 text-center">
            <p className="text-sm text-[var(--color-text-secondary)]">{t("placeOnLine")}</p>
            <p className="text-3xl font-bold text-[var(--color-accent)]">{currentQ.target}</p>
          </div>

          {/* Number line with labels */}
          <div className="mb-2">
            <div className="relative mx-4">
              {/* Tick labels at start and end */}
              <div className="flex justify-between text-sm font-mono text-[var(--color-text-secondary)]">
                <span>{currentQ.rangeStart}</span>
                <span>{((currentQ.rangeStart + currentQ.rangeEnd) / 2).toFixed(currentQ.step < 0.1 ? 2 : 1)}</span>
                <span>{currentQ.rangeEnd}</span>
              </div>
              {/* Line with tick marks */}
              <div className="relative mt-1 h-6 w-full">
                <div className="absolute top-3 h-0.5 w-full bg-[var(--color-text-secondary)]" />
                {Array.from({ length: tickCount + 1 }).map((_, i) => {
                  const isMajor = i % majorEvery === 0;
                  return (
                    <div
                      key={i}
                      className={`absolute bg-[var(--color-text-secondary)] ${isMajor ? "h-4 w-0.5 top-1" : "h-2 w-px top-2"}`}
                      style={{ left: `${(i / tickCount) * 100}%` }}
                    />
                  );
                })}
                {/* User's marker */}
                <div
                  className="absolute top-0 h-6 w-1 rounded bg-[var(--color-accent)]"
                  style={{ left: `${((sliderVal - currentQ.rangeStart) / (currentQ.rangeEnd - currentQ.rangeStart)) * 100}%`, transform: "translateX(-50%)" }}
                />
              </div>
            </div>
            {/* Slider */}
            <input
              type="range"
              min={currentQ.rangeStart}
              max={currentQ.rangeEnd}
              step={currentQ.step}
              value={sliderVal}
              onChange={(e) => setSliderVal(parseFloat(e.target.value))}
              className="mt-2 w-full"
              disabled={feedback === "correct"}
            />
            <p className="text-center font-mono text-sm text-[var(--color-text-secondary)]">
              {t("yourPosition")}: {sliderVal.toFixed(currentQ.step < 0.1 ? 2 : 1)}
            </p>
          </div>

          {/* Buttons */}
          <div className="mt-4 flex justify-center gap-3">
            {feedback !== "correct" ? (
              <button onClick={checkAnswer} className="rounded-lg bg-[var(--color-accent)] px-6 py-2 font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]">
                {t("check")}
              </button>
            ) : (
              <button onClick={nextQuestion} className="rounded-lg bg-[var(--color-success)] px-6 py-2 font-medium text-white">
                {t("next")}
              </button>
            )}
          </div>

          {feedback && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className={`mt-3 text-center text-sm font-medium ${feedback === "correct" ? "text-[var(--color-success)]" : "text-[var(--color-error)]"}`}>
              {feedback === "correct" ? t("correct") : t("tryCloser")}
            </motion.p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
