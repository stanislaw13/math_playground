"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

type Op = "add" | "subtract";

// ---------------------------------------------------------------------------
// Column addition display helpers
// ---------------------------------------------------------------------------

/**
 * Pad a toFixed(2) string to exactly 5 chars: " X.XX" or "XX.XX"
 * Positions: [0]=tens, [1]=ones, [2]='.', [3]=tenths, [4]=hundredths
 */
function pad5(s: string): string {
  return s.padStart(5);
}

/**
 * For the result row, each character position has a minimum step to reveal it:
 *  pos 4 (hundredths) → step >= 1
 *  pos 3 (tenths)     → step >= 2
 *  pos 1 (ones)       → step >= 3
 *  pos 0 (tens)       → step >= 3
 *  pos 2 ('.')        → always visible
 *  pos 0 if ' '       → always visible as blank
 */
function revealedAt(pos: number): number {
  if (pos === 4) return 1;
  if (pos === 3) return 2;
  return 3; // pos 0 and 1 (ones/tens)
}

// ---------------------------------------------------------------------------
// Result row: builds up digit by digit, right to left
// ---------------------------------------------------------------------------

function ResultRow({
  resultStr,
  revealedStep,
}: {
  resultStr: string;
  revealedStep: number;
}) {
  const padded = pad5(resultStr);

  return (
    <span className="inline-flex items-baseline font-mono text-2xl tracking-widest">
      {padded.split("").map((char, i) => {
        if (char === " ") {
          return (
            <span key={i} className="inline-block w-[1ch]">&nbsp;</span>
          );
        }
        if (char === ".") {
          return (
            <span key={i} className="inline-block w-[0.6ch] text-center">
              .
            </span>
          );
        }

        const minStep = revealedAt(i);
        const show = revealedStep >= minStep;

        return (
          <span key={i} className="inline-block w-[1ch] text-center">
            {show ? (
              <motion.span
                key={`${char}-${revealedStep}`}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="font-bold text-[var(--color-accent)]"
              >
                {char}
              </motion.span>
            ) : (
              <span className="text-[var(--color-text-secondary)] opacity-30">
                ?
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Column addition block
// ---------------------------------------------------------------------------

function ColumnAddition({
  aStr,
  bStr,
  resultStr,
  symbol,
  revealedStep,
}: {
  aStr: string;
  bStr: string;
  resultStr: string;
  symbol: string;
  revealedStep: number;
}) {
  const width = Math.max(aStr.length, bStr.length, resultStr.length);
  const aPad = aStr.padStart(width);
  const bPad = bStr.padStart(width);

  return (
    <div className="my-4 flex justify-center">
      <div className="rounded-lg bg-[var(--color-bg-tertiary)] p-5">
        <div className="flex flex-col items-end gap-1 font-mono text-2xl tracking-widest">
          {/* Row 1: first number */}
          <span>{aPad}</span>
          {/* Row 2: operator + second number */}
          <span>
            <span className="mr-1 text-[var(--color-text-secondary)]">
              {symbol}
            </span>
            {bPad}
          </span>
          {/* Divider */}
          <div className="my-1 w-full border-t-2 border-[var(--color-text-secondary)]" />
          {/* Row 3: result (reveals progressively) */}
          <ResultRow resultStr={resultStr} revealedStep={revealedStep} />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step labels (translated, no LaTeX text)
// ---------------------------------------------------------------------------

const STEP_KEYS = ["alignPoints", "hundredthsCol", "tenthsCol", "result"] as const;

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function AddSubtractExplorer() {
  const t = useTranslations("decimals");
  const [a, setA] = useState(3.45);
  const [b, setB] = useState(1.27);
  const [op, setOp] = useState<Op>("add");
  const [revealedStep, setRevealedStep] = useState(0);

  const effectiveB = Math.min(b, op === "subtract" ? a : 19.99);
  const result = op === "add" ? a + effectiveB : a - effectiveB;

  const aStr = a.toFixed(2);
  const bStr = effectiveB.toFixed(2);
  const resultStr = result.toFixed(2);
  const symbol = op === "add" ? "+" : "−";

  const totalSteps = STEP_KEYS.length; // 4 steps (0–3)

  const reset = () => setRevealedStep(0);

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6">
      <h3 className="mb-4 text-lg font-semibold">{t("addSubTitle")}</h3>

      {/* Inputs */}
      <div className="mb-4 space-y-3">
        <div>
          <div className="mb-1 flex justify-between text-sm">
            <span className="font-medium">{t("firstNumber")}</span>
            <span className="font-mono text-[var(--color-accent)]">
              {a.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min={0.01}
            max={19.99}
            step={0.01}
            value={a}
            onChange={(e) => {
              setA(parseFloat(e.target.value));
              reset();
            }}
            className="w-full"
          />
        </div>
        <div>
          <div className="mb-1 flex justify-between text-sm">
            <span className="font-medium">{t("secondNumber")}</span>
            <span className="font-mono text-[var(--color-accent)]">
              {effectiveB.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min={0.01}
            max={19.99}
            step={0.01}
            value={effectiveB}
            onChange={(e) => {
              setB(parseFloat(e.target.value));
              reset();
            }}
            className="w-full"
          />
        </div>

        {/* Operation toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              setOp("add");
              reset();
            }}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              op === "add"
                ? "bg-[var(--color-accent)] text-white"
                : "border border-[var(--color-border)] hover:bg-[var(--color-bg-tertiary)]"
            }`}
          >
            + {t("addition")}
          </button>
          <button
            onClick={() => {
              setOp("subtract");
              reset();
            }}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              op === "subtract"
                ? "bg-[var(--color-accent)] text-white"
                : "border border-[var(--color-border)] hover:bg-[var(--color-bg-tertiary)]"
            }`}
          >
            − {t("subtraction")}
          </button>
        </div>
      </div>

      {/* Step label */}
      <motion.div
        key={revealedStep}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-1 text-center text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]"
      >
        {t(STEP_KEYS[revealedStep])}
      </motion.div>

      {/* Column addition visual */}
      <ColumnAddition
        aStr={aStr}
        bStr={bStr}
        resultStr={resultStr}
        symbol={symbol}
        revealedStep={revealedStep}
      />

      {/* Next step button or final result callout */}
      {revealedStep < totalSteps - 1 ? (
        <button
          onClick={() => setRevealedStep((s) => s + 1)}
          className="mt-2 w-full rounded-lg bg-[var(--color-accent)] py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
        >
          {t("showNextStep")} ({revealedStep + 1}/{totalSteps - 1})
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-2 rounded-lg bg-[var(--color-accent)]/10 p-3 text-center"
        >
          <p className="text-lg font-bold text-[var(--color-accent)]">
            {aStr} {symbol} {bStr} = {resultStr}
          </p>
        </motion.div>
      )}
    </div>
  );
}
