"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { LessonDef, MatchPairItem } from "@/components/lessons/types";
import type { ComparisonPair } from "@/components/lessons/games/ComparisonGame";
import type { SkillCategory } from "@/lib/adaptiveEngine";
import { adaptiveInt, type Difficulty } from "@/lib/adaptiveEngine";
import katex from "katex";

const MatchPairsGame = dynamic(
  () => import("@/components/lessons/games/MatchPairsGame"),
  { ssr: false }
);

const ComparisonGame = dynamic(
  () => import("@/components/lessons/games/ComparisonGame"),
  { ssr: false }
);

// ---------------------------------------------------------------------------
// Explorer component
// ---------------------------------------------------------------------------

function FractionVisualizer({ locale = "en" }: { locale?: string }) {
  const pl = locale === "pl";
  const [numerator, setNumerator] = useState(1);
  const [denominator, setDenominator] = useState(4);

  const decimal = numerator / denominator;
  const percentage = (decimal * 100).toFixed(1);

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6">
      <h3 className="mb-4 text-lg font-semibold">
        {pl ? "Wizualizator ułamków" : "Fraction Visualizer"}
      </h3>

      {/* Bar */}
      <div className="mb-4 flex h-10 gap-0.5 overflow-hidden rounded-lg">
        {Array.from({ length: denominator }, (_, i) => (
          <div
            key={i}
            className="flex-1 transition-colors duration-150"
            style={{
              background:
                i < numerator
                  ? "var(--color-accent)"
                  : "var(--color-bg-tertiary)",
              border: "1px solid var(--color-border)",
            }}
          />
        ))}
      </div>

      <p className="mb-6 text-center font-mono text-xl">
        <span className="text-[var(--color-accent)]">{numerator}</span>
        <span className="mx-1 text-[var(--color-text-secondary)]">/</span>
        <span>{denominator}</span>
        <span className="mx-3 text-[var(--color-text-secondary)]">=</span>
        <span>{decimal.toFixed(4)}</span>
        <span className="ml-3 text-[var(--color-text-secondary)] text-sm">
          ({percentage}%)
        </span>
      </p>

      <label className="mb-1 block text-sm text-[var(--color-text-secondary)]">
        {pl ? "Licznik" : "Numerator"}: {numerator}
      </label>
      <input
        type="range"
        min={0}
        max={denominator}
        value={numerator}
        onChange={(e) => setNumerator(Number(e.target.value))}
        className="mb-4 w-full"
      />

      <label className="mb-1 block text-sm text-[var(--color-text-secondary)]">
        {pl ? "Mianownik" : "Denominator"}: {denominator}
      </label>
      <input
        type="range"
        min={1}
        max={12}
        value={denominator}
        onChange={(e) => {
          const d = Number(e.target.value);
          setDenominator(d);
          if (numerator > d) setNumerator(d);
        }}
        className="w-full"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Match pairs generator — random fractions ↔ decimals, no duplicates
// ---------------------------------------------------------------------------

const FRACTION_POOL: Array<[number, number]> = [
  [1, 2],
  [1, 4],
  [3, 4],
  [1, 5],
  [2, 5],
  [3, 5],
  [4, 5],
  [1, 10],
  [3, 10],
  [7, 10],
  [1, 8],
  [3, 8],
  [5, 8],
  [7, 8],
  [1, 20],
  [1, 25],
];

function generateFractionPairs(): MatchPairItem[] {
  const shuffled = [...FRACTION_POOL].sort(() => Math.random() - 0.5);
  const picked = shuffled.slice(0, 8);

  return picked.map(([num, den]) => ({
    left: `${num}/${den}`,
    right: (num / den).toString(),
  }));
}

// ---------------------------------------------------------------------------
// ComparisonGame setup
// ---------------------------------------------------------------------------

function FracNode({ num, den }: { num: number; den: number }) {
  const html = katex.renderToString(`\\dfrac{${num}}{${den}}`, { throwOnError: false });
  return <span dangerouslySetInnerHTML={{ __html: html }} className="text-xl leading-none" />;
}

const COMPARISON_CATEGORIES: SkillCategory[] = [
  { id: "frac-vs-dec",  label: "Fraction vs Decimal" },
  { id: "frac-vs-frac", label: "Fraction vs Fraction" },
  { id: "dec-vs-dec",   label: "Decimal vs Decimal" },
];

// Predefined fraction–decimal pairs so the comparison is always meaningful
const FRAC_DEC_POOL: Array<{ num: number; den: number; dec: number }> = [
  { num: 1, den: 2, dec: 0.3 },   // frac > dec
  { num: 1, den: 2, dec: 0.7 },   // frac < dec
  { num: 1, den: 2, dec: 0.5 },   // equal
  { num: 1, den: 4, dec: 0.3 },   // frac < dec
  { num: 1, den: 4, dec: 0.25 },  // equal
  { num: 3, den: 4, dec: 0.7 },   // frac > dec
  { num: 3, den: 4, dec: 0.75 },  // equal
  { num: 1, den: 5, dec: 0.3 },   // frac > dec
  { num: 1, den: 5, dec: 0.2 },   // equal
  { num: 3, den: 5, dec: 0.7 },   // frac < dec
  { num: 3, den: 5, dec: 0.6 },   // equal
  { num: 3, den: 4, dec: 0.8 },   // frac < dec
  { num: 1, den: 3, dec: 0.4 },   // frac < dec
  { num: 2, den: 3, dec: 0.6 },   // frac > dec
];

function generateComparisonPair(category: string, difficulty: Difficulty): ComparisonPair {
  switch (category) {
    case "frac-vs-dec": {
      const item = FRAC_DEC_POOL[Math.floor(Math.random() * FRAC_DEC_POOL.length)];
      const { num, den, dec } = item;
      const fracVal = num / den;
      const swapped = Math.random() < 0.5;
      const fracDisplay = <FracNode num={num} den={den} />;
      const decDisplay  = <span className="font-mono">{dec}</span>;
      const rawCorrect  = fracVal > dec ? "left" : fracVal < dec ? "right" : "equal";
      // adjust for swap (frac is "left" before swap)
      const correct =
        rawCorrect === "equal"
          ? "equal"
          : swapped
          ? rawCorrect === "left" ? "right" : "left"
          : rawCorrect;
      return {
        left:    swapped ? decDisplay : fracDisplay,
        right:   swapped ? fracDisplay : decDisplay,
        correct,
        hints: [
          { text: `Convert the fraction`, latex: `\\tfrac{${num}}{${den}} = ${fracVal.toFixed(3)}` },
          { text: `Compare with the decimal: ${dec}` },
          { text: `${fracVal.toFixed(3)} ${fracVal > dec ? ">" : fracVal < dec ? "<" : "="} ${dec}` },
        ],
      };
    }

    case "frac-vs-frac": {
      const dens = [2, 3, 4, 5, 6, 8, 10];
      const den1 = dens[Math.floor(Math.random() * dens.length)];
      const den2 = dens[Math.floor(Math.random() * dens.length)];
      const num1 = adaptiveInt(difficulty, [1, den1 - 1], [1, den1], [1, den1]);
      const num2 = adaptiveInt(difficulty, [1, den2 - 1], [1, den2], [1, den2]);
      const v1   = num1 / den1;
      const v2   = num2 / den2;
      return {
        left:    <FracNode num={num1} den={den1} />,
        right:   <FracNode num={num2} den={den2} />,
        correct: v1 > v2 ? "left" : v1 < v2 ? "right" : "equal",
        hints: [
          { text: "Convert both fractions to decimals to compare" },
          { text: `${num1}/${den1} = ${v1.toFixed(3)}`, latex: `\\tfrac{${num1}}{${den1}} = ${v1.toFixed(3)}` },
          { text: `${num2}/${den2} = ${v2.toFixed(3)}   →   ${v1.toFixed(3)} ${v1 > v2 ? ">" : v1 < v2 ? "<" : "="} ${v2.toFixed(3)}` },
        ],
      };
    }

    default: { // dec-vs-dec
      const places = difficulty === "easy" ? 1 : 2;
      const factor  = places === 1 ? 10 : 100;
      const base    = adaptiveInt(difficulty, [0, 2], [0, 5], [0, 9]);
      const left    = parseFloat((base + (Math.floor(Math.random() * (factor - 1)) + 1) / factor).toFixed(places));
      const right   = parseFloat((base + (Math.floor(Math.random() * (factor - 1)) + 1) / factor).toFixed(places));
      return {
        left:    <span className="font-mono">{left}</span>,
        right:   <span className="font-mono">{right}</span>,
        correct: left > right ? "left" : left < right ? "right" : "equal",
        hints: [
          { text: "Compare digit by digit from left to right" },
          { text: `Ones digit: ${Math.floor(left)} vs ${Math.floor(right)}` },
          { text: `${left} ${left > right ? ">" : left < right ? "<" : "="} ${right}` },
        ],
      };
    }
  }
}

// ---------------------------------------------------------------------------
// Lesson definition
// ---------------------------------------------------------------------------

const fractionsLesson: LessonDef = {
  id: "primary-fractions",
  slug: "fractions",
  category: "primary",
  order: 3,
  title: { en: "Introduction to Fractions", pl: "Wprowadzenie do ułamków" },
  description: {
    en: "Understand what fractions mean and how they relate to decimals",
    pl: "Zrozum, czym są ułamki i jak odnoszą się do liczb dziesiętnych",
  },
  games: ["fractions-match", "fractions-comparison"],
  formulas: [
    { label: { en: "Fraction", pl: "Ułamek" }, latex: "\\frac{a}{b} = a \\div b" },
    { label: { en: "Percent", pl: "Procent" }, latex: "\\frac{a}{b} \\times 100 = \\%" },
  ],
  sections: (locale) => {
    const pl = locale === "pl";
    return [
      /* Section 1 — concept + explorer */
      <div key="s1">
        <h2 className="mb-2 text-2xl font-bold">
          {pl ? "Czym jest ułamek?" : "What is a Fraction?"}
        </h2>
        <p className="mb-6 text-[var(--color-text-secondary)]">
          {pl ? (
            <>
              Ułamek reprezentuje część całości.{" "}
              <strong>Mianownik</strong> (na dole) mówi, na ile równych części
              jest podzielona całość. <strong>Licznik</strong> (na górze) mówi,
              ile tych części masz.
            </>
          ) : (
            <>
              A fraction represents a part of a whole. The{" "}
              <strong>denominator</strong> (bottom) is how many equal parts the
              whole is split into. The <strong>numerator</strong> (top) is how
              many of those parts you have.
            </>
          )}
        </p>
        <FractionVisualizer locale={locale} />
      </div>,

      /* Section 2 — match pairs game */
      <div key="s2" className="flex items-start justify-center">
        <div className="w-full max-w-3xl">
          <MatchPairsGame
            gameId="fractions-match"
            lessonId="primary-fractions"
            title={pl ? "Dopasuj ułamek do dziesiętnej" : "Fraction ↔ Decimal Match"}
            description={
              pl
                ? "Dopasuj każdy ułamek do odpowiadającej mu liczby dziesiętnej"
                : "Match each fraction with its decimal equivalent"
            }
            generatePairs={generateFractionPairs}
            gridCols={4}
          />
        </div>
      </div>,

      /* Section 3 — comparison game */
      <div key="s3" className="flex items-start justify-center">
        <div className="w-full max-w-2xl">
          <ComparisonGame
            gameId="fractions-comparison"
            lessonId="primary-fractions"
            title={pl ? "Która liczba jest większa?" : "Which Is Bigger?"}
            description={
              pl
                ? "Kliknij większą z dwóch wartości. Gra skupi się na Twoich słabszych punktach."
                : "Click the larger of the two values. The game adapts to focus on your weak spots."
            }
            prompt={pl ? "Która jest większa?" : "Which is bigger?"}
            categories={COMPARISON_CATEGORIES}
            generatePair={generateComparisonPair}
            totalQuestions={12}
            showEqualButton={true}
          />
        </div>
      </div>,
    ];
  },
};

export default fractionsLesson;
