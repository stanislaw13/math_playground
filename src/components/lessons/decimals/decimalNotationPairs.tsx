import type { MatchPairItem } from "@/components/lessons/types";

// 30 par: słowny zapis ↔ cyfry (polska notacja z przecinkiem)
// Zakres: W1 – odczytywanie i zapisywanie ułamków dziesiętnych
// Celowo uwzględnione podchwytliwe przypadki (np. "pięć setnych" → 0,05 nie 0,5)
const ALL_PAIRS: { word: string; decimal: string }[] = [
  // Dziesiąte (proste)
  { word: "siedem dziesiątych", decimal: "0,7" },
  { word: "trzy dziesiąte", decimal: "0,3" },
  { word: "dwa i pięć dziesiątych", decimal: "2,5" },
  { word: "jedna dziesiąta", decimal: "0,1" },
  { word: "osiem dziesiątych", decimal: "0,8" },
  { word: "cztery dziesiąte", decimal: "0,4" },
  { word: "sześć dziesiątych", decimal: "0,6" },
  { word: "jedna i trzy dziesiąte", decimal: "1,3" },
  { word: "pięć i dwie dziesiąte", decimal: "5,2" },
  { word: "dziesięć i dziewięć dziesiątych", decimal: "10,9" },
  // Setne – uwaga na pozycje!
  { word: "pięć setnych", decimal: "0,05" },         // pułapka: nie 0,5
  { word: "trzynaście setnych", decimal: "0,13" },
  { word: "dwadzieścia pięć setnych", decimal: "0,25" },
  { word: "jeden i pięć setnych", decimal: "1,05" },  // pułapka: nie 1,5
  { word: "trzy i czterdzieści pięć setnych", decimal: "3,45" },
  { word: "dwie setne", decimal: "0,02" },
  { word: "zero i dziewięć setnych", decimal: "0,09" },
  { word: "siedemdziesiąt setnych", decimal: "0,70" }, // = 0,7
  { word: "dwanaście i trzydzieści sześć setnych", decimal: "12,36" },
  { word: "sto setnych", decimal: "1,00" },            // pułapka: = 1
  // Tysięczne – jeszcze subtelniejsze pozycje
  { word: "osiem tysięcznych", decimal: "0,008" },     // pułapka: nie 0,8 ani 0,08
  { word: "sto pięć tysięcznych", decimal: "0,105" },  // pułapka: nie 0,15
  { word: "cztery i siedem tysięcznych", decimal: "4,007" }, // pułapka: nie 4,7
  { word: "jeden i dwadzieścia pięć tysięcznych", decimal: "1,025" },
  { word: "pięćset tysięcznych", decimal: "0,500" },   // = 0,5
  { word: "dziesięć tysięcznych", decimal: "0,010" },  // = 0,01
  { word: "dwa i czterdzieści tysięcznych", decimal: "2,040" },
  { word: "dwieście tysięcznych", decimal: "0,200" },  // = 0,2
  { word: "pięć i sto trzydzieści tysięcznych", decimal: "5,130" },
  { word: "tysiąc tysięcznych", decimal: "1,000" },    // pułapka: = 1
];

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function generateNotationPairs(): MatchPairItem[] {
  return shuffle(ALL_PAIRS).slice(0, 6).map((p) => ({
    left: (
      <span className="text-center text-sm leading-tight">{p.word}</span>
    ),
    right: <span className="font-mono text-lg">{p.decimal}</span>,
  }));
}
