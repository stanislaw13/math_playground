"use client";

import { useState, useRef, useCallback, Fragment, ReactNode } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth/context";
import { saveGameScore } from "@/lib/progress";
import type { GameContext } from "./types";

// ---------------------------------------------------------------------------
// GameWrapper — reusable start / active / finish shell with scoring
// ---------------------------------------------------------------------------

interface GameWrapperProps {
  gameId: string;
  lessonId: string;
  title: string;
  description: string;
  maxScore?: number;
  /** Render the active game as a render-prop child. */
  children: (ctx: GameContext) => ReactNode;
}

export default function GameWrapper({
  gameId,
  lessonId,
  title,
  description,
  maxScore = 1000,
  children: renderGame,
}: GameWrapperProps) {
  const tg = useTranslations("games");
  const { user } = useAuth();

  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const [gameKey, setGameKey] = useState(0);

  const addScore = useCallback((points: number) => {
    scoreRef.current += points;
    setScore(scoreRef.current);
  }, []);

  const finish = useCallback(() => {
    setFinished(true);
    if (user) {
      saveGameScore(user.id, lessonId, gameId, scoreRef.current, maxScore);
    }
  }, [user, lessonId, gameId, maxScore]);

  const restart = useCallback(() => {
    scoreRef.current = 0;
    setScore(0);
    setFinished(false);
    setGameKey((k) => k + 1);
  }, []);

  const ctx: GameContext = { addScore, finish, score, maxScore };

  // --- Start screen ---
  if (!started) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-8 text-center">
        <h2 className="mb-2 text-2xl font-bold">{title}</h2>
        <p className="mb-6 text-[var(--color-text-secondary)]">{description}</p>
        <button
          onClick={() => setStarted(true)}
          className="rounded-lg bg-[var(--color-accent)] px-6 py-3 font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
        >
          {tg("startGame")}
        </button>
      </div>
    );
  }

  // --- Finish screen ---
  if (finished) {
    const accuracy = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-8 text-center"
      >
        <h2 className="mb-4 text-2xl font-bold">{tg("allMatched")}</h2>
        <p className="mb-2 text-3xl font-bold text-[var(--color-accent)]">
          {score} / {maxScore}
        </p>
        <p className="mb-6 text-[var(--color-text-secondary)]">
          {accuracy}%
        </p>
        <button
          onClick={restart}
          className="rounded-lg bg-[var(--color-accent)] px-6 py-3 font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
        >
          {tg("tryAgain")}
        </button>
      </motion.div>
    );
  }

  // --- Active game ---
  return <Fragment key={gameKey}>{renderGame(ctx)}</Fragment>;
}
