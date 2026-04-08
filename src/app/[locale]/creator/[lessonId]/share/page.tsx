"use client";

import { use } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth/context";
import ShareManager from "@/components/creator/ShareManager";

export default function SharePage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = use(params);
  const t = useTranslations("creator");
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return (
      <p className="py-12 text-center text-[var(--color-text-secondary)]">
        {t("loginRequired")}
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href={`/creator/${lessonId}`}
          className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm transition-colors hover:bg-[var(--color-bg-tertiary)]"
        >
          ← {t("editLesson")}
        </Link>
        <h1 className="text-3xl font-bold">{t("share")}</h1>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6">
        <ShareManager lessonId={lessonId} />
      </div>
    </div>
  );
}
