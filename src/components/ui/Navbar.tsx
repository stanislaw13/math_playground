"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth/context";
import { useLocale } from "next-intl";

export default function Navbar() {
  const t = useTranslations();
  const { user, profile, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();

  const switchLocale = () => {
    const newLocale = locale === "en" ? "pl" : "en";
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg-secondary)]/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold text-[var(--accent)]">
            {t("common.appName")}
          </Link>
          <div className="hidden items-center gap-4 sm:flex">
            <Link
              href="/primary"
              className={`text-sm transition-colors hover:text-[var(--accent)] ${
                pathname.startsWith("/primary")
                  ? "text-[var(--accent)]"
                  : "text-[var(--text-secondary)]"
              }`}
            >
              {t("nav.primary")}
            </Link>
            <Link
              href="/highschool"
              className={`text-sm transition-colors hover:text-[var(--accent)] ${
                pathname.startsWith("/highschool")
                  ? "text-[var(--accent)]"
                  : "text-[var(--text-secondary)]"
              }`}
            >
              {t("nav.highschool")}
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={switchLocale}
            className="rounded-md px-2 py-1 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
          >
            {locale === "en" ? "PL" : "EN"}
          </button>
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--accent)]"
              >
                {profile?.username ?? t("nav.profile")}
              </Link>
              <button
                onClick={signOut}
                className="rounded-md px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-tertiary)]"
              >
                {t("common.logout")}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="rounded-md px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-tertiary)]"
              >
                {t("common.login")}
              </Link>
              <Link
                href="/auth/register"
                className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[var(--accent-hover)]"
              >
                {t("common.register")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
