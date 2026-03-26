"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const t = useTranslations();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (username.length < 3) {
      setError(t("auth.usernameMin"));
      return;
    }
    if (password.length < 6) {
      setError(t("auth.passwordMin"));
      return;
    }

    setLoading(true);
    const supabase = createClient();
    if (!supabase) { setError(t("auth.registerError")); setLoading(false); return; }

    const { error } = await supabase.auth.signUp({
      email: `${username}@mathplayground.local`,
      password,
      options: {
        data: { username },
      },
    });

    if (error) {
      setError(t("auth.registerError"));
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-sm pt-16">
      <h1 className="mb-8 text-center text-2xl font-bold">
        {t("auth.registerTitle")}
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
          {t("common.register")}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-[var(--color-text-secondary)]">
        {t("auth.hasAccount")}{" "}
        <Link href="/auth/login" className="text-[var(--color-accent)]">
          {t("common.login")}
        </Link>
      </p>
    </div>
  );
}
