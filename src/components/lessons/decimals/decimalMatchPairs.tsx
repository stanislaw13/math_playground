import type { MatchPairItem } from "@/components/lessons/types";
import katex from "katex";

function K({ latex }: { latex: string }) {
  const html = katex.renderToString(latex, { throwOnError: false });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

/** All candidate pairs — we pick 6 at random each game. */
const ALL_PAIRS: { frac: string; decimal: string }[] = [
  { frac: "\\frac{1}{2}", decimal: "0.5" },
  { frac: "\\frac{1}{4}", decimal: "0.25" },
  { frac: "\\frac{3}{4}", decimal: "0.75" },
  { frac: "\\frac{1}{5}", decimal: "0.2" },
  { frac: "\\frac{2}{5}", decimal: "0.4" },
  { frac: "\\frac{3}{5}", decimal: "0.6" },
  { frac: "\\frac{4}{5}", decimal: "0.8" },
  { frac: "\\frac{1}{10}", decimal: "0.1" },
  { frac: "\\frac{3}{10}", decimal: "0.3" },
  { frac: "\\frac{7}{10}", decimal: "0.7" },
  { frac: "\\frac{9}{10}", decimal: "0.9" },
  { frac: "\\frac{1}{8}", decimal: "0.125" },
  { frac: "\\frac{3}{8}", decimal: "0.375" },
  { frac: "\\frac{5}{8}", decimal: "0.625" },
  { frac: "\\frac{1}{20}", decimal: "0.05" },
  { frac: "\\frac{1}{25}", decimal: "0.04" },
  { frac: "\\frac{3}{20}", decimal: "0.15" },
  { frac: "\\frac{7}{20}", decimal: "0.35" },
];

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function generateFractionDecimalPairs(): MatchPairItem[] {
  const selected = shuffle(ALL_PAIRS).slice(0, 8);
  return selected.map((p) => ({
    left: <K latex={p.frac} />,
    right: <span className="font-mono text-lg">{p.decimal}</span>,
  }));
}
