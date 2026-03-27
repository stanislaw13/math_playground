"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth/context";
import { getPointsForAttempt, getMaxPerQuestion } from "@/lib/scoring";
import { saveGameScore } from "@/lib/progress";

interface ConversionPair {
  left: string;
  right: string;
}

// Pool of tricky area-unit conversion pairs. All verified correct.
// Conversion factors: 1 km²=10⁶m²=10⁸dm²=10¹⁰cm²=10¹²mm²
//                     1 m²=10²dm²=10⁴cm²=10⁶mm²
//                     1 dm²=10²cm²=10⁴mm²
//                     1 cm²=10²mm²
const ALL_PAIRS: ConversionPair[] = [
  // Similar exponents, different units — the main trap
  { left: "1 km²", right: "10⁶ m²" },
  { left: "1 m²", right: "10⁶ mm²" },
  { left: "1 km²", right: "10⁸ dm²" },
  { left: "1 m²", right: "10⁴ cm²" },
  { left: "1 dm²", right: "100 cm²" },
  { left: "1 cm²", right: "100 mm²" },
  { left: "1 km²", right: "10¹⁰ cm²" },
  { left: "1 km²", right: "10¹² mm²" },
  { left: "1 m²", right: "10² dm²" },
  { left: "1 dm²", right: "10⁴ mm²" },
  // Larger / fractional values
  { left: "500 dm²", right: "5 m²" },
  { left: "2 km²", right: "2 · 10⁶ m²" },
  { left: "30 000 cm²", right: "3 m²" },
  { left: "50 cm²", right: "5 000 mm²" },
  { left: "0,01 m²", right: "1 dm²" },
  { left: "0,5 m²", right: "50 dm²" },
  { left: "200 mm²", right: "2 cm²" },
  { left: "10⁴ cm²", right: "1 m²" },
  { left: "10⁸ mm²", right: "100 m²" },
  { left: "0,1 km²", right: "10⁵ m²" },
  { left: "5 dm²", right: "500 cm²" },
  { left: "3 km²", right: "3 · 10⁶ m²" },
  { left: "400 cm²", right: "4 dm²" },
  { left: "7 m²", right: "70 000 cm²" },
  { left: "0,001 km²", right: "1 000 m²" },
  { left: "20 m²", right: "2 · 10⁷ mm²" },
];

interface Card {
  id: string;
  pairId: string;
  side: "left" | "right";
  display: string;
  matched: boolean;
}

function pickPairs(count: number): ConversionPair[] {
  // Group pairs by left value to avoid duplicate left-side texts
  // We need all 2×count card labels to be unique
  const shuffled = [...ALL_PAIRS].sort(() => Math.random() - 0.5);
  const chosen: ConversionPair[] = [];
  const usedLabels = new Set<string>();

  for (const p of shuffled) {
    if (chosen.length >= count) break;
    if (usedLabels.has(p.left) || usedLabels.has(p.right)) continue;
    usedLabels.add(p.left);
    usedLabels.add(p.right);
    chosen.push(p);
  }

  return chosen;
}

function generateCards(count: number): Card[] {
  const pairs = pickPairs(count);
  const cards: Card[] = [];

  pairs.forEach((pair, i) => {
    const pairId = `pair-${i}`;
    cards.push({ id: `left-${i}`, pairId, side: "left", display: pair.left, matched: false });
    cards.push({ id: `right-${i}`, pairId, side: "right", display: pair.right, matched: false });
  });

  // Shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  return cards;
}

export default function MatchPairsUnits() {
  const tg = useTranslations("games");
  const t = useTranslations("areas");
  const { user } = useAuth();

  const totalPairs = 8;
  const [started, setStarted] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [moves, setMoves] = useState(0);
  const [matchedCount, setMatchedCount] = useState(0);
  const [wrongFlash, setWrongFlash] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const wrongPerPair = useRef<Record<string, number>>({});

  const startGame = useCallback(() => {
    setCards(generateCards(totalPairs));
    setSelected(null);
    setMoves(0);
    setMatchedCount(0);
    setWrongFlash(null);
    setFinished(false);
    setScore(0);
    scoreRef.current = 0;
    wrongPerPair.current = {};
    setStarted(true);
  }, []);

  useEffect(() => {
    if (started && matchedCount === totalPairs) {
      setFinished(true);
      if (user) {
        saveGameScore(user.id, "primary-areas", "match-pairs-units", scoreRef.current, 1000);
      }
    }
  }, [matchedCount, started, user]);

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

    // Same side — just switch selection, no penalty
    if (firstCard.side === card.side) {
      setSelected(cardId);
      return;
    }

    setMoves((m) => m + 1);

    if (firstCard.pairId === card.pairId) {
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
        <h2 className="mb-2 text-2xl font-bold">{tg("matchPairsUnits")}</h2>
        <p className="mb-6 text-[var(--color-text-secondary)]">{tg("matchPairsUnitsDesc")}</p>
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
          {t("quizAccuracy", { accuracy: Math.round((score / 1000) * 100) })}
        </p>
        <button onClick={startGame} className="rounded-lg bg-[var(--color-accent)] px-6 py-3 font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]">
          {t("tryAgain")}
        </button>
      </motion.div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{tg("matchPairsUnits")}</h3>
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
              className={`relative flex min-h-[100px] items-center justify-center rounded-lg border p-3 text-center text-sm font-medium transition-all ${
                isMatched
                  ? "border-[var(--color-success)] bg-[var(--color-success)]/10 text-[var(--color-success)] opacity-60"
                  : isWrong
                    ? "border-[var(--color-error)] bg-[var(--color-error)]/10 text-[var(--color-error)]"
                    : isSelected
                      ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                      : card.side === "left"
                        ? "border-[var(--color-border)] bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] hover:border-[var(--color-accent)]"
                        : "border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-accent)] hover:border-[var(--color-accent)]"
              } ${isMatched ? "cursor-default" : "cursor-pointer"}`}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-base">{card.display}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
