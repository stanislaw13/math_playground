"use client";

import { useState, useEffect, useRef, ReactNode } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { getPointsForAttempt, getMaxPerQuestion } from "@/lib/scoring";
import GameWrapper from "../GameWrapper";
import type { GameContext, MatchPairItem } from "../types";

// ---------------------------------------------------------------------------
// Internal card type
// ---------------------------------------------------------------------------

interface Card {
  id: string;
  pairId: string;
  side: "left" | "right";
  content: ReactNode;
  matched: boolean;
}

function shuffleCards(pairs: MatchPairItem[]): Card[] {
  const cards: Card[] = [];
  pairs.forEach((pair, i) => {
    const pairId = `pair-${i}`;
    cards.push({
      id: `left-${i}`,
      pairId,
      side: "left",
      content: pair.left,
      matched: false,
    });
    cards.push({
      id: `right-${i}`,
      pairId,
      side: "right",
      content: pair.right,
      matched: false,
    });
  });
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

// ---------------------------------------------------------------------------
// Inner game (rendered inside GameWrapper)
// ---------------------------------------------------------------------------

function MatchPairsInner({
  pairs,
  gridCols,
  ctx,
}: {
  pairs: MatchPairItem[];
  gridCols: number;
  ctx: GameContext;
}) {
  const tg = useTranslations("games");
  const [cards, setCards] = useState<Card[]>(() => shuffleCards(pairs));
  const [selected, setSelected] = useState<string | null>(null);
  const [moves, setMoves] = useState(0);
  const [matchedCount, setMatchedCount] = useState(0);
  const [wrongFlash, setWrongFlash] = useState<string | null>(null);
  const wrongPerPair = useRef<Record<string, number>>({});
  const totalPairs = pairs.length;

  useEffect(() => {
    if (matchedCount === totalPairs && totalPairs > 0) {
      ctx.finish();
    }
  }, [matchedCount, totalPairs, ctx]);

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

    // Same side — switch selection, no penalty
    if (firstCard.side === card.side) {
      setSelected(cardId);
      return;
    }

    setMoves((m) => m + 1);

    if (firstCard.pairId === card.pairId) {
      // Match!
      const pairWrongs = wrongPerPair.current[card.pairId] || 0;
      const points = getPointsForAttempt(
        pairWrongs + 1,
        getMaxPerQuestion(totalPairs),
      );
      ctx.addScore(points);
      setCards((prev) =>
        prev.map((c) =>
          c.pairId === card.pairId ? { ...c, matched: true } : c,
        ),
      );
      setMatchedCount((m) => m + 1);
      setSelected(null);
    } else {
      // Wrong
      wrongPerPair.current[firstCard.pairId] =
        (wrongPerPair.current[firstCard.pairId] || 0) + 1;
      wrongPerPair.current[card.pairId] =
        (wrongPerPair.current[card.pairId] || 0) + 1;
      setWrongFlash(cardId);
      setTimeout(() => {
        setSelected(null);
        setWrongFlash(null);
      }, 600);
    }
  };

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {matchedCount}/{totalPairs} {tg("matched")} · {tg("moves")}:{" "}
            {moves}
          </p>
          <p className="text-xs font-mono text-[var(--color-accent)]">
            {ctx.score} pts
          </p>
        </div>
      </div>

      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}
      >
        {cards.map((card) => {
          const isSelected = selected === card.id;
          const isWrong =
            wrongFlash === card.id || (wrongFlash && selected === card.id);
          const isMatched = card.matched;

          return (
            <motion.button
              key={card.id}
              onClick={() => !isMatched && handleCardClick(card.id)}
              className={`relative flex min-h-[100px] items-center justify-center rounded-lg border p-3 text-center text-xs font-medium transition-all sm:text-sm ${
                isMatched
                  ? "border-[var(--color-success)] bg-[var(--color-success)]/10 text-[var(--color-success)] opacity-60 cursor-default"
                  : isWrong
                    ? "border-[var(--color-error)] bg-[var(--color-error)]/10 text-[var(--color-error)] cursor-pointer"
                    : isSelected
                      ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)] cursor-pointer"
                      : card.side === "left"
                        ? "border-[var(--color-border)] bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] hover:border-[var(--color-accent)] cursor-pointer"
                        : "border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-accent)] hover:border-[var(--color-accent)] cursor-pointer"
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {card.content}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MatchPairsGame — public component, wraps GameWrapper + inner game
// ---------------------------------------------------------------------------

interface MatchPairsGameProps {
  gameId: string;
  lessonId: string;
  title: string;
  description: string;
  generatePairs: () => MatchPairItem[];
  gridCols?: number;
}

export default function MatchPairsGame({
  gameId,
  lessonId,
  title,
  description,
  generatePairs,
  gridCols = 4,
}: MatchPairsGameProps) {
  return (
    <GameWrapper
      gameId={gameId}
      lessonId={lessonId}
      title={title}
      description={description}
    >
      {(ctx) => (
        <MatchPairsInner
          pairs={generatePairs()}
          gridCols={gridCols}
          ctx={ctx}
        />
      )}
    </GameWrapper>
  );
}
