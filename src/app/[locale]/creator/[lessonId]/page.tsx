"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth/context";
import {
  fetchLesson,
  updateLesson,
  addSection,
  updateSection,
  deleteSection as apiDeleteSection,
  reorderSections,
} from "@/lib/customLessons/api";
import type { CustomSection } from "@/lib/customLessons/types";
import LessonForm from "@/components/creator/LessonForm";
import SectionList from "@/components/creator/SectionList";

export default function EditLessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = use(params);
  const t = useTranslations("creator");
  const { user, loading: authLoading } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<"primary" | "highschool">("primary");
  const [sections, setSections] = useState<CustomSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  // Track which section IDs came from the DB so we know what's new vs existing
  const [dbSectionIds, setDbSectionIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    fetchLesson(lessonId)
      .then((lesson) => {
        setTitle(lesson.title);
        setDescription(lesson.description);
        setCategory(lesson.category);
        setSections(lesson.sections);
        setDbSectionIds(new Set(lesson.sections.map((s) => s.id)));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user, lessonId]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSavedMsg("");
    try {
      // Update lesson metadata
      await updateLesson(lessonId, { title, description, category });

      // Determine which sections to create, update, or delete
      const currentIds = new Set(sections.map((s) => s.id));

      // Delete removed sections
      for (const id of dbSectionIds) {
        if (!currentIds.has(id)) {
          await apiDeleteSection(id);
        }
      }

      // Create or update sections
      const newDbIds = new Set<string>();
      for (let i = 0; i < sections.length; i++) {
        const sec = sections[i];
        if (dbSectionIds.has(sec.id)) {
          // Existing — update
          await updateSection(sec.id, {
            title: sec.title,
            config: sec.config,
            position: i,
          });
          newDbIds.add(sec.id);
        } else {
          // New — create
          const created = await addSection(
            lessonId,
            sec.type,
            sec.title,
            sec.config,
            i,
          );
          // Update the local section with the real DB id
          sections[i] = { ...sec, id: created.id };
          newDbIds.add(created.id);
        }
      }

      // Reorder
      await reorderSections(
        lessonId,
        sections.map((s) => s.id),
      );

      setDbSectionIds(newDbIds);
      setSections([...sections]);
      setSavedMsg(t("saved"));
      setTimeout(() => setSavedMsg(""), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }, [lessonId, title, description, category, sections, dbSectionIds, t]);

  if (authLoading || loading) return null;

  if (!user) {
    return (
      <p className="py-12 text-center text-[var(--color-text-secondary)]">
        {t("loginRequired")}
      </p>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("editLesson")}</h1>
        <div className="flex items-center gap-3">
          {savedMsg && (
            <span className="text-sm text-[var(--color-success)]">
              {savedMsg}
            </span>
          )}
          <Link
            href={`/play/${lessonId}`}
            className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm transition-colors hover:bg-[var(--color-bg-tertiary)]"
          >
            {t("preview")}
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
          >
            {saving ? "..." : t("saved").replace("!", "")}
          </button>
        </div>
      </div>

      {/* Lesson metadata */}
      <div className="mb-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6">
        <LessonForm
          title={title}
          description={description}
          category={category}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
          onCategoryChange={setCategory}
        />
      </div>

      {/* Sections */}
      <SectionList sections={sections} onChange={setSections} />
    </div>
  );
}
