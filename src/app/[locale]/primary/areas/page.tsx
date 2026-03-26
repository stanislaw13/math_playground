"use client";

import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import FormulaSidebar from "@/components/ui/FormulaSidebar";
import {
  SquareSVG,
  RectangleSVG,
  TriangleSVG,
  DiamondSVG,
  TrapezoidSVG,
} from "@/components/lessons/areas/ShapeSVGs";

const ShapeExplorer = dynamic(
  () => import("@/components/lessons/areas/ShapeExplorer"),
  { ssr: false }
);

const AreasQuiz = dynamic(
  () => import("@/components/lessons/areas/AreasQuiz"),
  { ssr: false }
);

const ShapeBuilder = dynamic(
  () => import("@/components/lessons/areas/ShapeBuilder"),
  { ssr: false }
);

const Detective = dynamic(
  () => import("@/components/lessons/areas/Detective"),
  { ssr: false }
);

const MatchPairs = dynamic(
  () => import("@/components/lessons/areas/MatchPairs"),
  { ssr: false }
);

export default function AreasPage() {
  const t = useTranslations("areas");
  const tg = useTranslations("games");
  const aS = t("areaSymbol");
  const pS = t("perimeterSymbol");

  const formulas = [
    {
      label: t("square"),
      latex: `${aS} = a^2 \\quad ${pS} = 4a`,
      svg: <SquareSVG />,
    },
    {
      label: t("rectangle"),
      latex: `${aS} = a \\cdot b \\quad ${pS} = 2(a+b)`,
      svg: <RectangleSVG />,
    },
    {
      label: t("triangle"),
      latex: `${aS} = \\frac{a \\cdot h}{2}`,
      svg: <TriangleSVG />,
    },
    {
      label: t("diamond"),
      latex: `${aS} = \\frac{d_1 \\cdot d_2}{2}`,
      svg: <DiamondSVG />,
    },
    {
      label: t("trapezoid"),
      latex: `${aS} = \\frac{(a + b) \\cdot h}{2}`,
      svg: <TrapezoidSVG />,
    },
  ];

  return (
    <div>
      <FormulaSidebar formulas={formulas} />
      <h1 className="mb-2 text-3xl font-bold">{t("title")}</h1>

      {/* Interactive explorer */}
      <ShapeExplorer />

      {/* Games section */}
      <div className="mt-16 space-y-12">
        <div>
          <h2 className="mb-6 text-2xl font-bold">{t("quizTitle")}</h2>
          <AreasQuiz />
        </div>

        <div>
          <h2 className="mb-6 text-2xl font-bold">{tg("shapeBuilder")}</h2>
          <ShapeBuilder />
        </div>

        <div>
          <h2 className="mb-6 text-2xl font-bold">{tg("detective")}</h2>
          <Detective />
        </div>

        <div>
          <h2 className="mb-6 text-2xl font-bold">{tg("matchPairs")}</h2>
          <MatchPairs />
        </div>
      </div>
    </div>
  );
}
