"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import LessonShell from "@/components/lessons/LessonShell";
import { lessons } from "@/content/lessons";
import { resolveLocaleString } from "@/components/lessons/types";
import type { LessonConfig } from "@/components/lessons/types";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export default function DynamicLessonPage({ params }: Props) {
  const { locale, slug } = use(params);

  const meta = lessons.find(
    (l) => l.category === "primary" && l.path === `/primary/${slug}`
  );

  if (!meta?.def) notFound();

  const def = meta.def;

  const config: LessonConfig = {
    id: def.id,
    sections: [],
    formulas: def.formulas?.map((f) => ({
      ...f,
      label: resolveLocaleString(f.label, locale),
    })),
  };

  return <LessonShell config={config}>{def.sections(locale)}</LessonShell>;
}
