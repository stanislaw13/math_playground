import type { MatchPairItem } from "@/components/lessons/types";

// 30 par: działanie ↔ wynik (W7 – dzielenie ułamków dziesiętnych)
// Pierwsze 15: ułamek ÷ liczba naturalna; kolejne 15: ułamek ÷ ułamek
// Podchwytliwe: 1,2 ÷ 0,04 = 30 (nie 3!), 0,36 ÷ 4 = 0,09 (nie 0,9!)
const ALL_PAIRS: { expr: string; result: string }[] = [
  // Ułamek dziesiętny ÷ liczba naturalna
  { expr: "0,6 ÷ 3",    result: "0,2"  },
  { expr: "4,5 ÷ 5",    result: "0,9"  },
  { expr: "1,8 ÷ 4",    result: "0,45" },
  { expr: "7,2 ÷ 8",    result: "0,9"  },
  { expr: "0,75 ÷ 5",   result: "0,15" },
  { expr: "3,6 ÷ 12",   result: "0,3"  },
  { expr: "4,8 ÷ 6",    result: "0,8"  },
  { expr: "2,5 ÷ 5",    result: "0,5"  },
  { expr: "0,36 ÷ 4",   result: "0,09" }, // pułapka: nie 0,9
  { expr: "6,4 ÷ 8",    result: "0,8"  },
  { expr: "1,2 ÷ 3",    result: "0,4"  },
  { expr: "5,4 ÷ 6",    result: "0,9"  },
  { expr: "0,24 ÷ 4",   result: "0,06" },
  { expr: "8,1 ÷ 9",    result: "0,9"  },
  { expr: "3,5 ÷ 7",    result: "0,5"  },
  // Ułamek dziesiętny ÷ ułamek dziesiętny
  { expr: "0,6 ÷ 0,2",  result: "3"    },
  { expr: "1,5 ÷ 0,5",  result: "3"    },
  { expr: "2,4 ÷ 0,8",  result: "3"    },
  { expr: "0,36 ÷ 0,4", result: "0,9"  },
  { expr: "1,2 ÷ 0,04", result: "30"   }, // pułapka: nie 3!
  { expr: "4,5 ÷ 1,5",  result: "3"    },
  { expr: "0,8 ÷ 0,4",  result: "2"    },
  { expr: "2,1 ÷ 0,7",  result: "3"    },
  { expr: "0,5 ÷ 0,25", result: "2"    },
  { expr: "0,9 ÷ 0,3",  result: "3"    },
  { expr: "1,8 ÷ 0,6",  result: "3"    },
  { expr: "0,7 ÷ 0,07", result: "10"   },
  { expr: "1,6 ÷ 0,8",  result: "2"    },
  { expr: "3,6 ÷ 0,9",  result: "4"    },
  { expr: "0,45 ÷ 0,09", result: "5"   },
];

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function generateDividePairs(): MatchPairItem[] {
  return shuffle(ALL_PAIRS).slice(0, 6).map((p) => ({
    left: <span className="font-mono text-base">{p.expr}</span>,
    right: <span className="font-mono text-lg font-bold">{p.result}</span>,
  }));
}
