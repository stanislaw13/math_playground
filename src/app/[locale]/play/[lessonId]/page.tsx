"use client";

import { useState, useEffect, use } from "react";
import { useAuth } from "@/lib/auth/context";
import { fetchLesson } from "@/lib/customLessons/api";
import { renderCustomSections } from "@/components/creator/CustomLessonRenderer";
import LessonShell from "@/components/lessons/LessonShell";
import type { CustomLesson, CustomSection } from "@/lib/customLessons/types";

export default function PlayCustomLessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = use(params);
  const { user, loading: authLoading } = useAuth();
  const [lesson, setLesson] = useState<
    (CustomLesson & { sections: CustomSection[] }) | null
  >(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    fetchLesson(lessonId)
      .then(setLesson)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [lessonId, authLoading]);

  if (authLoading || loading) return null;

  if (error || !lesson) {
    return (
      <p className="py-12 text-center text-[var(--color-text-secondary)]">
        Lesson not found or you do not have access.
      </p>
    );
  }

  if (!lesson.sections.length) {
    return (
      <p className="py-12 text-center text-[var(--color-text-secondary)]">
        This lesson has no sections yet.
      </p>
    );
  }

  const sections = renderCustomSections(lesson.sections, lessonId);

  return (
    <LessonShell config={{ id: `custom-${lessonId}`, sections: [] }}>
      {sections}
    </LessonShell>
  );
}
