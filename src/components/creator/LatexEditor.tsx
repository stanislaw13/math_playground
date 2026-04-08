"use client";

import { useTranslations } from "next-intl";
import katex from "katex";
import type { CustomLatexConfig } from "@/lib/customLessons/types";

interface LatexEditorProps {
  config: CustomLatexConfig;
  onChange: (config: CustomLatexConfig) => void;
}

export default function LatexEditor({ config, onChange }: LatexEditorProps) {
  const t = useTranslations("creator");

  const preview = config.content
    ? (() => {
        try {
          return katex.renderToString(config.content, {
            throwOnError: false,
            displayMode: config.displayMode,
          });
        } catch {
          return "";
        }
      })()
    : "";

  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={config.displayMode}
          onChange={(e) =>
            onChange({ ...config, displayMode: e.target.checked })
          }
          className="accent-[var(--color-accent)]"
        />
        {t("displayMode")}
      </label>

      <textarea
        value={config.content}
        onChange={(e) => onChange({ ...config, content: e.target.value })}
        placeholder={t("latexPlaceholder")}
        rows={6}
        className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-3 py-2 font-mono text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
      />

      {preview && (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] p-4">
          <p className="mb-2 text-xs font-medium text-[var(--color-text-secondary)]">
            {t("preview")}
          </p>
          <div dangerouslySetInnerHTML={{ __html: preview }} />
        </div>
      )}
    </div>
  );
}
