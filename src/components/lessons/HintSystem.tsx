"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import katex from "katex";

export interface HintStep {
  text: string;
  latex?: string;
}

interface HintSystemProps {
  steps: HintStep[];
  wrongAttempts: number;
  requiredAttempts?: number;
}

function RenderedLatex({ latex }: { latex: string }) {
  const html = katex.renderToString(latex, {
    throwOnError: false,
    displayMode: true,
  });
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function HintSystem({
  steps,
  wrongAttempts,
  requiredAttempts = 3,
}: HintSystemProps) {
  const t = useTranslations("hints");
  const [isOpen, setIsOpen] = useState(false);
  const [revealedCount, setRevealedCount] = useState(1);
  const unlocked = wrongAttempts >= requiredAttempts;

  const revealNext = () => {
    if (revealedCount < steps.length) {
      setRevealedCount((c) => c + 1);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => unlocked && setIsOpen(!isOpen)}
        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all ${
          unlocked
            ? "bg-[var(--color-accent)] text-white shadow-md hover:bg-[var(--color-accent-hover)] cursor-pointer"
            : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] cursor-not-allowed opacity-50"
        }`}
        title={unlocked ? t("showHint") : t("locked", { count: requiredAttempts - wrongAttempts })}
      >
        ?
      </button>

      <AnimatePresence>
        {isOpen && unlocked && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            className="absolute right-0 top-10 z-50 w-80 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4 shadow-2xl"
          >
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-[var(--color-accent)]">
                {t("solutionSteps")}
              </h4>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {steps.slice(0, revealedCount).map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="rounded-lg bg-[var(--color-bg-tertiary)] p-3"
                >
                  <p className="mb-1 text-xs font-medium text-[var(--color-text-secondary)]">
                    {t("step", { n: i + 1 })}
                  </p>
                  <p className="text-sm">{step.text}</p>
                  {step.latex && (
                    <div className="mt-1">
                      <RenderedLatex latex={step.latex} />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {revealedCount < steps.length && (
              <button
                onClick={revealNext}
                className="mt-3 w-full rounded-lg bg-[var(--color-bg-tertiary)] py-2 text-sm font-medium text-[var(--color-accent)] transition-colors hover:bg-[var(--color-border)]"
              >
                {t("showNextStep")} ({revealedCount}/{steps.length})
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
