import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function HomePage() {
  const t = useTranslations();

  return (
    <div className="flex flex-col items-center pt-16">
      <h1 className="mb-4 text-5xl font-bold tracking-tight">
        <span className="text-[var(--color-accent)]">{t("home.title")}</span>
      </h1>
      <p className="mb-16 text-lg text-[var(--color-text-secondary)]">
        {t("home.subtitle")}
      </p>

      <h2 className="mb-8 text-xl font-semibold">{t("home.chooseCourse")}</h2>

      <div className="grid w-full max-w-2xl gap-6 sm:grid-cols-2">
        <Link
          href="/primary"
          className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-8 transition-all hover:border-[var(--color-accent)] hover:shadow-lg hover:shadow-[var(--color-accent)]/10"
        >
          <div className="mb-4 text-4xl">🔢</div>
          <h3 className="mb-2 text-lg font-semibold group-hover:text-[var(--color-accent)]">
            {t("nav.primary")}
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {t("home.primaryDesc")}
          </p>
        </Link>

        <Link
          href="/highschool"
          className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-8 transition-all hover:border-[var(--color-accent)] hover:shadow-lg hover:shadow-[var(--color-accent)]/10"
        >
          <div className="mb-4 text-4xl">📐</div>
          <h3 className="mb-2 text-lg font-semibold group-hover:text-[var(--color-accent)]">
            {t("nav.highschool")}
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {t("home.highschoolDesc")}
          </p>
        </Link>
      </div>
    </div>
  );
}
