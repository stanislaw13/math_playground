"use client";

/**
 * Pair generators for the areas lesson match-pairs games.
 * These are thin config layers on top of the reusable MatchPairsGame.
 */

import type { MatchPairItem } from "../types";

// ---------------------------------------------------------------------------
// Shape SVGs for match-pairs cards (reuse inline for simplicity)
// ---------------------------------------------------------------------------

type ShapeKind = "square" | "rectangle" | "triangle" | "diamond" | "trapezoid";

interface ShapeDims {
  kind: ShapeKind;
  a?: number;
  b?: number;
  h?: number;
  d1?: number;
  d2?: number;
}

function ShapeCardGraphic({ dims }: { dims: ShapeDims }) {
  const colors: Record<ShapeKind, string> = {
    square: "#6366f1",
    rectangle: "#6366f1",
    triangle: "#22c55e",
    diamond: "#f97316",
    trapezoid: "#8b5cf6",
  };
  const stroke = colors[dims.kind];
  const labelFill = "var(--color-text-secondary)";

  switch (dims.kind) {
    case "square":
      return (
        <svg viewBox="0 0 80 68" className="h-auto w-full max-w-[80px]">
          <rect x="15" y="5" width="50" height="50" fill="none" stroke={stroke} strokeWidth="2" />
          <text x="40" y="64" textAnchor="middle" fontSize="10" fill={labelFill}>a={dims.a}</text>
          <text x="8" y="33" textAnchor="middle" fontSize="10" fill={labelFill}>a</text>
        </svg>
      );
    case "rectangle":
      return (
        <svg viewBox="0 0 90 68" className="h-auto w-full max-w-[90px]">
          <rect x="8" y="10" width="74" height="42" fill="none" stroke={stroke} strokeWidth="2" />
          <text x="45" y="64" textAnchor="middle" fontSize="10" fill={labelFill}>a={dims.a}</text>
          <text x="4" y="33" textAnchor="middle" fontSize="10" fill={labelFill}>b={dims.b}</text>
        </svg>
      );
    case "triangle":
      return (
        <svg viewBox="0 0 90 78" className="h-auto w-full max-w-[90px]">
          <polygon points="45,8 10,68 80,68" fill="none" stroke={stroke} strokeWidth="2" />
          <line x1="45" y1="8" x2="45" y2="68" stroke="#a1a1aa" strokeWidth="1" strokeDasharray="4" />
          <text x="45" y="76" textAnchor="middle" fontSize="10" fill={labelFill}>a={dims.a}</text>
          <text x="52" y="42" textAnchor="start" fontSize="10" fill={labelFill}>h={dims.h}</text>
        </svg>
      );
    case "diamond":
      return (
        <svg viewBox="0 0 80 88" className="h-auto w-full max-w-[80px]">
          <polygon points="40,5 75,44 40,83 5,44" fill="none" stroke={stroke} strokeWidth="2" />
          <line x1="5" y1="44" x2="75" y2="44" stroke="#a1a1aa" strokeWidth="1" strokeDasharray="4" />
          <line x1="40" y1="5" x2="40" y2="83" stroke="#a1a1aa" strokeWidth="1" strokeDasharray="4" />
          <text x="40" y="58" textAnchor="middle" fontSize="10" fill={labelFill}>d₁={dims.d1}</text>
          <text x="53" y="27" textAnchor="start" fontSize="10" fill={labelFill}>d₂={dims.d2}</text>
        </svg>
      );
    case "trapezoid":
      return (
        <svg viewBox="0 0 90 78" className="h-auto w-full max-w-[90px]">
          <polygon points="8,65 82,65 64,12 26,12" fill="none" stroke={stroke} strokeWidth="2" />
          <line x1="45" y1="12" x2="45" y2="65" stroke="#a1a1aa" strokeWidth="1" strokeDasharray="4" />
          <text x="45" y="75" textAnchor="middle" fontSize="10" fill={labelFill}>a={dims.a}</text>
          <text x="45" y="9" textAnchor="middle" fontSize="10" fill={labelFill}>b={dims.b}</text>
          <text x="52" y="42" textAnchor="start" fontSize="10" fill={labelFill}>h={dims.h}</text>
        </svg>
      );
  }
}

// ---------------------------------------------------------------------------
// Shape → Area match pairs
// ---------------------------------------------------------------------------

export function generateShapeAreaPairs(areaSymbol: string): MatchPairItem[] {
  const shapes: { dims: ShapeDims; area: number }[] = [];
  const usedAreas = new Set<number>();

  function add(gen: () => { dims: ShapeDims; area: number }) {
    for (let attempt = 0; attempt < 100; attempt++) {
      const r = gen();
      if (!usedAreas.has(r.area)) {
        usedAreas.add(r.area);
        shapes.push(r);
        return;
      }
    }
    const r = gen();
    shapes.push(r);
  }

  add(() => { const a = Math.floor(Math.random() * 8) + 2; return { dims: { kind: "square", a }, area: a * a }; });
  add(() => { const a = Math.floor(Math.random() * 7) + 2; const b = Math.floor(Math.random() * 7) + 2; return { dims: { kind: "rectangle", a, b }, area: a * b }; });
  add(() => { const a = Math.floor(Math.random() * 8) + 2; const h = Math.floor(Math.random() * 8) + 2; return { dims: { kind: "triangle", a, h }, area: (a * h) / 2 }; });
  add(() => { const d1 = Math.floor(Math.random() * 8) + 2; const d2 = Math.floor(Math.random() * 8) + 2; return { dims: { kind: "diamond", d1, d2 }, area: (d1 * d2) / 2 }; });
  add(() => { const a = Math.floor(Math.random() * 5) + 3; const b = Math.floor(Math.random() * 4) + 1; const h = Math.floor(Math.random() * 5) + 2; return { dims: { kind: "trapezoid", a, b, h }, area: ((a + b) * h) / 2 }; });
  add(() => { const a = Math.floor(Math.random() * 6) + 3; return { dims: { kind: "square", a }, area: a * a }; });
  add(() => { const a = Math.floor(Math.random() * 8) + 2; const b = Math.floor(Math.random() * 6) + 2; return { dims: { kind: "rectangle", a, b }, area: a * b }; });
  add(() => { const a = Math.floor(Math.random() * 6) + 3; const b = Math.floor(Math.random() * 3) + 1; const h = Math.floor(Math.random() * 6) + 2; return { dims: { kind: "trapezoid", a, b, h }, area: ((a + b) * h) / 2 }; });

  return shapes.map((s) => ({
    left: <ShapeCardGraphic dims={s.dims} />,
    right: <span>{areaSymbol} = {s.area}</span>,
  }));
}

// ---------------------------------------------------------------------------
// Unit conversion match pairs
// ---------------------------------------------------------------------------

const UNIT_CONVERSIONS = [
  { left: "1 km²", right: "1 000 000 m²" },
  { left: "1 m²", right: "100 dm²" },
  { left: "1 m²", right: "10 000 cm²" },
  { left: "1 dm²", right: "100 cm²" },
  { left: "1 cm²", right: "100 mm²" },
  { left: "1 km²", right: "10⁸ dm²" },
  { left: "1 m²", right: "1 000 000 mm²" },
  { left: "1 dm²", right: "10 000 mm²" },
  { left: "500 dm²", right: "5 m²" },
  { left: "0.01 m²", right: "1 dm²" },
  { left: "0.5 m²", right: "50 dm²" },
  { left: "2 km²", right: "2 000 000 m²" },
  { left: "300 cm²", right: "3 dm²" },
  { left: "25 dm²", right: "2 500 cm²" },
  { left: "10 m²", right: "1 000 dm²" },
  { left: "0.1 km²", right: "100 000 m²" },
  { left: "50 cm²", right: "5 000 mm²" },
  { left: "0.001 m²", right: "10 cm²" },
  { left: "750 mm²", right: "7.5 cm²" },
  { left: "4 dm²", right: "0.04 m²" },
  { left: "3 m²", right: "30 000 cm²" },
  { left: "200 cm²", right: "20 000 mm²" },
  { left: "0.5 km²", right: "500 000 m²" },
  { left: "15 dm²", right: "0.15 m²" },
  { left: "0.02 m²", right: "200 cm²" },
];

export function generateUnitConversionPairs(): MatchPairItem[] {
  // Shuffle and pick 8
  const shuffled = [...UNIT_CONVERSIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 8).map((c) => ({
    left: <span className="font-mono text-sm">{c.left}</span>,
    right: <span className="font-mono text-sm">{c.right}</span>,
  }));
}
