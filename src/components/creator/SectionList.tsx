"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import SectionEditor from "./SectionEditor";
import type {
  CustomSection,
  CustomSectionType,
  CustomMatchPairsConfig,
  CustomComparisonConfig,
  CustomLatexConfig,
} from "@/lib/customLessons/types";

interface SectionListProps {
  sections: CustomSection[];
  onChange: (sections: CustomSection[]) => void;
}

function defaultConfig(
  type: CustomSectionType,
): CustomMatchPairsConfig | CustomComparisonConfig | CustomLatexConfig {
  switch (type) {
    case "match_pairs":
      return { gridCols: 4, pairs: [] } satisfies CustomMatchPairsConfig;
    case "comparison":
      return {
        prompt: "Which is bigger?",
        showEqualButton: false,
        totalQuestions: 8,
        pairs: [],
      } satisfies CustomComparisonConfig;
    case "latex":
      return { content: "", displayMode: true } satisfies CustomLatexConfig;
  }
}

let tempIdCounter = 0;
function tempId() {
  return `temp-${Date.now()}-${tempIdCounter++}`;
}

export default function SectionList({ sections, onChange }: SectionListProps) {
  const t = useTranslations("creator");
  const [showAdd, setShowAdd] = useState(false);

  const addSection = (type: CustomSectionType) => {
    const newSection: CustomSection = {
      id: tempId(),
      lesson_id: "",
      position: sections.length,
      type,
      title: "",
      config: defaultConfig(type),
      created_at: new Date().toISOString(),
    };
    onChange([...sections, newSection]);
    setShowAdd(false);
  };

  const updateSection = (index: number, updated: CustomSection) => {
    const next = [...sections];
    next[index] = updated;
    onChange(next);
  };

  const deleteSection = (index: number) => {
    if (!confirm(t("confirmDeleteSection"))) return;
    onChange(sections.filter((_, i) => i !== index));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const next = [...sections];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onChange(next);
  };

  const moveDown = (index: number) => {
    if (index >= sections.length - 1) return;
    const next = [...sections];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    onChange(next);
  };

  const sectionTypeLabel = (type: CustomSectionType) => {
    switch (type) {
      case "match_pairs":
        return t("matchPairs");
      case "comparison":
        return t("comparison");
      case "latex":
        return t("latexContent");
    }
  };

  return (
    <div className="space-y-4">
      {/* Add section dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
        >
          + {t("addSection")}
        </button>
        {showAdd && (
          <div className="absolute left-0 top-full z-10 mt-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] py-1 shadow-lg">
            {(["match_pairs", "comparison", "latex"] as CustomSectionType[]).map(
              (type) => (
                <button
                  key={type}
                  onClick={() => addSection(type)}
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-[var(--color-bg-tertiary)]"
                >
                  {sectionTypeLabel(type)}
                </button>
              ),
            )}
          </div>
        )}
      </div>

      {/* Section list */}
      {sections.length === 0 && (
        <p className="py-8 text-center text-sm text-[var(--color-text-secondary)]">
          {t("noSections")}
        </p>
      )}

      {sections.map((section, i) => (
        <div
          key={section.id}
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4"
        >
          {/* Section header */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="rounded bg-[var(--color-accent)]/20 px-2 py-0.5 text-xs font-medium text-[var(--color-accent)]">
                {sectionTypeLabel(section.type)}
              </span>
              <span className="text-xs text-[var(--color-text-secondary)]">
                #{i + 1}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => moveUp(i)}
                disabled={i === 0}
                className="rounded px-2 py-1 text-xs transition-colors hover:bg-[var(--color-bg-tertiary)] disabled:opacity-30"
                title={t("moveUp")}
              >
                ↑
              </button>
              <button
                onClick={() => moveDown(i)}
                disabled={i >= sections.length - 1}
                className="rounded px-2 py-1 text-xs transition-colors hover:bg-[var(--color-bg-tertiary)] disabled:opacity-30"
                title={t("moveDown")}
              >
                ↓
              </button>
              <button
                onClick={() => deleteSection(i)}
                className="rounded px-2 py-1 text-xs text-[var(--color-error)] hover:bg-[var(--color-error)]/10"
              >
                {t("deleteSection")}
              </button>
            </div>
          </div>

          {/* Section editor */}
          <SectionEditor
            section={section}
            onChange={(updated) => updateSection(i, updated)}
          />
        </div>
      ))}
    </div>
  );
}
