"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth/context";
import { fetchMyLessons, fetchSharedLessons, deleteLesson } from "@/lib/customLessons/api";
import type { CustomLesson } from "@/lib/customLessons/types";

export default function CreatorDashboard() {
  const t = useTranslations("creator");
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<"mine" | "shared">("mine");
  const [myLessons, setMyLessons] = useState<CustomLesson[]>([]);
  const [sharedLessons, setSharedLessons] = useState<CustomLesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      fetchMyLessons(user.id),
      fetchSharedLessons(user.id),
    ]).then(([mine, shared]) => {
      setMyLessons(mine);
      setSharedLessons(shared);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  if (authLoading) return null;

  if (!user) {
    return (
      <p className="py-12 text-center text-[var(--color-text-secondary)]">
        {t("loginRequired")}
      </p>
    );
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t("confirmDelete"))) return;
    await deleteLesson(id);
    setMyLessons((l) => l.filter((le) => le.id !== id));
  };

  const lessons = tab === "mine" ? myLessons : sharedLessons;
  const emptyMessage = tab === "mine" ? t("noLessons") : t("noSharedLessons");

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <Link
          href="/creator/new"
          className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
        >
          + {t("newLesson")}
        </Link>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-1">
        <button
          onClick={() => setTab("mine")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            tab === "mine"
              ? "bg-[var(--color-accent)] text-white"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          {t("myLessons")}
        </button>
        <button
          onClick={() => setTab("shared")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            tab === "shared"
              ? "bg-[var(--color-accent)] text-white"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          {t("sharedWithMe")}
        </button>
      </div>

      {loading ? (
        <p className="py-8 text-center text-[var(--color-text-secondary)]">...</p>
      ) : lessons.length === 0 ? (
        <p className="py-12 text-center text-[var(--color-text-secondary)]">
          {emptyMessage}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4"
            >
              <h3 className="mb-1 font-semibold">{lesson.title || "Untitled"}</h3>
              <p className="mb-3 text-sm text-[var(--color-text-secondary)]">
                {lesson.description || "—"}
              </p>
              <div className="flex gap-2">
                {tab === "mine" ? (
                  <>
                    <Link
                      href={`/creator/${lesson.id}`}
                      className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs transition-colors hover:bg-[var(--color-bg-tertiary)]"
                    >
                      {t("editLesson")}
                    </Link>
                    <Link
                      href={`/creator/${lesson.id}/share`}
                      className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs transition-colors hover:bg-[var(--color-bg-tertiary)]"
                    >
                      {t("share")}
                    </Link>
                    <button
                      onClick={() => handleDelete(lesson.id)}
                      className="rounded-lg px-3 py-1.5 text-xs text-[var(--color-error)] hover:bg-[var(--color-error)]/10"
                    >
                      {t("delete")}
                    </button>
                  </>
                ) : (
                  <Link
                    href={`/play/${lesson.id}`}
                    className="rounded-lg bg-[var(--color-accent)] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
                  >
                    {t("play")}
                  </Link>
                )}
                {tab === "mine" && (
                  <Link
                    href={`/play/${lesson.id}`}
                    className="rounded-lg bg-[var(--color-accent)] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
                  >
                    {t("play")}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
