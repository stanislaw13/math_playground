"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Mafs, Polygon, Coordinates, Line, Theme } from "mafs";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth/context";
import { getPointsForAttempt, getMaxPerQuestion } from "@/lib/scoring";
import { saveGameScore } from "@/lib/progress";
import HintSystem, { type HintStep } from "@/components/lessons/HintSystem";

type ShapeType = "rectangle" | "triangle" | "diamond" | "trapezoid";

interface Challenge {
  shape: ShapeType;
  targetArea: number;
  hints: HintStep[];
}

function generateChallenges(t: (key: string) => string, aS: string): Challenge[] {
  const challenges: Challenge[] = [];

  // Rectangle
  const rw = Math.floor(Math.random() * 8) + 3;
  const rh = Math.floor(Math.random() * 8) + 2;
  const rArea = rw * rh;
  challenges.push({
    shape: "rectangle",
    targetArea: rArea,
    hints: [
      { text: t("areas.rectangle"), latex: `${aS} = a \\cdot b` },
      { text: `${aS} = ${rArea}`, latex: `a \\cdot b = ${rArea}` },
      { text: `${t("areas.width")} = ${rw}, ${t("areas.height")} = ${rh}`, latex: `${rw} \\cdot ${rh} = ${rArea}` },
    ],
  });

  // Triangle
  const tb = Math.floor(Math.random() * 10) + 4;
  const th = Math.floor(Math.random() * 8) + 2;
  const tArea = (tb * th) / 2;
  challenges.push({
    shape: "triangle",
    targetArea: tArea,
    hints: [
      { text: t("areas.triangle"), latex: `${aS} = \\frac{a \\cdot h}{2}` },
      { text: `${aS} = ${tArea}`, latex: `\\frac{a \\cdot h}{2} = ${tArea}` },
      { text: `a = ${tb}, h = ${th}`, latex: `\\frac{${tb} \\cdot ${th}}{2} = ${tArea}` },
    ],
  });

  // Diamond
  const dd1 = Math.floor(Math.random() * 8) + 3;
  const dd2 = Math.floor(Math.random() * 8) + 2;
  const dArea = (dd1 * dd2) / 2;
  challenges.push({
    shape: "diamond",
    targetArea: dArea,
    hints: [
      { text: t("areas.diamond"), latex: `${aS} = \\frac{d_1 \\cdot d_2}{2}` },
      { text: `${aS} = ${dArea}`, latex: `\\frac{d_1 \\cdot d_2}{2} = ${dArea}` },
      { text: `d_1 = ${dd1}, d_2 = ${dd2}`, latex: `\\frac{${dd1} \\cdot ${dd2}}{2} = ${dArea}` },
    ],
  });

  // Trapezoid
  const ta = Math.floor(Math.random() * 6) + 4;
  const tbs = Math.floor(Math.random() * 4) + 2;
  const tth = Math.floor(Math.random() * 6) + 2;
  const trArea = ((ta + tbs) * tth) / 2;
  challenges.push({
    shape: "trapezoid",
    targetArea: trArea,
    hints: [
      { text: t("areas.trapezoid"), latex: `${aS} = \\frac{(a + b) \\cdot h}{2}` },
      { text: `${aS} = ${trArea}`, latex: `\\frac{(a + b) \\cdot h}{2} = ${trArea}` },
      { text: `a = ${ta}, b = ${tbs}, h = ${tth}`, latex: `\\frac{(${ta} + ${tbs}) \\cdot ${tth}}{2} = ${trArea}` },
    ],
  });

  // Shuffle
  for (let i = challenges.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [challenges[i], challenges[j]] = [challenges[j], challenges[i]];
  }

  return challenges;
}

function ShapePreview({
  shape,
  dims,
}: {
  shape: ShapeType;
  dims: number[];
}) {
  const maxDim = Math.max(...dims, 1);
  const pad = Math.max(maxDim * 0.25, 1.5);

  let points: [number, number][] = [];
  let extraLines: { p1: [number, number]; p2: [number, number] }[] = [];

  switch (shape) {
    case "rectangle": {
      const [w, h] = dims;
      points = [[0, 0], [w, 0], [w, h], [0, h]];
      break;
    }
    case "triangle": {
      const [b, h] = dims;
      points = [[0, 0], [b, 0], [b / 2, h]];
      extraLines = [{ p1: [b / 2, 0], p2: [b / 2, h] }];
      break;
    }
    case "diamond": {
      const [d1, d2] = dims;
      const cx = d1 / 2, cy = d2 / 2;
      points = [[cx, 0], [d1, cy], [cx, d2], [0, cy]];
      extraLines = [
        { p1: [0, cy], p2: [d1, cy] },
        { p1: [cx, 0], p2: [cx, d2] },
      ];
      break;
    }
    case "trapezoid": {
      const [a, b, h] = dims;
      const offset = (a - b) / 2;
      points = [[0, 0], [a, 0], [a - Math.max(offset, 0), h], [Math.max(offset, 0), h]];
      extraLines = [{ p1: [Math.max(offset, 0), 0], p2: [Math.max(offset, 0), h] }];
      break;
    }
  }

  const allX = points.map(p => p[0]);
  const allY = points.map(p => p[1]);
  const minX = Math.min(...allX);
  const maxX = Math.max(...allX);
  const minY = Math.min(...allY);
  const maxY = Math.max(...allY);

  const colors: Record<ShapeType, string> = {
    rectangle: Theme.indigo,
    triangle: Theme.green,
    diamond: Theme.orange,
    trapezoid: Theme.violet,
  };

  return (
    <div className="flex justify-center overflow-hidden rounded-lg bg-[var(--color-bg-primary)]">
      <Mafs
        viewBox={{ x: [minX - pad, maxX + pad], y: [minY - pad, maxY + pad] }}
        height={220}
      >
        <Coordinates.Cartesian />
        <Polygon points={points} color={colors[shape]} />
        {extraLines.map((line, i) => (
          <Line.Segment
            key={i}
            point1={line.p1}
            point2={line.p2}
            color="#a1a1aa"
            style="dashed"
          />
        ))}
      </Mafs>
    </div>
  );
}

function calcArea(shape: ShapeType, dims: number[]): number {
  switch (shape) {
    case "rectangle": return dims[0] * dims[1];
    case "triangle": return (dims[0] * dims[1]) / 2;
    case "diamond": return (dims[0] * dims[1]) / 2;
    case "trapezoid": return ((dims[0] + dims[1]) * dims[2]) / 2;
  }
}

function getSliderConfig(shape: ShapeType, t: (key: string) => string): { label: string; min: number; max: number }[] {
  switch (shape) {
    case "rectangle":
      return [
        { label: `${t("areas.width")} (a)`, min: 1, max: 15 },
        { label: `${t("areas.height")} (b)`, min: 1, max: 15 },
      ];
    case "triangle":
      return [
        { label: `${t("areas.base")} (a)`, min: 1, max: 15 },
        { label: `${t("areas.height")} (h)`, min: 1, max: 15 },
      ];
    case "diamond":
      return [
        { label: `${t("areas.diagonal1")} (d₁)`, min: 1, max: 15 },
        { label: `${t("areas.diagonal2")} (d₂)`, min: 1, max: 15 },
      ];
    case "trapezoid":
      return [
        { label: `${t("areas.baseA")} (a)`, min: 1, max: 15 },
        { label: `${t("areas.baseB")} (b)`, min: 1, max: 15 },
        { label: `${t("areas.height")} (h)`, min: 1, max: 15 },
      ];
  }
}

export default function ShapeBuilder() {
  const t = useTranslations();
  const tg = useTranslations("games");
  const aS = t("areas.areaSymbol");
  const { user } = useAuth();

  const [started, setStarted] = useState(false);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dims, setDims] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const startGame = useCallback(() => {
    const ch = generateChallenges(t, aS);
    setChallenges(ch);
    setCurrentIndex(0);
    setDims(getSliderConfig(ch[0].shape, t).map(() => 3));
    setSolved(false);
    setWrongAttempts(0);
    setScore(0);
    setFinished(false);
    setStarted(true);
  }, [t, aS]);

  const checkMatch = () => {
    const challenge = challenges[currentIndex];
    const currentArea = calcArea(challenge.shape, dims);
    if (Math.abs(currentArea - challenge.targetArea) < 0.01) {
      const tryNumber = wrongAttempts + 1;
      const maxPer = getMaxPerQuestion(challenges.length);
      const points = getPointsForAttempt(tryNumber, maxPer);
      setScore((s) => s + points);
      setSolved(true);
    } else {
      setWrongAttempts((w) => w + 1);
    }
  };

  const nextChallenge = () => {
    if (currentIndex + 1 < challenges.length) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setDims(getSliderConfig(challenges[nextIdx].shape, t).map(() => 3));
      setSolved(false);
      setWrongAttempts(0);
    } else {
      setFinished(true);
      if (user) {
        saveGameScore(user.id, "primary-areas", "shape-builder", score, 1000);
      }
    }
  };

  if (!started) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-8 text-center">
        <h2 className="mb-2 text-2xl font-bold">{tg("shapeBuilder")}</h2>
        <p className="mb-6 text-[var(--color-text-secondary)]">{tg("shapeBuilderDesc")}</p>
        <button onClick={startGame} className="rounded-lg bg-[var(--color-accent)] px-6 py-3 font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]">
          {tg("startGame")}
        </button>
      </div>
    );
  }

  if (finished) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-8 text-center">
        <h2 className="mb-4 text-2xl font-bold">{t("areas.quizComplete")}</h2>
        <p className="mb-2 text-3xl font-bold text-[var(--color-accent)]">
          {score} / 1000
        </p>
        <p className="mb-6 text-[var(--color-text-secondary)]">
          {t("areas.quizAccuracy", { accuracy: Math.round((score / 1000) * 100) })}
        </p>
        <button onClick={startGame} className="rounded-lg bg-[var(--color-accent)] px-6 py-3 font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]">
          {t("areas.tryAgain")}
        </button>
      </motion.div>
    );
  }

  const challenge = challenges[currentIndex];
  const currentArea = calcArea(challenge.shape, dims);
  const isMatch = Math.abs(currentArea - challenge.targetArea) < 0.01;
  const sliders = getSliderConfig(challenge.shape, t);

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{tg("shapeBuilder")}</h3>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {tg("challenge", { current: currentIndex + 1, total: challenges.length })}
          </p>
          <p className="text-xs font-mono text-[var(--color-accent)]">
            {score} pts
          </p>
        </div>
        <HintSystem steps={challenge.hints} wrongAttempts={wrongAttempts} />
      </div>

      <div className="mb-4 rounded-lg bg-[var(--color-bg-tertiary)] p-4 text-center">
        <p className="text-sm text-[var(--color-text-secondary)]">{tg("targetArea")}</p>
        <p className="text-3xl font-bold text-[var(--color-accent)]">{challenge.targetArea}</p>
        <p className="text-xs text-[var(--color-text-secondary)]">{tg("findDimensions")}</p>
      </div>

      <ShapePreview shape={challenge.shape} dims={dims} />

      <div className="mt-4 space-y-3">
        {sliders.map((slider, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="w-28 text-sm text-[var(--color-text-secondary)]">{slider.label}</span>
            <input
              type="range"
              min={slider.min}
              max={slider.max}
              step={0.5}
              value={dims[i]}
              onChange={(e) => {
                const newDims = [...dims];
                newDims[i] = parseFloat(e.target.value);
                setDims(newDims);
              }}
              className="flex-1"
              disabled={solved}
            />
            <span className="w-12 text-right text-sm font-mono">{dims[i]}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm">
          <span className="text-[var(--color-text-secondary)]">{tg("currentArea")}: </span>
          <span className={`font-mono font-bold ${isMatch ? "text-[var(--color-success)]" : "text-[var(--color-text-primary)]"}`}>
            {currentArea.toFixed(2)}
          </span>
        </div>
        {!solved ? (
          <button
            onClick={checkMatch}
            className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
          >
            {t("areas.checkAnswer")}
          </button>
        ) : (
          <button
            onClick={nextChallenge}
            className="rounded-lg bg-[var(--color-success)] px-4 py-2 text-sm font-medium text-white"
          >
            {tg("nextChallenge")}
          </button>
        )}
      </div>

      {solved && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-sm font-medium text-[var(--color-success)]">
          {tg("wellDone")}
        </motion.p>
      )}
      {!solved && wrongAttempts > 0 && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-sm text-[var(--color-text-secondary)]">
          {tg("tryAdjusting")}
        </motion.p>
      )}
    </div>
  );
}
