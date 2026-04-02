"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import katex from "katex";

function Latex({ latex }: { latex: string }) {
  const html = katex.renderToString(latex, { throwOnError: false, displayMode: true });
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

type Op = "add" | "subtract";

/**
 * Breaks an addition or subtraction of two decimals into column-by-column steps.
 * Returns an array of step descriptions with LaTeX.
 */
function computeSteps(a: number, b: number, op: Op) {
  const aStr = a.toFixed(2);
  const bStr = b.toFixed(2);
  const result = op === "add" ? a + b : a - b;
  const resultStr = result.toFixed(2);
  const symbol = op === "add" ? "+" : "-";

  const steps = [
    {
      label: "alignPoints",
      latex: `\\begin{array}{r} ${aStr} \\\\ ${symbol}\\; ${bStr} \\\\ \\hline \\end{array}`,
    },
    {
      label: "hundredthsCol",
      latex: `\\text{Hundredths: } ${aStr[4]} ${symbol} ${bStr[4]} = ${resultStr[resultStr.length - 1]}`,
    },
    {
      label: "tenthsCol",
      latex: `\\text{Tenths: } ${aStr[2]} ${symbol} ${bStr[2]}`,
    },
    {
      label: "result",
      latex: `${aStr} ${symbol} ${bStr} = ${resultStr}`,
    },
  ];
  return steps;
}

export default function AddSubtractExplorer() {
  const t = useTranslations("decimals");
  const [a, setA] = useState(3.45);
  const [b, setB] = useState(1.27);
  const [op, setOp] = useState<Op>("add");
  const [revealedStep, setRevealedStep] = useState(0);

  const result = op === "add" ? a + b : a - b;
  const steps = computeSteps(a, b, op);

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6">
      <h3 className="mb-4 text-lg font-semibold">{t("addSubTitle")}</h3>

      {/* Inputs */}
      <div className="mb-4 space-y-3">
        <div>
          <div className="mb-1 flex justify-between text-sm">
            <span className="font-medium">{t("firstNumber")}</span>
            <span className="font-mono text-[var(--color-accent)]">{a.toFixed(2)}</span>
          </div>
          <input
            type="range" min={0.01} max={19.99} step={0.01} value={a}
            onChange={(e) => { setA(parseFloat(e.target.value)); setRevealedStep(0); }}
            className="w-full"
          />
        </div>
        <div>
          <div className="mb-1 flex justify-between text-sm">
            <span className="font-medium">{t("secondNumber")}</span>
            <span className="font-mono text-[var(--color-accent)]">{b.toFixed(2)}</span>
          </div>
          <input
            type="range" min={0.01} max={19.99} step={0.01}
            value={Math.min(b, op === "subtract" ? a : 19.99)}
            onChange={(e) => { setB(parseFloat(e.target.value)); setRevealedStep(0); }}
            className="w-full"
          />
        </div>

        {/* Operation toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => { setOp("add"); setRevealedStep(0); }}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              op === "add"
                ? "bg-[var(--color-accent)] text-white"
                : "border border-[var(--color-border)] hover:bg-[var(--color-bg-tertiary)]"
            }`}
          >
            + {t("addition")}
          </button>
          <button
            onClick={() => { setOp("subtract"); setRevealedStep(0); }}
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

      {/* Step-by-step reveal */}
      <div className="space-y-3">
        {steps.slice(0, revealedStep + 1).map((step, i) => (
          <motion.div
            key={`${a}-${b}-${op}-${i}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg bg-[var(--color-bg-tertiary)] p-4"
          >
            <p className="mb-1 text-xs font-medium text-[var(--color-text-secondary)]">
              {t(step.label)}
            </p>
            <Latex latex={step.latex} />
          </motion.div>
        ))}
      </div>

      {revealedStep < steps.length - 1 ? (
        <button
          onClick={() => setRevealedStep((s) => s + 1)}
          className="mt-4 w-full rounded-lg bg-[var(--color-accent)] py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
        >
          {t("showNextStep")} ({revealedStep + 1}/{steps.length})
        </button>
      ) : (
        <div className="mt-4 rounded-lg bg-[var(--color-accent)]/10 p-3 text-center">
          <p className="text-lg font-bold text-[var(--color-accent)]">
            {a.toFixed(2)} {op === "add" ? "+" : "−"} {b.toFixed(2)} = {result.toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
}
