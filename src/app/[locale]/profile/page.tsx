"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/client";
import { lessons } from "@/content/lessons";
import type {
  LessonProgress,
  GameAttempt,
  TeacherLink,
  Profile,
} from "@/lib/supabase/types";

export default function ProfilePage() {
  const t = useTranslations();
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const supabase = createClient()!;

  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [attempts, setAttempts] = useState<GameAttempt[]>([]);
  const [outgoingLinks, setOutgoingLinks] = useState<
    (TeacherLink & { teacher: Profile })[]
  >([]);
  const [incomingLinks, setIncomingLinks] = useState<
    (TeacherLink & { student: Profile })[]
  >([]);
  const [teacherUsername, setTeacherUsername] = useState("");
  const [inviteMsg, setInviteMsg] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const [progressRes, attemptsRes, outRes, inRes] = await Promise.all([
        supabase
          .from("lesson_progress")
          .select("*")
          .eq("user_id", user.id),
        supabase
          .from("game_attempts")
          .select("*")
          .eq("user_id", user.id)
          .order("attempted_at", { ascending: false }),
        supabase
          .from("teacher_links")
          .select("*, teacher:teacher_id(id, username)")
          .eq("student_id", user.id),
        supabase
          .from("teacher_links")
          .select("*, student:student_id(id, username)")
          .eq("teacher_id", user.id),
      ]);

      if (progressRes.data) setProgress(progressRes.data);
      if (attemptsRes.data) setAttempts(attemptsRes.data);
      if (outRes.data) setOutgoingLinks(outRes.data as any);
      if (inRes.data) setIncomingLinks(inRes.data as any);
    };

    fetchData();
  }, [user, supabase]);

  const sendInvite = async () => {
    if (!user || !teacherUsername.trim()) return;

    const { data: teacherProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", teacherUsername.trim())
      .single();

    if (!teacherProfile) {
      setInviteMsg(t("profile.inviteError"));
      return;
    }

    await supabase.from("teacher_links").insert({
      student_id: user.id,
      teacher_id: teacherProfile.id,
    });

    setInviteMsg(t("profile.inviteSent"));
    setTeacherUsername("");
  };

  const handleInvite = async (linkId: string, accept: boolean) => {
    await supabase
      .from("teacher_links")
      .update({ status: accept ? "accepted" : "declined" })
      .eq("id", linkId);

    setIncomingLinks((links) =>
      links.map((l) =>
        l.id === linkId
          ? { ...l, status: accept ? "accepted" : "declined" }
          : l
      )
    );
  };

  const markLessonComplete = async (lessonId: string) => {
    if (!user) return;

    await supabase.from("lesson_progress").upsert({
      user_id: user.id,
      lesson_id: lessonId,
      completed: true,
      completed_at: new Date().toISOString(),
    });

    setProgress((prev) => {
      const existing = prev.find((p) => p.lesson_id === lessonId);
      if (existing) {
        return prev.map((p) =>
          p.lesson_id === lessonId
            ? { ...p, completed: true, completed_at: new Date().toISOString() }
            : p
        );
      }
      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          user_id: user.id,
          lesson_id: lessonId,
          completed: true,
          completed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        },
      ];
    });
  };

  if (loading || !user) return null;

  const getBestAttempt = (lessonId: string, gameId: string) => {
    const gameAttempts = attempts.filter(
      (a) => a.lesson_id === lessonId && a.game_id === gameId
    );
    if (gameAttempts.length === 0) return null;
    return {
      best: gameAttempts.reduce((max, a) =>
        a.score > max.score ? a : max
      ),
      totalAttempts: gameAttempts.length,
    };
  };

  return (
    <div className="max-w-3xl">
      <h1 className="mb-8 text-3xl font-bold">
        {t("profile.title")} — {profile?.username}
      </h1>

      {/* Progress */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold">{t("profile.progress")}</h2>
        <div className="space-y-3">
          {lessons.map((lesson) => {
            const prog = progress.find((p) => p.lesson_id === lesson.id);
            return (
              <div
                key={lesson.id}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{t(lesson.titleKey)}</h3>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      {prog?.completed ? (
                        <span className="text-[var(--color-success)]">
                          {t("common.completed")}
                        </span>
                      ) : (
                        t("common.notCompleted")
                      )}
                    </p>
                  </div>
                  {!prog?.completed && (
                    <button
                      onClick={() => markLessonComplete(lesson.id)}
                      className="rounded-md bg-[var(--color-bg-tertiary)] px-3 py-1 text-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
                    >
                      {t("common.markComplete")}
                    </button>
                  )}
                </div>

                {/* Game stats */}
                {lesson.games.map((gameId) => {
                  const stats = getBestAttempt(lesson.id, gameId);
                  if (!stats) return null;
                  return (
                    <div
                      key={gameId}
                      className="mt-3 flex gap-6 border-t border-[var(--color-border)] pt-3 text-sm"
                    >
                      <span>
                        {t("common.bestScore")}:{" "}
                        <span className="font-mono text-[var(--color-accent)]">
                          {stats.best.score}/{stats.best.max_score}
                        </span>
                      </span>
                      <span>
                        {t("common.attempts")}:{" "}
                        <span className="font-mono">{stats.totalAttempts}</span>
                      </span>
                      <span>
                        {t("common.accuracy")}:{" "}
                        <span className="font-mono">
                          {stats.best.accuracy.toFixed(0)}%
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </section>

      {/* Share with teacher */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold">
          {t("profile.addTeacher")}
        </h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={t("profile.teacherUsername")}
            value={teacherUsername}
            onChange={(e) => setTeacherUsername(e.target.value)}
            className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-4 py-2 text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
          />
          <button
            onClick={sendInvite}
            className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
          >
            {t("profile.sendInvite")}
          </button>
        </div>
        {inviteMsg && (
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            {inviteMsg}
          </p>
        )}

        {/* Outgoing invites */}
        {outgoingLinks.length > 0 && (
          <div className="mt-4">
            <h3 className="mb-2 text-sm font-medium text-[var(--color-text-secondary)]">
              {t("profile.teachers")}
            </h3>
            {outgoingLinks.map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between rounded-md bg-[var(--color-bg-tertiary)] p-3 text-sm"
              >
                <span>{link.teacher?.username}</span>
                <span className="text-[var(--color-text-secondary)]">
                  {link.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Incoming invites */}
      {incomingLinks.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold">
            {t("profile.students")}
          </h2>
          {incomingLinks.map((link) => (
            <div
              key={link.id}
              className="mb-2 flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4"
            >
              <span>{link.student?.username}</span>
              {link.status === "pending" ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleInvite(link.id, true)}
                    className="rounded-md bg-[var(--color-success)] px-3 py-1 text-sm text-white"
                  >
                    {t("profile.accept")}
                  </button>
                  <button
                    onClick={() => handleInvite(link.id, false)}
                    className="rounded-md bg-[var(--color-bg-tertiary)] px-3 py-1 text-sm"
                  >
                    {t("profile.decline")}
                  </button>
                </div>
              ) : (
                <span className="text-sm text-[var(--color-success)]">
                  {link.status}
                </span>
              )}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
