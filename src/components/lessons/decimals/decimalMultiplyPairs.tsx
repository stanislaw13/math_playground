import type { MatchPairItem } from "@/components/lessons/types";

// 30 par: działanie ↔ wynik (W6 – mnożenie ułamków dziesiętnych)
// Pierwsze 15: ułamek × liczba naturalna; kolejne 15: ułamek × ułamek
const ALL_PAIRS: { expr: string; result: string }[] = [
  // Ułamek dziesiętny × liczba naturalna
  { expr: "0,4 × 3",    result: "1,2"  },
  { expr: "1,2 × 5",    result: "6,0"  },
  { expr: "0,25 × 4",   result: "1,0"  },
  { expr: "3,6 × 2",    result: "7,2"  },
  { expr: "0,5 × 6",    result: "3,0"  },
  { expr: "1,5 × 4",    result: "6,0"  },
  { expr: "0,7 × 3",    result: "2,1"  },
  { expr: "2,5 × 4",    result: "10,0" },
  { expr: "0,125 × 8",  result: "1,0"  },
  { expr: "0,3 × 7",    result: "2,1"  },
  { expr: "4,5 × 2",    result: "9,0"  },
  { expr: "0,6 × 5",    result: "3,0"  },
  { expr: "1,25 × 4",   result: "5,0"  },
  { expr: "2,4 × 3",    result: "7,2"  },
  { expr: "0,8 × 5",    result: "4,0"  },
  // Ułamek dziesiętny × ułamek dziesiętny
  { expr: "0,3 × 0,7",  result: "0,21" },
  { expr: "1,2 × 0,5",  result: "0,6"  },
  { expr: "0,4 × 0,25", result: "0,1"  },
  { expr: "2,5 × 1,4",  result: "3,5"  },
  { expr: "0,8 × 0,8",  result: "0,64" },
  { expr: "1,5 × 2,4",  result: "3,6"  },
  { expr: "0,6 × 0,6",  result: "0,36" },
  { expr: "1,1 × 1,1",  result: "1,21" },
  { expr: "0,5 × 0,5",  result: "0,25" },
  { expr: "2,4 × 0,5",  result: "1,2"  },
  { expr: "0,9 × 0,9",  result: "0,81" },
  { expr: "1,2 × 1,2",  result: "1,44" },
  { expr: "0,7 × 0,4",  result: "0,28" },
  { expr: "3,0 × 0,3",  result: "0,9"  },
  { expr: "1,4 × 1,5",  result: "2,1"  },
];

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function generateMultiplyPairs(): MatchPairItem[] {
  return shuffle(ALL_PAIRS).slice(0, 6).map((p) => ({
    left: <span className="font-mono text-base">{p.expr}</span>,
    right: <span className="font-mono text-lg font-bold">{p.result}</span>,
  }));
}
