"use client";

import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import LessonShell from "@/components/lessons/LessonShell";
import PlaceValueExplorer from "@/components/lessons/decimals/PlaceValueExplorer";
import { generateFractionDecimalPairs } from "@/components/lessons/decimals/decimalMatchPairs";
import type { LessonConfig } from "@/components/lessons/types";

const NumberLineExplorer = dynamic(
  () => import("@/components/lessons/decimals/NumberLineExplorer"),
  { ssr: false },
);
const AddSubtractExplorer = dynamic(
  () => import("@/components/lessons/decimals/AddSubtractExplorer"),
  { ssr: false },
);
const NumberLinePlacement = dynamic(
  () => import("@/components/lessons/decimals/NumberLinePlacement"),
  { ssr: false },
);
const ComparisonChallenge = dynamic(
  () => import("@/components/lessons/decimals/ComparisonChallenge"),
  { ssr: false },
);
const DecimalCalculator = dynamic(
  () => import("@/components/lessons/decimals/DecimalCalculator"),
  { ssr: false },
);
const MatchPairsGame = dynamic(
  () => import("@/components/lessons/games/MatchPairsGame"),
  { ssr: false },
);

export default function DecimalsPage() {
  const t = useTranslations("decimals");
  const tg = useTranslations("games");

  const config: LessonConfig = {
    id: "primary-decimals",
    sections: [], // Using children override
    formulas: [
      {
        label: t("placeValue"),
        latex: "0.1 = \\frac{1}{10} \\quad 0.01 = \\frac{1}{100}",
      },
      {
        label: t("notation"),
        latex: "3.45 = 3 + \\frac{4}{10} + \\frac{5}{100}",
      },
      {
        label: t("comparison"),
        latex: "0.3 = 0.30 > 0.25",
      },
      {
        label: t("addSub"),
        latex: "\\text{Align decimal points, then add/subtract}",
      },
    ],
  };

  return (
    <LessonShell config={config}>
      {[
        /* Section 1: Place Value Explorer */
        <div key="s1">
          <h2 className="mb-2 text-2xl font-bold">{t("title")}</h2>
          <p className="mb-6 text-[var(--color-text-secondary)]">{t("intro")}</p>
          <div className="mx-auto max-w-2xl">
            <PlaceValueExplorer />
          </div>
        </div>,

        /* Section 2: Number Line Explorer */
        <div key="s2">
          <h2 className="mb-2 text-2xl font-bold">{t("numberLineTitle")}</h2>
          <p className="mb-6 text-[var(--color-text-secondary)]">{t("numberLineIntro")}</p>
          <div className="mx-auto max-w-3xl">
            <NumberLineExplorer />
          </div>
        </div>,

        /* Section 3: Addition & Subtraction Explorer */
        <div key="s3">
          <h2 className="mb-2 text-2xl font-bold">{t("addSubTitle")}</h2>
          <p className="mb-6 text-[var(--color-text-secondary)]">{t("addSubIntro")}</p>
          <div className="mx-auto max-w-2xl">
            <AddSubtractExplorer />
          </div>
        </div>,

        /* Section 4: Number Line Placement game */
        <div key="s4" className="flex items-start justify-center">
          <div className="w-full max-w-3xl">
            <h2 className="mb-6 text-2xl font-bold">{t("placementTitle")}</h2>
            <NumberLinePlacement />
          </div>
        </div>,

        /* Section 5: Comparison Challenge game */
        <div key="s5" className="flex items-start justify-center">
          <div className="w-full max-w-3xl">
            <h2 className="mb-6 text-2xl font-bold">{t("comparisonTitle")}</h2>
            <ComparisonChallenge />
          </div>
        </div>,

        /* Section 6: Decimal Calculator game */
        <div key="s6" className="flex items-start justify-center">
          <div className="w-full max-w-3xl">
            <h2 className="mb-6 text-2xl font-bold">{t("calculatorTitle")}</h2>
            <DecimalCalculator />
          </div>
        </div>,

        /* Section 7: Fraction ↔ Decimal Match Pairs */
        <div key="s7" className="flex items-start justify-center">
          <div className="w-full max-w-3xl">
            <MatchPairsGame
              gameId="fraction-decimal-match"
              lessonId="primary-decimals"
              title={t("matchTitle")}
              description={t("matchDesc")}
              generatePairs={generateFractionDecimalPairs}
              gridCols={4}
            />
          </div>
        </div>,
      ]}
    </LessonShell>
  );
}
