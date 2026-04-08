"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  shareLessonWithUser,
  removeShare,
  fetchShares,
} from "@/lib/customLessons/api";
import type { LessonShare } from "@/lib/customLessons/types";

interface ShareManagerProps {
  lessonId: string;
}

export default function ShareManager({ lessonId }: ShareManagerProps) {
  const t = useTranslations("creator");
  const [shares, setShares] = useState<(LessonShare & { username: string })[]>(
    [],
  );
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchShares(lessonId).then(setShares).catch(console.error);
  }, [lessonId]);

  const handleShare = async () => {
    if (!username.trim()) return;
    setLoading(true);
    setMessage("");
    try {
      await shareLessonWithUser(lessonId, username.trim());
      setMessage(t("shareSent"));
      setUsername("");
      const updated = await fetchShares(lessonId);
      setShares(updated);
    } catch {
      setMessage(t("shareError"));
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (shareId: string) => {
    try {
      await removeShare(shareId);
      setShares((s) => s.filter((sh) => sh.id !== shareId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{t("share")}</h3>

      {/* Add share */}
      <div className="flex gap-2">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleShare()}
          placeholder={t("shareWith")}
          className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
        />
        <button
          onClick={handleShare}
          disabled={loading || !username.trim()}
          className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
        >
          {t("share")}
        </button>
      </div>

      {message && (
        <p
          className={`text-sm ${
            message === t("shareSent")
              ? "text-[var(--color-success)]"
              : "text-[var(--color-error)]"
          }`}
        >
          {message}
        </p>
      )}

      {/* Current shares */}
      {shares.length > 0 && (
        <div className="space-y-2">
          {shares.map((share) => (
            <div
              key={share.id}
              className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-3 py-2"
            >
              <span className="text-sm">{share.username}</span>
              <button
                onClick={() => handleRemove(share.id)}
                className="text-xs text-[var(--color-error)] hover:underline"
              >
                {t("removeShare")}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
