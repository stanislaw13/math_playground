import type { MatchPairItem } from "@/components/lessons/types";

// 30 par: „liczba → dokładność" ↔ zaokrąglony wynik (W8)
// Szczególna uwaga na przeniesienia (np. 3,97 → 4,0; 9,96 → 10,0)
const ALL_PAIRS: { expr: string; result: string }[] = [
  // Do jedności
  { expr: "3,7 → jedności",    result: "4"   },
  { expr: "12,4 → jedności",   result: "12"  },
  { expr: "0,51 → jedności",   result: "1"   }, // pułapka: ≥ 0,5 → w górę
  { expr: "7,499 → jedności",  result: "7"   }, // pułapka: cyfra dziesiątek < 5
  { expr: "9,501 → jedności",  result: "10"  }, // przeniesienie
  { expr: "2,5 → jedności",    result: "3"   },
  { expr: "14,49 → jedności",  result: "14"  },
  { expr: "0,4 → jedności",    result: "0"   }, // pułapka: < 0,5 → 0, nie 1
  { expr: "99,5 → jedności",   result: "100" }, // duże przeniesienie
  { expr: "5,0 → jedności",    result: "5"   },
  // Do dziesiątych
  { expr: "1,64 → dziesiąte",  result: "1,6" },
  { expr: "0,38 → dziesiąte",  result: "0,4" }, // 8 ≥ 5 → w górę
  { expr: "5,05 → dziesiąte",  result: "5,1" }, // 5 ≥ 5 → w górę
  { expr: "12,153 → dziesiąte", result: "12,2" }, // 5 ≥ 5 → w górę
  { expr: "3,97 → dziesiąte",  result: "4,0" }, // przeniesienie do jedności!
  { expr: "0,95 → dziesiąte",  result: "1,0" }, // przeniesienie
  { expr: "2,44 → dziesiąte",  result: "2,4" },
  { expr: "7,75 → dziesiąte",  result: "7,8" },
  { expr: "9,96 → dziesiąte",  result: "10,0" }, // podwójne przeniesienie!
  { expr: "0,05 → dziesiąte",  result: "0,1" },
  // Do setnych
  { expr: "0,376 → setne",     result: "0,38" }, // 6 ≥ 5 → w górę
  { expr: "4,125 → setne",     result: "4,13" }, // 5 ≥ 5 → w górę
  { expr: "2,999 → setne",     result: "3,00" }, // przeniesienie łańcuchowe!
  { expr: "1,004 → setne",     result: "1,00" }, // 4 < 5 → w dół
  { expr: "0,1349 → setne",    result: "0,13" }, // 4 < 5 → w dół
  { expr: "3,145 → setne",     result: "3,15" }, // 5 ≥ 5 → w górę
  { expr: "0,995 → setne",     result: "1,00" }, // przeniesienie
  { expr: "5,674 → setne",     result: "5,67" }, // 4 < 5 → w dół
  { expr: "1,2851 → setne",    result: "1,29" }, // 5 ≥ 5 → w górę
  { expr: "7,505 → setne",     result: "7,51" }, // 5 ≥ 5 → w górę
];

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function generateRoundingPairs(): MatchPairItem[] {
  return shuffle(ALL_PAIRS).slice(0, 6).map((p) => ({
    left: <span className="font-mono text-sm text-center leading-tight">{p.expr}</span>,
    right: <span className="font-mono text-xl font-bold">{p.result}</span>,
  }));
}
