import type { MatchPairItem } from "@/components/lessons/types";

// 30 par: wyrażenie dwumianowane ↔ ułamek dziesiętny (W10)
// Zakresy: m/cm, zł/gr, kg/g, godz./min
// Podchwytliwe: "5 m 8 cm" → 5,08 (nie 5,8!), "1 kg 8 g" → 1,008 (nie 1,08!)
const ALL_PAIRS: { compound: string; decimal: string }[] = [
  // Metry i centymetry
  { compound: "2 m 35 cm",  decimal: "2,35 m"   },
  { compound: "5 m 8 cm",   decimal: "5,08 m"   }, // pułapka: nie 5,8 m
  { compound: "1 m 20 cm",  decimal: "1,20 m"   },
  { compound: "3 m 5 cm",   decimal: "3,05 m"   }, // pułapka: nie 3,5 m
  { compound: "10 m 50 cm", decimal: "10,50 m"  },
  { compound: "0 m 75 cm",  decimal: "0,75 m"   },
  { compound: "4 m 1 cm",   decimal: "4,01 m"   }, // pułapka: nie 4,1 m
  { compound: "12 m 90 cm", decimal: "12,90 m"  },
  // Złote i grosze
  { compound: "5 zł 80 gr",   decimal: "5,80 zł"   },
  { compound: "12 zł 75 gr",  decimal: "12,75 zł"  },
  { compound: "3 zł 05 gr",   decimal: "3,05 zł"   }, // pułapka: nie 3,5 zł
  { compound: "0 zł 99 gr",   decimal: "0,99 zł"   },
  { compound: "100 zł 10 gr", decimal: "100,10 zł" },
  { compound: "7 zł 07 gr",   decimal: "7,07 zł"   }, // pułapka: nie 7,7 zł
  { compound: "1 zł 50 gr",   decimal: "1,50 zł"   },
  { compound: "25 zł 25 gr",  decimal: "25,25 zł"  },
  // Kilogramy i gramy
  { compound: "3 kg 750 g",  decimal: "3,750 kg" },
  { compound: "5 kg 25 g",   decimal: "5,025 kg" }, // pułapka: nie 5,25 kg
  { compound: "2 kg 500 g",  decimal: "2,500 kg" },
  { compound: "1 kg 8 g",    decimal: "1,008 kg" }, // pułapka: nie 1,08 kg
  { compound: "10 kg 100 g", decimal: "10,100 kg" },
  { compound: "0 kg 250 g",  decimal: "0,250 kg" },
  { compound: "4 kg 4 g",    decimal: "4,004 kg" }, // pułapka: nie 4,04 kg
  // Godziny i minuty (tylko czyste dziesiętne: /60 daje ułamek skończony)
  { compound: "1 godz. 30 min", decimal: "1,5 h"   }, // 30/60 = 0,5
  { compound: "2 godz. 15 min", decimal: "2,25 h"  }, // 15/60 = 0,25
  { compound: "0 godz. 45 min", decimal: "0,75 h"  }, // 45/60 = 0,75
  { compound: "1 godz. 12 min", decimal: "1,2 h"   }, // 12/60 = 0,2
  { compound: "3 godz. 6 min",  decimal: "3,1 h"   }, // 6/60 = 0,1
  { compound: "2 godz. 48 min", decimal: "2,8 h"   }, // 48/60 = 0,8
  { compound: "0 godz. 36 min", decimal: "0,6 h"   }, // 36/60 = 0,6
];

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function generateUnitsPairs(): MatchPairItem[] {
  return shuffle(ALL_PAIRS).slice(0, 6).map((p) => ({
    left: <span className="text-center text-sm font-medium leading-tight">{p.compound}</span>,
    right: <span className="font-mono text-base font-bold">{p.decimal}</span>,
  }));
}
