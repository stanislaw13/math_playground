"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import katex from "katex";

function RenderedLatex({ latex }: { latex: string }) {
  const html = katex.renderToString(latex, { throwOnError: false, displayMode: false });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function PlaceValueExplorer() {
  const t = useTranslations("decimals");
  const [ones, setOnes] = useState(2);
  const [tenths, setTenths] = useState(3);
  const [hundredths, setHundredths] = useState(5);

  const total = ones + tenths / 10 + hundredths / 100;
  const fractionStr = `${ones} + \\frac{${tenths}}{10} + \\frac{${hundredths}}{100}`;

  // Visual bar — fill proportionally (max 20 for reasonable range)
  const maxVal = 20;
  const fillPercent = Math.min((total / maxVal) * 100, 100);

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6">
      <h3 className="mb-4 text-lg font-semibold">{t("placeValueTitle")}</h3>

      {/* Visual bar */}
      <div className="mb-6">
        <div className="relative h-10 w-full overflow-hidden rounded-lg bg-[var(--color-bg-tertiary)]">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-lg bg-[var(--color-accent)]"
            animate={{ width: `${fillPercent}%` }}
            transition={{ duration: 0.3 }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">
            {total.toFixed(2)}
          </div>
        </div>
        <div className="mt-1 flex justify-between text-xs text-[var(--color-text-secondary)]">
          <span>0</span>
          <span>5</span>
          <span>10</span>
          <span>15</span>
          <span>20</span>
        </div>
      </div>

      {/* Fraction breakdown */}
      <div className="mb-6 rounded-lg bg-[var(--color-bg-tertiary)] p-4 text-center">
        <RenderedLatex latex={`${total.toFixed(2)} = ${fractionStr}`} />
      </div>

      {/* Sliders */}
      <div className="space-y-4">
        <div>
          <div className="mb-1 flex justify-between text-sm">
            <span className="font-medium">{t("ones")}</span>
            <span className="font-mono text-[var(--color-accent)]">{ones}</span>
          </div>
          <input
            type="range" min={0} max={19} step={1} value={ones}
            onChange={(e) => setOnes(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <div className="mb-1 flex justify-between text-sm">
            <span className="font-medium">{t("tenths")}</span>
            <span className="font-mono text-[var(--color-accent)]">{tenths}</span>
          </div>
          <input
            type="range" min={0} max={9} step={1} value={tenths}
            onChange={(e) => setTenths(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <div className="mb-1 flex justify-between text-sm">
            <span className="font-medium">{t("hundredths")}</span>
            <span className="font-mono text-[var(--color-accent)]">{hundredths}</span>
          </div>
          <input
            type="range" min={0} max={9} step={1} value={hundredths}
            onChange={(e) => setHundredths(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
