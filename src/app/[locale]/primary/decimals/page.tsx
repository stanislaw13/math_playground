"use client";

import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import LessonShell from "@/components/lessons/LessonShell";
import PlaceValueExplorer from "@/components/lessons/decimals/PlaceValueExplorer";
import { generateFractionDecimalPairs } from "@/components/lessons/decimals/decimalMatchPairs";
import { generateNotationPairs } from "@/components/lessons/decimals/decimalNotationPairs";
import { generateMultiplyPairs } from "@/components/lessons/decimals/decimalMultiplyPairs";
import { generateDividePairs } from "@/components/lessons/decimals/decimalDividePairs";
import { generateRoundingPairs } from "@/components/lessons/decimals/decimalRoundingPairs";
import { generateUnitsPairs } from "@/components/lessons/decimals/decimalUnitsPairs";
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
    sections: [],
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
        /* ── W1a: Eksplorator wartości pozycyjnej ─────────────────────── */
        <div key="s1">
          <h2 className="mb-2 text-2xl font-bold">{t("title")}</h2>
          <p className="mb-6 text-[var(--color-text-secondary)]">{t("intro")}</p>
          <div className="mx-auto max-w-2xl">
            <PlaceValueExplorer />
          </div>
        </div>,

        /* ── W1b: Gra – odczytaj i zapisz liczbę ─────────────────────── */
        <div key="s2" className="flex items-start justify-center">
          <div className="w-full max-w-3xl">
            <MatchPairsGame
              gameId="notation-match"
              lessonId="primary-decimals"
              title={t("notationTitle")}
              description={t("notationDesc")}
              generatePairs={generateNotationPairs}
              gridCols={4}
            />
          </div>
        </div>,

        /* ── W2a: Eksplorator osi liczbowej ──────────────────────────── */
        <div key="s3">
          <h2 className="mb-2 text-2xl font-bold">{t("numberLineTitle")}</h2>
          <p className="mb-6 text-[var(--color-text-secondary)]">{t("numberLineIntro")}</p>
          <div className="mx-auto max-w-3xl">
            <NumberLineExplorer />
          </div>
        </div>,

        /* ── W2b: Gra – umieść na osi ────────────────────────────────── */
        <div key="s4" className="flex items-start justify-center">
          <div className="w-full max-w-3xl">
            <h2 className="mb-6 text-2xl font-bold">{t("placementTitle")}</h2>
            <NumberLinePlacement />
          </div>
        </div>,

        /* ── W3: Gra – porównywanie ──────────────────────────────────── */
        <div key="s5" className="flex items-start justify-center">
          <div className="w-full max-w-3xl">
            <h2 className="mb-6 text-2xl font-bold">{t("comparisonTitle")}</h2>
            <ComparisonChallenge />
          </div>
        </div>,

        /* ── W4: Gra – ułamek ↔ dziesiętny ──────────────────────────── */
        <div key="s6" className="flex items-start justify-center">
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

        /* ── W5a: Eksplorator dodawania i odejmowania ────────────────── */
        <div key="s7">
          <h2 className="mb-2 text-2xl font-bold">{t("addSubTitle")}</h2>
          <p className="mb-6 text-[var(--color-text-secondary)]">{t("addSubIntro")}</p>
          <div className="mx-auto max-w-2xl">
            <AddSubtractExplorer />
          </div>
        </div>,

        /* ── W5b: Gra – kalkulator dziesiętny ───────────────────────── */
        <div key="s8" className="flex items-start justify-center">
          <div className="w-full max-w-3xl">
            <h2 className="mb-6 text-2xl font-bold">{t("calculatorTitle")}</h2>
            <DecimalCalculator />
          </div>
        </div>,

        /* ── W6: Gra – mnożenie ──────────────────────────────────────── */
        <div key="s9" className="flex items-start justify-center">
          <div className="w-full max-w-3xl">
            <MatchPairsGame
              gameId="multiply-match"
              lessonId="primary-decimals"
              title={t("multiplyTitle")}
              description={t("multiplyDesc")}
              generatePairs={generateMultiplyPairs}
              gridCols={4}
            />
          </div>
        </div>,

        /* ── W7: Gra – dzielenie ─────────────────────────────────────── */
        <div key="s10" className="flex items-start justify-center">
          <div className="w-full max-w-3xl">
            <MatchPairsGame
              gameId="divide-match"
              lessonId="primary-decimals"
              title={t("divideTitle")}
              description={t("divideDesc")}
              generatePairs={generateDividePairs}
              gridCols={4}
            />
          </div>
        </div>,

        /* ── W8: Gra – zaokrąglanie ──────────────────────────────────── */
        <div key="s11" className="flex items-start justify-center">
          <div className="w-full max-w-3xl">
            <MatchPairsGame
              gameId="rounding-match"
              lessonId="primary-decimals"
              title={t("roundingTitle")}
              description={t("roundingDesc")}
              generatePairs={generateRoundingPairs}
              gridCols={4}
            />
          </div>
        </div>,

        /* ── W10: Gra – wyrażenia dwumianowane ───────────────────────── */
        <div key="s12" className="flex items-start justify-center">
          <div className="w-full max-w-3xl">
            <MatchPairsGame
              gameId="units-match"
              lessonId="primary-decimals"
              title={t("unitsTitle")}
              description={t("unitsDesc")}
              generatePairs={generateUnitsPairs}
              gridCols={4}
            />
          </div>
        </div>,
      ]}
    </LessonShell>
  );
}
