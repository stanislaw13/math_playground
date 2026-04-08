"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth/context";
import { createLesson } from "@/lib/customLessons/api";
import LessonForm from "@/components/creator/LessonForm";

export default function NewLessonPage() {
  const t = useTranslations("creator");
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<"primary" | "highschool">("primary");
  const [saving, setSaving] = useState(false);

  if (authLoading) return null;

  if (!user) {
    return (
      <p className="py-12 text-center text-[var(--color-text-secondary)]">
        {t("loginRequired")}
      </p>
    );
  }

  const handleCreate = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const lesson = await createLesson(user.id, title, description, category);
      router.push(`../creator/${lesson.id}`);
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-3xl font-bold">{t("newLesson")}</h1>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6">
        <LessonForm
          title={title}
          description={description}
          category={category}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
          onCategoryChange={setCategory}
        />

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleCreate}
            disabled={saving || !title.trim()}
            className="rounded-lg bg-[var(--color-accent)] px-6 py-2 font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
          >
            {t("newLesson")}
          </button>
        </div>
      </div>
    </div>
  );
}
