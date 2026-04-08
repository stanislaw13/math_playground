import type { LessonDef } from "@/components/lessons/types";
import fractionsLesson from "@/lessons/fractions.lesson";

export interface LessonMeta {
  id: string;
  titleKey: string;
  descriptionKey: string;
  path: string;
  category: "primary" | "highschool";
  order: number;
  games: string[];
  /** Present for lessons created with the minimal-code single-file system. */
  def?: LessonDef;
}

/**
 * Register a single-file lesson. Produces a LessonMeta entry that works
 * with the existing listing page and catch-all route.
 */
export function registerLesson(def: LessonDef): LessonMeta {
  return {
    id: def.id,
    titleKey: "__inline__",
    descriptionKey: "__inline__",
    path: `/${def.category}/${def.slug}`,
    category: def.category,
    order: def.order,
    games: def.games,
    def,
  };
}

export const lessons: LessonMeta[] = [
  {
    id: "primary-areas",
    titleKey: "primary.areas.title",
    descriptionKey: "primary.areas.description",
    path: "/primary/areas",
    category: "primary",
    order: 1,
    games: ["areas-quiz", "shape-builder", "detective", "match-pairs"],
  },
  {
    id: "primary-decimals",
    titleKey: "primary.decimals.title",
    descriptionKey: "primary.decimals.description",
    path: "/primary/decimals",
    category: "primary",
    order: 2,
    games: [
      "number-line-placement",
      "comparison-challenge",
      "decimal-calculator",
      "fraction-decimal-match",
    ],
  },
  registerLesson(fractionsLesson),
];

export function getLessonsByCategory(category: "primary" | "highschool") {
  return lessons
    .filter((l) => l.category === category)
    .sort((a, b) => a.order - b.order);
}

export function getLessonById(id: string) {
  return lessons.find((l) => l.id === id);
}
