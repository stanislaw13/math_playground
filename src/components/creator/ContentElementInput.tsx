"use client";

import { useTranslations } from "next-intl";
import katex from "katex";
import type { ContentElement } from "@/lib/customLessons/types";

interface ContentElementInputProps {
  value: ContentElement;
  onChange: (val: ContentElement) => void;
}

export default function ContentElementInput({
  value,
  onChange,
}: ContentElementInputProps) {
  const t = useTranslations("creator");

  const typeOptions: { value: ContentElement["type"]; label: string }[] = [
    { value: "text", label: t("text") },
    { value: "latex", label: t("latex") },
    { value: "image", label: t("image") },
  ];

  const latexPreview =
    value.type === "latex" && value.value
      ? (() => {
          try {
            return katex.renderToString(value.value, {
              throwOnError: false,
              displayMode: false,
            });
          } catch {
            return "";
          }
        })()
      : "";

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-1">
        <select
          value={value.type}
          onChange={(e) =>
            onChange({ ...value, type: e.target.value as ContentElement["type"] })
          }
          className="rounded border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-2 py-1.5 text-xs text-[var(--color-text-primary)]"
        >
          {typeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={value.value}
          onChange={(e) => onChange({ ...value, value: e.target.value })}
          placeholder={
            value.type === "latex" ? "\\frac{1}{2}" : value.type === "image" ? "https://..." : ""
          }
          className="min-w-0 flex-1 rounded border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-2 py-1.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
        />
      </div>
      {value.type === "latex" && latexPreview && (
        <div
          className="rounded bg-[var(--color-bg-tertiary)] px-2 py-1 text-sm"
          dangerouslySetInnerHTML={{ __html: latexPreview }}
        />
      )}
      {value.type === "image" && value.value && (
        <img
          src={value.value}
          alt="preview"
          className="max-h-16 rounded object-contain"
        />
      )}
    </div>
  );
}
