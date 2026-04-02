export interface LessonMeta {
  id: string;
  titleKey: string;
  descriptionKey: string;
  path: string;
  category: "primary" | "highschool";
  order: number;
  games: string[];
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
];

export function getLessonsByCategory(category: "primary" | "highschool") {
  return lessons
    .filter((l) => l.category === category)
    .sort((a, b) => a.order - b.order);
}

export function getLessonById(id: string) {
  return lessons.find((l) => l.id === id);
}
