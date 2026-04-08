"use client";

import { type ReactNode } from "react";
import katex from "katex";
import MatchPairsGame from "@/components/lessons/games/MatchPairsGame";
import StaticComparisonGame from "@/components/lessons/games/StaticComparisonGame";
import LatexSection from "@/components/lessons/LatexSection";
import type {
  ContentElement,
  CustomSection,
  CustomMatchPairsConfig,
  CustomComparisonConfig,
  CustomLatexConfig,
} from "@/lib/customLessons/types";
import type { MatchPairItem } from "@/components/lessons/types";

// ---------------------------------------------------------------------------
// ContentElement → ReactNode
// ---------------------------------------------------------------------------

function RenderContent({ element }: { element: ContentElement }) {
  switch (element.type) {
    case "text":
      return <span>{element.value}</span>;
    case "latex": {
      const html = katex.renderToString(element.value, {
        throwOnError: false,
      });
      return (
        <span
          dangerouslySetInnerHTML={{ __html: html }}
          className="leading-none"
        />
      );
    }
    case "image":
      return (
        <img
          src={element.value}
          alt=""
          className="max-h-24 object-contain"
        />
      );
  }
}

// ---------------------------------------------------------------------------
// Section renderers
// ---------------------------------------------------------------------------

function renderMatchPairs(
  section: CustomSection,
  lessonId: string,
): ReactNode {
  const config = section.config as CustomMatchPairsConfig;
  const generatePairs = (): MatchPairItem[] =>
    config.pairs.map((p) => ({
      left: <RenderContent element={p.left} />,
      right: <RenderContent element={p.right} />,
    }));

  return (
    <div key={section.id} className="flex items-start justify-center">
      <div className="w-full max-w-3xl">
        <MatchPairsGame
          gameId={`custom-mp-${section.id}`}
          lessonId={lessonId}
          title={section.title || "Match Pairs"}
          description=""
          generatePairs={generatePairs}
          gridCols={config.gridCols}
        />
      </div>
    </div>
  );
}

function renderComparison(
  section: CustomSection,
  lessonId: string,
): ReactNode {
  const config = section.config as CustomComparisonConfig;
  const pairs = config.pairs.map((p) => ({
    left: <RenderContent element={p.left} /> as ReactNode,
    right: <RenderContent element={p.right} /> as ReactNode,
    correct: p.correct,
  }));

  return (
    <div key={section.id} className="flex items-start justify-center">
      <div className="w-full max-w-2xl">
        <StaticComparisonGame
          gameId={`custom-cmp-${section.id}`}
          lessonId={lessonId}
          title={section.title || "Comparison"}
          description=""
          prompt={config.prompt}
          pairs={pairs}
          showEqualButton={config.showEqualButton}
        />
      </div>
    </div>
  );
}

function renderLatex(section: CustomSection): ReactNode {
  const config = section.config as CustomLatexConfig;
  return (
    <div key={section.id}>
      <LatexSection
        title={section.title}
        content={config.content}
        displayMode={config.displayMode}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function renderCustomSections(
  sections: CustomSection[],
  lessonId: string,
): ReactNode[] {
  return sections.map((section) => {
    switch (section.type) {
      case "match_pairs":
        return renderMatchPairs(section, lessonId);
      case "comparison":
        return renderComparison(section, lessonId);
      case "latex":
        return renderLatex(section);
    }
  });
}
