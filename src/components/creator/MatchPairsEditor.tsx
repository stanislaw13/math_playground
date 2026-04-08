"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import ContentElementInput from "./ContentElementInput";
import CsvImportModal from "./CsvImportModal";
import type {
  ContentElement,
  CustomMatchPairsConfig,
} from "@/lib/customLessons/types";

interface MatchPairsEditorProps {
  config: CustomMatchPairsConfig;
  onChange: (config: CustomMatchPairsConfig) => void;
}

const emptyElement = (): ContentElement => ({ type: "text", value: "" });

export default function MatchPairsEditor({
  config,
  onChange,
}: MatchPairsEditorProps) {
  const t = useTranslations("creator");
  const [showCsv, setShowCsv] = useState(false);

  const updatePair = (
    index: number,
    side: "left" | "right",
    val: ContentElement,
  ) => {
    const pairs = [...config.pairs];
    pairs[index] = { ...pairs[index], [side]: val };
    onChange({ ...config, pairs });
  };

  const addPair = () => {
    onChange({
      ...config,
      pairs: [
        ...config.pairs,
        { left: emptyElement(), right: emptyElement() },
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
    pairs: { left: ContentElement; right: ContentElement }[],
  ) => {
    onChange({ ...config, pairs: [...config.pairs, ...pairs] });
    setShowCsv(false);
  };

  return (
    <div className="space-y-4">
      {/* Grid cols */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-[var(--color-text-secondary)]">
          {t("gridCols")}
        </label>
        <input
          type="number"
          min={2}
          max={6}
          value={config.gridCols}
          onChange={(e) =>
            onChange({ ...config, gridCols: Number(e.target.value) })
          }
          className="w-16 rounded border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-2 py-1 text-sm text-[var(--color-text-primary)]"
        />
      </div>

      {/* Pairs table */}
      <div className="space-y-2">
        <div className="grid grid-cols-[1fr_1fr_auto] gap-2 text-xs font-medium text-[var(--color-text-secondary)]">
          <span>{t("left")}</span>
          <span>{t("right")}</span>
          <span />
        </div>
        {config.pairs.map((pair, i) => (
          <div
            key={i}
            className="grid grid-cols-[1fr_1fr_auto] items-start gap-2"
          >
            <ContentElementInput
              value={pair.left}
              onChange={(val) => updatePair(i, "left", val)}
            />
            <ContentElementInput
              value={pair.right}
              onChange={(val) => updatePair(i, "right", val)}
            />
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
          mode="pairs"
          onImport={handleCsvImport}
          onClose={() => setShowCsv(false)}
        />
      )}
    </div>
  );
}
