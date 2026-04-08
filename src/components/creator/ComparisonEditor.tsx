"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import ContentElementInput from "./ContentElementInput";
import CsvImportModal from "./CsvImportModal";
import type {
  ContentElement,
  CustomComparisonConfig,
} from "@/lib/customLessons/types";

interface ComparisonEditorProps {
  config: CustomComparisonConfig;
  onChange: (config: CustomComparisonConfig) => void;
}

const emptyElement = (): ContentElement => ({ type: "text", value: "" });

export default function ComparisonEditor({
  config,
  onChange,
}: ComparisonEditorProps) {
  const t = useTranslations("creator");
  const [showCsv, setShowCsv] = useState(false);

  const updatePair = (
    index: number,
    field: "left" | "right",
    val: ContentElement,
  ) => {
    const pairs = [...config.pairs];
    pairs[index] = { ...pairs[index], [field]: val };
    onChange({ ...config, pairs });
  };

  const updateCorrect = (
    index: number,
    correct: "left" | "right" | "equal",
  ) => {
    const pairs = [...config.pairs];
    pairs[index] = { ...pairs[index], correct };
    onChange({ ...config, pairs });
  };

  const addPair = () => {
    onChange({
      ...config,
      pairs: [
        ...config.pairs,
        { left: emptyElement(), right: emptyElement(), correct: "left" as const },
      ],
    });
  };

  const removePair = (index: number) => {
    onChange({
      ...config,
      pairs: config.pairs.filter((_, i) => i !== index),
    });
  };

  const handleCsvImport = (
    pairs: {
      left: ContentElement;
      right: ContentElement;
      correct?: "left" | "right" | "equal";
    }[],
  ) => {
    const withCorrect = pairs.map((p) => ({
      ...p,
      correct: p.correct ?? ("left" as const),
    }));
    onChange({ ...config, pairs: [...config.pairs, ...withCorrect] });
    setShowCsv(false);
  };

  return (
    <div className="space-y-4">
      {/* Settings */}
      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[var(--color-text-secondary)]">
            {t("prompt")}
          </label>
          <input
            type="text"
            value={config.prompt}
            onChange={(e) => onChange({ ...config, prompt: e.target.value })}
            className="rounded border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-2 py-1.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={config.showEqualButton}
            onChange={(e) =>
              onChange({ ...config, showEqualButton: e.target.checked })
            }
            className="accent-[var(--color-accent)]"
          />
          {t("showEqualButton")}
        </label>
      </div>

      {/* Pairs table */}
      <div className="space-y-2">
        <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 text-xs font-medium text-[var(--color-text-secondary)]">
          <span>{t("left")}</span>
          <span>{t("right")}</span>
          <span>{t("correct")}</span>
          <span />
        </div>
        {config.pairs.map((pair, i) => (
          <div
            key={i}
            className="grid grid-cols-[1fr_1fr_auto_auto] items-start gap-2"
          >
            <ContentElementInput
              value={pair.left}
              onChange={(val) => updatePair(i, "left", val)}
            />
            <ContentElementInput
              value={pair.right}
              onChange={(val) => updatePair(i, "right", val)}
            />
            <select
              value={pair.correct}
              onChange={(e) =>
                updateCorrect(
                  i,
                  e.target.value as "left" | "right" | "equal",
                )
              }
              className="mt-1 rounded border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-2 py-1.5 text-xs text-[var(--color-text-primary)]"
            >
              <option value="left">{t("left")}</option>
              <option value="right">{t("right")}</option>
              <option value="equal">=</option>
            </select>
            <button
              onClick={() => removePair(i)}
              className="mt-1 rounded px-2 py-1 text-xs text-[var(--color-error)] hover:bg-[var(--color-error)]/10"
            >
              {t("removePair")}
            </button>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={addPair}
          className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm transition-colors hover:bg-[var(--color-bg-tertiary)]"
        >
          + {t("addPair")}
        </button>
        <button
          onClick={() => setShowCsv(true)}
          className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm transition-colors hover:bg-[var(--color-bg-tertiary)]"
        >
          {t("importCsv")}
        </button>
      </div>

      {showCsv && (
        <CsvImportModal
          mode="comparison"
          onImport={handleCsvImport}
          onClose={() => setShowCsv(false)}
        />
      )}
    </div>
  );
}
