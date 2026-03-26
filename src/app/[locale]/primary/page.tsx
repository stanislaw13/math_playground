import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getLessonsByCategory } from "@/content/lessons";

export default function PrimaryPage() {
  const t = useTranslations();
  const lessons = getLessonsByCategory("primary");

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">{t("primary.title")}</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lessons.map((lesson) => (
          <Link
            key={lesson.id}
            href={lesson.path}
            className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6 transition-all hover:border-[var(--color-accent)]"
          >
            <h3 className="mb-2 font-semibold group-hover:text-[var(--color-accent)]">
              {t(lesson.titleKey)}
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {t(lesson.descriptionKey)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
