"use client";

import { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/client";

interface Card {
  id: string;
  pairId: string;
  type: "shape" | "area";
  display: string;
  matched: boolean;
}

function generateCards(t: (key: string) => string, aS: string): Card[] {
  const pairs: { shape: string; dims: string; area: number }[] = [];

  // Square
  const sq = Math.floor(Math.random() * 8) + 2;
  pairs.push({ shape: t("areas.square"), dims: `a = ${sq}`, area: sq * sq });

  // Rectangle
  const rw = Math.floor(Math.random() * 7) + 2;
  const rh = Math.floor(Math.random() * 7) + 2;
  pairs.push({ shape: t("areas.rectangle"), dims: `a = ${rw}, b = ${rh}`, area: rw * rh });

  // Triangle
  const tb = Math.floor(Math.random() * 8) + 2;
  const th = Math.floor(Math.random() * 8) + 2;
  pairs.push({ shape: t("areas.triangle"), dims: `a = ${tb}, h = ${th}`, area: (tb * th) / 2 });

  // Diamond
  const dd1 = Math.floor(Math.random() * 8) + 2;
  const dd2 = Math.floor(Math.random() * 8) + 2;
  pairs.push({ shape: t("areas.diamond"), dims: `d₁ = ${dd1}, d₂ = ${dd2}`, area: (dd1 * dd2) / 2 });

  // Trapezoid
  const ta = Math.floor(Math.random() * 5) + 3;
  const tbs = Math.floor(Math.random() * 4) + 1;
  const tth = Math.floor(Math.random() * 5) + 2;
  pairs.push({ shape: t("areas.trapezoid"), dims: `a = ${ta}, b = ${tbs}, h = ${tth}`, area: ((ta + tbs) * tth) / 2 });

  // Another square with different value
  const sq2 = Math.floor(Math.random() * 6) + 3;
  pairs.push({ shape: t("areas.square"), dims: `a = ${sq2}`, area: sq2 * sq2 });

  const cards: Card[] = [];
  pairs.forEach((pair, i) => {
    const pairId = `pair-${i}`;
    cards.push({
      id: `shape-${i}`,
      pairId,
      type: "shape",
      display: `${pair.shape}\n${pair.dims}`,
      matched: false,
    });
    cards.push({
      id: `area-${i}`,
      pairId,
      type: "area",
      display: `${aS} = ${pair.area}`,
      matched: false,
    });
  });

  // Shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  return cards;
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
  const totalPairs = 6;

  const startGame = useCallback(() => {
    setCards(generateCards(t, aS));
    setSelected(null);
    setMoves(0);
    setMatchedCount(0);
    setWrongFlash(null);
    setFinished(false);
    setStarted(true);
  }, [t, aS]);

  useEffect(() => {
    if (started && matchedCount === totalPairs) {
      setFinished(true);
      saveAttempt();
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
    setMoves((m) => m + 1);

    if (firstCard.pairId === card.pairId && firstCard.type !== card.type) {
      // Match!
      setCards((prev) =>
        prev.map((c) =>
          c.pairId === card.pairId ? { ...c, matched: true } : c
        )
      );
      setMatchedCount((m) => m + 1);
      setSelected(null);
    } else {
      // Wrong
      setWrongFlash(cardId);
      setTimeout(() => {
        setSelected(null);
        setWrongFlash(null);
      }, 600);
    }
  };

  const saveAttempt = async () => {
    if (!user) return;
    const supabase = createClient();
    if (!supabase) return;
    // Score based on efficiency: fewer moves = higher score
    const perfectMoves = totalPairs;
    const score = Math.max(0, Math.round((perfectMoves / Math.max(moves, 1)) * 100));
    await supabase.from("game_attempts").insert({
      user_id: user.id,
      lesson_id: "primary-areas",
      game_id: "match-pairs",
      score,
      max_score: 100,
      accuracy: score,
    });
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
        <p className="mb-2 text-lg">{tg("moves")}: {moves}</p>
        <p className="mb-6 text-[var(--color-text-secondary)]">
          {totalPairs} {tg("pairsLeft").replace("left", "").replace("pozostało", "matched")}
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
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {cards.map((card) => {
          const isSelected = selected === card.id;
          const isWrong = wrongFlash === card.id || (wrongFlash && selected === card.id);
          const isMatched = card.matched;

          return (
            <motion.button
              key={card.id}
              onClick={() => !isMatched && handleCardClick(card.id)}
              layout
              className={`relative flex min-h-[80px] items-center justify-center rounded-lg border p-3 text-center text-xs font-medium transition-all sm:text-sm ${
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
              <span className="whitespace-pre-line">{card.display}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
