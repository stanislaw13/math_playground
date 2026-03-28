"use client";

import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import LessonShell from "@/components/lessons/LessonShell";
import {
  SquareSVG,
  RectangleSVG,
  TriangleSVG,
  DiamondSVG,
  TrapezoidSVG,
} from "@/components/lessons/areas/ShapeSVGs";
import {
  SquareExplorer,
  RectangleExplorer,
  TriangleExplorer,
  DiamondExplorer,
  TrapezoidExplorer,
} from "@/components/lessons/areas/ShapeExplorer";
import {
  generateShapeAreaPairs,
  generateUnitConversionPairs,
} from "@/components/lessons/areas/areaMatchPairs";
import type { LessonConfig } from "@/components/lessons/types";

const ShapeBuilder = dynamic(
  () => import("@/components/lessons/areas/ShapeBuilder"),
  { ssr: false },
);
const Detective = dynamic(
  () => import("@/components/lessons/areas/Detective"),
  { ssr: false },
);
const MatchPairsGame = dynamic(
  () => import("@/components/lessons/games/MatchPairsGame"),
  { ssr: false },
);

export default function AreasPage() {
  const t = useTranslations("areas");
  const tg = useTranslations("games");
  const aS = t("areaSymbol");
  const pS = t("perimeterSymbol");

  const config: LessonConfig = {
    id: "primary-areas",
    sections: [], // We use children instead
    formulas: [
      { label: t("square"), latex: `${aS} = a^2 \\quad ${pS} = 4a`, svg: <SquareSVG /> },
      { label: t("rectangle"), latex: `${aS} = a \\cdot b \\quad ${pS} = 2(a+b)`, svg: <RectangleSVG /> },
      { label: t("triangle"), latex: `${aS} = \\frac{a \\cdot h}{2}`, svg: <TriangleSVG /> },
      { label: t("diamond"), latex: `${aS} = \\frac{d_1 \\cdot d_2}{2}`, svg: <DiamondSVG /> },
      { label: t("trapezoid"), latex: `${aS} = \\frac{(a + b) \\cdot h}{2}`, svg: <TrapezoidSVG /> },
    ],
  };

  return (
    <LessonShell config={config}>
      {[
        /* Section 1: Square + Rectangle */
        <div key="s1">
          <h2 className="mb-2 text-2xl font-bold">{t("title")}</h2>
          <p className="mb-6 text-[var(--color-text-secondary)]">{t("intro")}</p>
          <div className="grid gap-6 md:grid-cols-2">
            <SquareExplorer />
            <RectangleExplorer />
          </div>
        </div>,

        /* Section 2: Triangle + Diamond */
        <div key="s2">
          <h2 className="mb-4 text-2xl font-bold">{t("interactive")}</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <TriangleExplorer />
            <DiamondExplorer />
          </div>
        </div>,

        /* Section 3: Trapezoid */
        <div key="s3">
          <h2 className="mb-4 text-2xl font-bold">{t("interactive")}</h2>
          <div className="mx-auto max-w-2xl">
            <TrapezoidExplorer />
          </div>
        </div>,

        /* Section 4: Shape Builder game */
        <div key="s4" className="flex items-start justify-center">
          <div className="w-full max-w-3xl">
            <h2 className="mb-6 text-2xl font-bold">{tg("shapeBuilder")}</h2>
            <ShapeBuilder />
          </div>
        </div>,

        /* Section 5: Detective game */
        <div key="s5" className="flex items-start justify-center">
          <div className="w-full max-w-3xl">
            <h2 className="mb-6 text-2xl font-bold">{tg("detective")}</h2>
            <Detective />
          </div>
        </div>,

        /* Section 6: Match Pairs — shapes to areas */
        <div key="s6" className="flex items-start justify-center">
          <div className="w-full max-w-3xl">
            <MatchPairsGame
              gameId="match-pairs"
              lessonId="primary-areas"
              title={tg("matchPairs")}
              description={tg("matchPairsDesc")}
              generatePairs={() => generateShapeAreaPairs(aS)}
              gridCols={4}
            />
          </div>
        </div>,

        /* Section 7: Match Pairs — unit conversions */
        <div key="s7" className="flex items-start justify-center">
          <div className="w-full max-w-3xl">
            <MatchPairsGame
              gameId="match-pairs-units"
              lessonId="primary-areas"
              title={tg("matchPairsUnits")}
              description={tg("matchPairsUnitsDesc")}
              generatePairs={generateUnitConversionPairs}
              gridCols={4}
            />
          </div>
        </div>,
      ]}
    </LessonShell>
  );
}
