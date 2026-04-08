"use client";

import { useState, useEffect, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FormulaSidebar from "@/components/ui/FormulaSidebar";
import LatexSection from "./LatexSection";
import type { LessonConfig, SectionConfig } from "./types";

// ---------------------------------------------------------------------------
// Section renderer — maps a SectionConfig to its JSX
// ---------------------------------------------------------------------------

function RenderSection({ config }: { config: SectionConfig }) {
  switch (config.type) {
    case "playground": {
      const comps = config.components;
      return (
        <div className="flex h-full flex-col">
          {config.title && (
            <h2 className="mb-4 text-2xl font-bold">{config.title}</h2>
          )}
          {config.description && (
            <p className="mb-6 text-[var(--color-text-secondary)]">
              {config.description}
            </p>
          )}
          <div
            className={`grid flex-1 gap-6 ${
              comps.length === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
            } auto-rows-min`}
          >
            {comps.map((Comp, i) => (
              <Comp key={i} />
            ))}
          </div>
        </div>
      );
    }

    case "game":
    case "game_match_pairs": {
      // These are rendered by the lesson page directly via the sections array.
      // game_match_pairs is handled by MatchPairsSection (lazy-loaded per lesson).
      // game just renders the component.
      const Comp = config.type === "game" ? config.component : () => null;
      return (
        <div className="flex h-full flex-col">
          {config.title && (
            <h2 className="mb-6 text-2xl font-bold">{config.title}</h2>
          )}
          <div className="flex flex-1 items-start justify-center">
            <div className="w-full max-w-3xl">
              <Comp />
            </div>
          </div>
        </div>
      );
    }

    case "custom": {
      const Comp = config.component;
      return (
        <div className="flex h-full flex-col">
          {config.title && (
            <h2 className="mb-6 text-2xl font-bold">{config.title}</h2>
          )}
          <Comp />
        </div>
      );
    }

    case "latex": {
      return (
        <LatexSection
          title={config.title}
          content={config.content}
          displayMode={config.displayMode}
        />
      );
    }
  }
}

// ---------------------------------------------------------------------------
// LessonShell — full-viewport sectioned navigation
// ---------------------------------------------------------------------------

interface LessonShellProps {
  config: LessonConfig;
  /** Optional override: pass pre-rendered section nodes instead of using config.sections. */
  children?: ReactNode[];
}

export default function LessonShell({ config, children }: LessonShellProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const total = children ? children.length : config.sections.length;

  const goTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= total || index === current) return;
      setDirection(index > current ? 1 : -1);
      setCurrent(index);
    },
    [current, total],
  );

  const next = useCallback(() => goTo(current + 1), [goTo, current]);
  const prev = useCallback(() => goTo(current - 1), [goTo, current]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't capture when user is typing in an input
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        next();
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        prev();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev]);

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  // Determine what to render for the current section
  const sectionContent = children
    ? children[current]
    : <RenderSection config={config.sections[current]} />;

  return (
    <div className="relative flex h-[calc(100dvh-7.5rem)] flex-col overflow-hidden">
      {/* Formula sidebar */}
      {config.formulas && <FormulaSidebar formulas={config.formulas} />}

      {/* Section content */}
      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="absolute inset-0 overflow-y-auto p-6 md:p-8"
          >
            <div className="mx-auto h-full max-w-6xl">
              {sectionContent}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom bar: prev/next + dots + counter */}
      <div className="flex shrink-0 items-center justify-between border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-6 py-3">
        {/* Prev button */}
        <div className="w-28">
          {current > 0 && (
            <button
              onClick={prev}
              className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--color-bg-tertiary)]"
            >
              ← Back
            </button>
          )}
        </div>

        {/* Navigation dots */}
        <div className="flex items-center gap-2">
          {Array.from({ length: total }).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all ${
                i === current
                  ? "h-3 w-3 bg-[var(--color-accent)]"
                  : "h-2.5 w-2.5 bg-[var(--color-border)] hover:bg-[var(--color-text-secondary)]"
              }`}
              aria-label={`Section ${i + 1}`}
            />
          ))}
        </div>

        {/* Next button + counter */}
        <div className="flex w-28 items-center justify-end gap-3">
          <span className="text-xs text-[var(--color-text-secondary)]">
            {current + 1}/{total}
          </span>
          {current < total - 1 && (
            <button
              onClick={next}
              className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
