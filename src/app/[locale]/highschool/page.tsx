import { useTranslations } from "next-intl";

export default function HighschoolPage() {
  const t = useTranslations();

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">{t("highschool.title")}</h1>
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-12 text-center">
        <p className="text-lg text-[var(--color-text-secondary)]">
          {t("highschool.comingSoon")}
        </p>
      </div>
    </div>
  );
}
