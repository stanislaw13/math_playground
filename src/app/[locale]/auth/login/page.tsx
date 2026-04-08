"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    if (!supabase) { setError(t("auth.loginError")); setLoading(false); return; }
    const { error } = await supabase.auth.signInWithPassword({
      email: `${username}@mathplayground.local`,
      password,
    });

    if (error) {
      setError(t("auth.loginError"));
      setLoading(false);
      return;
    }

    router.push("/");
  };

  return (
    <div className="mx-auto max-w-sm pt-16">
      <h1 className="mb-8 text-center text-2xl font-bold">
        {t("auth.loginTitle")}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-[var(--color-text-secondary)]">
            {t("common.username")}
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-4 py-2 text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-[var(--color-text-secondary)]">
            {t("common.password")}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-4 py-2 text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
            required
          />
        </div>
        {error && (
          <p className="text-sm text-[var(--color-error)]">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[var(--color-accent)] py-2 font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
        >
          {t("common.login")}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-[var(--color-text-secondary)]">
        {t("auth.noAccount")}{" "}
        <Link href="/auth/register" className="text-[var(--color-accent)]">
          {t("common.register")}
        </Link>
      </p>
    </div>
  );
}
