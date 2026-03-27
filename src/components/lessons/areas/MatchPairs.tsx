"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth/context";
import { getPointsForAttempt, getMaxPerQuestion } from "@/lib/scoring";
import { saveGameScore } from "@/lib/progress";

type ShapeKind = "square" | "rectangle" | "triangle" | "diamond" | "trapezoid";

interface ShapeDims {
  kind: ShapeKind;
  a?: number;
  b?: number;
  h?: number;
  d1?: number;
  d2?: number;
}

interface Card {
  id: string;
  pairId: string;
  type: "shape" | "area";
  shapeDims?: ShapeDims;
  display?: string;
  matched: boolean;
}

function generateCards(aS: string): Card[] {
  const pairs: { shapeDims: ShapeDims; area: number }[] = [];
  const usedAreas = new Set<number>();

  function addPair(gen: () => { shapeDims: ShapeDims; area: number }) {
    for (let attempt = 0; attempt < 100; attempt++) {
      const result = gen();
      if (!usedAreas.has(result.area)) {
        usedAreas.add(result.area);
        pairs.push(result);
        return;
      }
    }
    // Fallback: accept duplicate after 100 tries
    const result = gen();
    usedAreas.add(result.area);
    pairs.push(result);
  }

  addPair(() => {
    const a = Math.floor(Math.random() * 8) + 2;
    return { shapeDims: { kind: "square", a }, area: a * a };
  });

  addPair(() => {
    const a = Math.floor(Math.random() * 7) + 2;
    const b = Math.floor(Math.random() * 7) + 2;
    return { shapeDims: { kind: "rectangle", a, b }, area: a * b };
  });

  addPair(() => {
    const a = Math.floor(Math.random() * 8) + 2;
    const h = Math.floor(Math.random() * 8) + 2;
    return { shapeDims: { kind: "triangle", a, h }, area: (a * h) / 2 };
  });

  addPair(() => {
    const d1 = Math.floor(Math.random() * 8) + 2;
    const d2 = Math.floor(Math.random() * 8) + 2;
    return { shapeDims: { kind: "diamond", d1, d2 }, area: (d1 * d2) / 2 };
  });

  addPair(() => {
    const a = Math.floor(Math.random() * 5) + 3;
    const b = Math.floor(Math.random() * 4) + 1;
    const h = Math.floor(Math.random() * 5) + 2;
    return { shapeDims: { kind: "trapezoid", a, b, h }, area: ((a + b) * h) / 2 };
  });

  addPair(() => {
    const a = Math.floor(Math.random() * 6) + 3;
    return { shapeDims: { kind: "square", a }, area: a * a };
  });

  addPair(() => {
    const a = Math.floor(Math.random() * 8) + 2;
    const b = Math.floor(Math.random() * 6) + 2;
    return { shapeDims: { kind: "rectangle", a, b }, area: a * b };
  });

  addPair(() => {
    const a = Math.floor(Math.random() * 6) + 3;
    const b = Math.floor(Math.random() * 3) + 1;
    const h = Math.floor(Math.random() * 6) + 2;
    return { shapeDims: { kind: "trapezoid", a, b, h }, area: ((a + b) * h) / 2 };
  });

  const cards: Card[] = [];
  pairs.forEach((pair, i) => {
    const pairId = `pair-${i}`;
    cards.push({ id: `shape-${i}`, pairId, type: "shape", shapeDims: pair.shapeDims, matched: false });
    cards.push({ id: `area-${i}`, pairId, type: "area", display: `${aS} = ${pair.area}`, matched: false });
  });

  // Shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  return cards;
}

function ShapeCardGraphic({ dims }: { dims: ShapeDims }) {
  const colors: Record<ShapeKind, string> = {
    square: "#6366f1",
    rectangle: "#6366f1",
    triangle: "#22c55e",
    diamond: "#f97316",
    trapezoid: "#8b5cf6",
  };
  const stroke = colors[dims.kind];
  const labelFill = "var(--color-text-secondary)";

  switch (dims.kind) {
    case "square":
      return (
        <svg viewBox="0 0 80 68" className="h-auto w-full max-w-[80px]">
          <rect x="15" y="5" width="50" height="50" fill="none" stroke={stroke} strokeWidth="2" />
          <text x="40" y="64" textAnchor="middle" fontSize="10" fill={labelFill}>a={dims.a}</text>
          <text x="8" y="33" textAnchor="middle" fontSize="10" fill={labelFill}>a</text>
        </svg>
      );
    case "rectangle":
      return (
        <svg viewBox="0 0 90 68" className="h-auto w-full max-w-[90px]">
          <rect x="8" y="10" width="74" height="42" fill="none" stroke={stroke} strokeWidth="2" />
          <text x="45" y="64" textAnchor="middle" fontSize="10" fill={labelFill}>a={dims.a}</text>
          <text x="4" y="33" textAnchor="middle" fontSize="10" fill={labelFill}>b={dims.b}</text>
        </svg>
      );
    case "triangle":
      return (
        <svg viewBox="0 0 90 78" className="h-auto w-full max-w-[90px]">
          <polygon points="45,8 10,68 80,68" fill="none" stroke={stroke} strokeWidth="2" />
          <line x1="45" y1="8" x2="45" y2="68" stroke="#a1a1aa" strokeWidth="1" strokeDasharray="4" />
          <text x="45" y="76" textAnchor="middle" fontSize="10" fill={labelFill}>a={dims.a}</text>
          <text x="52" y="42" textAnchor="start" fontSize="10" fill={labelFill}>h={dims.h}</text>
        </svg>
      );
    case "diamond":
      return (
        <svg viewBox="0 0 80 88" className="h-auto w-full max-w-[80px]">
          <polygon points="40,5 75,44 40,83 5,44" fill="none" stroke={stroke} strokeWidth="2" />
          <line x1="5" y1="44" x2="75" y2="44" stroke="#a1a1aa" strokeWidth="1" strokeDasharray="4" />
          <line x1="40" y1="5" x2="40" y2="83" stroke="#a1a1aa" strokeWidth="1" strokeDasharray="4" />
          <text x="40" y="58" textAnchor="middle" fontSize="10" fill={labelFill}>d₁={dims.d1}</text>
          <text x="53" y="27" textAnchor="start" fontSize="10" fill={labelFill}>d₂={dims.d2}</text>
        </svg>
      );
    case "trapezoid":
      return (
        <svg viewBox="0 0 90 78" className="h-auto w-full max-w-[90px]">
          <polygon points="8,65 82,65 64,12 26,12" fill="none" stroke={stroke} strokeWidth="2" />
          <line x1="45" y1="12" x2="45" y2="65" stroke="#a1a1aa" strokeWidth="1" strokeDasharray="4" />
          <text x="45" y="75" textAnchor="middle" fontSize="10" fill={labelFill}>a={dims.a}</text>
          <text x="45" y="9" textAnchor="middle" fontSize="10" fill={labelFill}>b={dims.b}</text>
          <text x="52" y="42" textAnchor="start" fontSize="10" fill={labelFill}>h={dims.h}</text>
        </svg>
      );
  }
}

export default function MatchPairs() {
  const t = useTranslations();
  const tg = useTranslations("games");
  const aS = t("areas.areaSymbol");
  const { user } = useAuth();

  const [started, setStarted] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [moves, setMoves] = useState(0);
  const [matchedCount, setMatchedCount] = useState(0);
  const [wrongFlash, setWrongFlash] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  // Track wrong attempts per pair for scoring
  const wrongPerPair = useRef<Record<string, number>>({});
  const totalPairs = 8;

  const startGame = useCallback(() => {
    setCards(generateCards(aS));
    setSelected(null);
    setMoves(0);
    setMatchedCount(0);
    setWrongFlash(null);
    setFinished(false);
    setScore(0);
    scoreRef.current = 0;
    wrongPerPair.current = {};
    setStarted(true);
  }, [t, aS]);

  useEffect(() => {
    if (started && matchedCount === totalPairs) {
      setFinished(true);
      if (user) {
        saveGameScore(user.id, "primary-areas", "match-pairs", scoreRef.current, 1000);
      }
    }
  }, [matchedCount, started]);

  const handleCardClick = (cardId: string) => {
    const card = cards.find((c) => c.id === cardId);
    if (!card || card.matched) return;

    if (!selected) {
      setSelected(cardId);
      return;
    }

    if (selected === cardId) {
      setSelected(null);
      return;
    }

    const firstCard = cards.find((c) => c.id === selected)!;

    // Same type (shape+shape or area+area) — just switch selection, no penalty
    if (firstCard.type === card.type) {
      setSelected(cardId);
      return;
    }

    setMoves((m) => m + 1);

    if (firstCard.pairId === card.pairId && firstCard.type !== card.type) {
      // Match! Calculate points based on wrong attempts for this pair
      const pairWrongs = wrongPerPair.current[card.pairId] || 0;
      const tryNumber = pairWrongs + 1;
      const maxPer = getMaxPerQuestion(totalPairs);
      const points = getPointsForAttempt(tryNumber, maxPer);
      scoreRef.current += points;
      setScore(scoreRef.current);

      setCards((prev) =>
        prev.map((c) =>
          c.pairId === card.pairId ? { ...c, matched: true } : c
        )
      );
      setMatchedCount((m) => m + 1);
      setSelected(null);
    } else {
      // Wrong - track per pair for both cards involved
      wrongPerPair.current[firstCard.pairId] = (wrongPerPair.current[firstCard.pairId] || 0) + 1;
      wrongPerPair.current[card.pairId] = (wrongPerPair.current[card.pairId] || 0) + 1;

      setWrongFlash(cardId);
      setTimeout(() => {
        setSelected(null);
        setWrongFlash(null);
      }, 600);
    }
  };

  if (!started) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-8 text-center">
        <h2 className="mb-2 text-2xl font-bold">{tg("matchPairs")}</h2>
        <p className="mb-6 text-[var(--color-text-secondary)]">{tg("matchPairsDesc")}</p>
        <button onClick={startGame} className="rounded-lg bg-[var(--color-accent)] px-6 py-3 font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]">
          {tg("startGame")}
        </button>
      </div>
    );
  }

  if (finished) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-8 text-center">
        <h2 className="mb-4 text-2xl font-bold">{tg("allMatched")}</h2>
        <p className="mb-2 text-3xl font-bold text-[var(--color-accent)]">
          {score} / 1000
        </p>
        <p className="mb-2 text-lg">{tg("moves")}: {moves}</p>
        <p className="mb-6 text-[var(--color-text-secondary)]">
          {t("areas.quizAccuracy", { accuracy: Math.round((score / 1000) * 100) })}
        </p>
        <button onClick={startGame} className="rounded-lg bg-[var(--color-accent)] px-6 py-3 font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]">
          {t("areas.tryAgain")}
        </button>
      </motion.div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{tg("matchPairs")}</h3>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {matchedCount}/{totalPairs} {tg("matched")} · {tg("moves")}: {moves}
          </p>
          <p className="text-xs font-mono text-[var(--color-accent)]">
            {score} pts
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {cards.map((card) => {
          const isSelected = selected === card.id;
          const isWrong = wrongFlash === card.id || (wrongFlash && selected === card.id);
          const isMatched = card.matched;

          return (
            <motion.button
              key={card.id}
              onClick={() => !isMatched && handleCardClick(card.id)}
              layout
              className={`relative flex min-h-[100px] items-center justify-center rounded-lg border p-3 text-center text-xs font-medium transition-all sm:text-sm ${
                isMatched
                  ? "border-[var(--color-success)] bg-[var(--color-success)]/10 text-[var(--color-success)] opacity-60"
                  : isWrong
                    ? "border-[var(--color-error)] bg-[var(--color-error)]/10 text-[var(--color-error)]"
                    : isSelected
                      ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                      : card.type === "shape"
                        ? "border-[var(--color-border)] bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] hover:border-[var(--color-accent)]"
                        : "border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-accent)] hover:border-[var(--color-accent)]"
              } ${isMatched ? "cursor-default" : "cursor-pointer"}`}
              whileTap={{ scale: 0.95 }}
            >
              {card.type === "shape" && card.shapeDims ? (
                <ShapeCardGraphic dims={card.shapeDims} />
              ) : (
                <span>{card.display}</span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
