"use client";

import { useTranslations } from "next-intl";

interface LessonFormProps {
  title: string;
  description: string;
  category: "primary" | "highschool";
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onCategoryChange: (category: "primary" | "highschool") => void;
}

export default function LessonForm({
  title,
  description,
  category,
  onTitleChange,
  onDescriptionChange,
  onCategoryChange,
}: LessonFormProps) {
  const t = useTranslations("creator");

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-[var(--color-text-secondary)]">
          {t("lessonTitle")}
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-3 py-2 text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-[var(--color-text-secondary)]">
          {t("lessonDescription")}
        </label>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-3 py-2 text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-[var(--color-text-secondary)]">
          {t("category")}
        </label>
        <select
          value={category}
          onChange={(e) =>
            onCategoryChange(e.target.value as "primary" | "highschool")
          }
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-3 py-2 text-[var(--color-text-primary)]"
        >
          <option value="primary">{t("primary")}</option>
          <option value="highschool">{t("highschool")}</option>
        </select>
      </div>
    </div>
  );
}
