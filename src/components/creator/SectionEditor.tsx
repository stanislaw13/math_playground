"use client";

import { useTranslations } from "next-intl";
import MatchPairsEditor from "./MatchPairsEditor";
import ComparisonEditor from "./ComparisonEditor";
import LatexEditor from "./LatexEditor";
import type {
  CustomSection,
  CustomMatchPairsConfig,
  CustomComparisonConfig,
  CustomLatexConfig,
} from "@/lib/customLessons/types";

interface SectionEditorProps {
  section: CustomSection;
  onChange: (section: CustomSection) => void;
}

export default function SectionEditor({
  section,
  onChange,
}: SectionEditorProps) {
  const t = useTranslations("creator");

  return (
    <div className="space-y-3">
      {/* Section title */}
      <input
        type="text"
        value={section.title}
        onChange={(e) => onChange({ ...section, title: e.target.value })}
        placeholder={t("sectionTitle")}
        className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
      />

      {/* Type-specific editor */}
      {section.type === "match_pairs" && (
        <MatchPairsEditor
          config={section.config as CustomMatchPairsConfig}
          onChange={(config) => onChange({ ...section, config })}
        />
      )}

      {section.type === "comparison" && (
        <ComparisonEditor
          config={section.config as CustomComparisonConfig}
          onChange={(config) => onChange({ ...section, config })}
        />
      )}

      {section.type === "latex" && (
        <LatexEditor
          config={section.config as CustomLatexConfig}
          onChange={(config) => onChange({ ...section, config })}
        />
      )}
    </div>
  );
}
