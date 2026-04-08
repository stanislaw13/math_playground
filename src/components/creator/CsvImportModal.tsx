"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import type { ContentElement } from "@/lib/customLessons/types";

type ImportedPair = {
  left: ContentElement;
  right: ContentElement;
  correct?: "left" | "right" | "equal";
};

interface CsvImportModalProps {
  mode: "pairs" | "comparison";
  onImport: (pairs: ImportedPair[]) => void;
  onClose: () => void;
}

function detectElement(raw: string): ContentElement {
  const trimmed = raw.trim();
  if (trimmed.includes("\\")) {
    return { type: "latex", value: trimmed };
  }
  return { type: "text", value: trimmed };
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function parseCsv(text: string, mode: "pairs" | "comparison"): ImportedPair[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];

  // Skip header row
  const dataLines = lines.slice(1);
  const pairs: ImportedPair[] = [];

  for (const line of dataLines) {
    const cols = parseCsvLine(line);
    if (cols.length < 2) continue;

    const pair: ImportedPair = {
      left: detectElement(cols[0]),
      right: detectElement(cols[1]),
    };

    if (mode === "comparison" && cols.length >= 3) {
      const c = cols[2].trim().toLowerCase();
      if (c === "left" || c === "right" || c === "equal") {
        pair.correct = c;
      }
    }

    pairs.push(pair);
  }

  return pairs;
}

export default function CsvImportModal({
  mode,
  onImport,
  onClose,
}: CsvImportModalProps) {
  const t = useTranslations("creator");
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<ImportedPair[]>([]);
  const [error, setError] = useState("");

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseCsv(text, mode);
      if (parsed.length === 0) {
        setError(t("csvNoData"));
        setPreview([]);
      } else {
        setError("");
        setPreview(parsed);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6">
        <h3 className="mb-4 text-lg font-semibold">{t("importCsv")}</h3>

        <p className="mb-4 text-xs text-[var(--color-text-secondary)]">
          {t("csvHelp")}
        </p>

        <input
          ref={fileRef}
          type="file"
          accept=".csv,.txt"
          onChange={handleFile}
          className="mb-4 block w-full text-sm text-[var(--color-text-secondary)] file:mr-3 file:rounded-lg file:border file:border-[var(--color-border)] file:bg-[var(--color-bg-tertiary)] file:px-3 file:py-1.5 file:text-sm file:text-[var(--color-text-primary)]"
        />

        {error && (
          <p className="mb-3 text-sm text-[var(--color-error)]">{error}</p>
        )}

        {preview.length > 0 && (
          <>
            <p className="mb-2 text-sm font-medium">
              {t("csvPreview")} ({preview.length} rows)
            </p>
            <div className="mb-4 max-h-48 overflow-y-auto rounded border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] p-2 text-xs font-mono">
              {preview.map((p, i) => (
                <div key={i} className="flex gap-2 py-0.5">
                  <span className="text-[var(--color-text-secondary)]">
                    [{p.left.type}]
                  </span>
                  <span>{p.left.value}</span>
                  <span className="text-[var(--color-text-secondary)]">|</span>
                  <span className="text-[var(--color-text-secondary)]">
                    [{p.right.type}]
                  </span>
                  <span>{p.right.value}</span>
                  {p.correct && (
                    <>
                      <span className="text-[var(--color-text-secondary)]">
                        |
                      </span>
                      <span className="text-[var(--color-accent)]">
                        {p.correct}
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm transition-colors hover:bg-[var(--color-bg-tertiary)]"
          >
            {t("csvCancel")}
          </button>
          {preview.length > 0 && (
            <button
              onClick={() => onImport(preview)}
              className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
            >
              {t("csvImport")} ({preview.length})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
