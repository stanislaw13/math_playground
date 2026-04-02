# Decimal Fractions Lesson Plan

## Lesson Overview

**Level:** Primary School (Grades 4-6)
**Topic:** Decimal Fractions - Understanding Place Value, Comparison, and Basic Operations
**Duration:** Multi-section interactive lesson with 4 adaptive games

**Learning Objectives:**
- Understand that decimals represent parts of a whole
- Read and interpret decimal place values (tenths, hundredths, thousandths)
- Compare and order decimal numbers
- Add and subtract simple decimal numbers
- Visualize where decimals sit between whole numbers on a number line

---

## Lesson Structure

### Section 1: Number Line Explorer - Place Value Introduction

**Interactive Theory Component: `NumberLineExplorer.tsx`**

A dynamic number line that helps students see where decimal numbers sit between whole numbers.

**Features:**
- Slider to position a point on a number line from 0 to 10
- Shows the whole number part and decimal part separately
- Highlights the fractional component with color coding
- Displays the number in multiple formats: decimal (2.3), place value breakdown (2 + 0.3), and fraction (2³⁄₁₀)
- Visual indicators show tenths, hundredths positions
- Zoom feature to see finer detail between any two whole numbers

**Learning Flow:**
1. Start with simple cases (0-2 range) showing tenths
2. Expand to see hundredths when zoomed
3. Show equivalence between 0.50 and 0.5
4. Compare position of different decimals visually

**Formulas shown:**
- Decimal notation: d.abc where d is whole number, a=tenths, b=hundredths, c=thousandths
- Relationship: 0.5 = 5/10, 0.25 = 25/100

---

### Section 2: Place Value Breakdown - Interactive Decomposition

**Interactive Theory Component: `PlaceValueBreakdown.tsx`**

Students manipulate individual place values (ones, tenths, hundredths) to build decimal numbers.

**Features:**
- Three sliders for: ones (0-9), tenths (0-9), hundredths (0-9)
- Live preview showing the composed number
- Visual representation with place value boxes (labeled)
- Shows both decimal and expanded notation: 3.45 = 3 + 0.4 + 0.05
- Comparison with a target number to see if they match
- Quiz-style: "Build 5.63" - student adjusts sliders

**Educational Value:**
- Reinforces that decimals are positional notation
- Shows that 0.30 = 0.3 (trailing zeros don't change value)
- Supports students who struggle with place value concepts

---

### Section 3: Decimal Comparison - Visual Ordering

**Interactive Theory Component: `DecimalComparison.tsx`**

Visual tool for comparing pairs and ordering groups of decimals.

**Features:**
- Pair comparison mode: shows two decimals with visual bars (length proportional to value)
- Ask "Which is larger? 0.7 or 0.75?" with visual feedback
- Ordering mode: place 3-4 decimals on a number line (drag to position)
- Provides immediate visual feedback of correctness
- Shows equivalence (0.5 = 0.50)

---

## Games (Adaptive, 4 Total)

Each game uses the adaptive engine with skill categories to track student progress and adjust difficulty.

### Game 1: Number Line Detective

**Type:** Question-Answer Game with Hint System
**Adaptive Categories:**
- `place-value-reading` — Read a decimal from its position on a number line
- `number-line-placement` — Place a given decimal on a number line
- `decimal-equivalence` — Recognize that 0.5 = 0.50

**Flow:**
1. Student sees a number line with a marked position
2. Asked: "What decimal is this?" (for reading mode) or "Place 0.7 on the line" (for placement mode)
3. Student enters a decimal or drags a point
4. System checks answer (tolerance: ±0.01 for reading)
5. Hints progressively reveal: (a) the place value framework, (b) how to count the divisions, (c) the full answer

**Difficulty Scaling:**
- **Easy:** Single decimal place (tenths only), numbers 0-5
- **Medium:** Two decimal places (hundredths), numbers 0-10, mixed ranges
- **Hard:** Three decimal places (thousandths), negative decimals ← (age appropriate for older primary)

**Questions per Round:** 12

---

### Game 2: Decimal Comparison Challenge

**Type:** Rapid-fire Comparison
**Adaptive Categories:**
- `compare-same-places` — Compare 0.4 vs 0.5 (both tenths)
- `compare-different-places` — Compare 0.5 vs 0.75 (tenths vs hundredths)
- `order-three-decimals` — Order three numbers smallest to largest

**Flow:**
1. Question appears: "Which is bigger: 0.6 or 0.63?" or "Order these: 0.5, 0.4, 0.45"
2. Student selects answer(s) from multiple choice or drag-drops in order
3. Immediate visual feedback (green/red)
4. Hints show place value comparison step-by-step

**Difficulty Scaling:**
- **Easy:** Clear differences, only tenths (0.3 vs 0.7)
- **Medium:** Mixed places, closer values (0.35 vs 0.4)
- **Hard:** Very close values, three decimal places (0.234 vs 0.243 vs 0.324)

**Questions per Round:** 12

---

### Game 3: Decimal Addition & Subtraction Builder

**Type:** Multi-choice with visual place value grid
**Adaptive Categories:**
- `add-tenths` — Add decimals with only tenths: 0.3 + 0.4
- `add-mixed-places` — Add 0.5 + 0.25 (must align place values)
- `subtract-decimals` — Subtraction: 0.8 - 0.3, 1.5 - 0.7

**Flow:**
1. Question: "0.5 + 0.3 = ?"
2. Visual representation on a place value grid (ones, tenths, hundredths columns)
3. Student can count blocks or answer directly
4. Four multiple-choice options (includes common misconceptions as distractors)
5. Hints show step-by-step place value alignment

**Difficulty Scaling:**
- **Easy:** Single decimal place only, no regrouping: 0.2 + 0.3
- **Medium:** Mixed places, no regrouping: 0.3 + 0.27
- **Hard:** Requires regrouping: 0.7 + 0.5 = 1.2; 1.3 - 0.6

**Questions per Round:** 10

---

### Game 4: Decimal Match Pairs

**Type:** Card Matching Game (reuses MatchPairsGame component)
**Skill Integration:** Not adaptive (no single category), but reinforces all place value concepts

**Pairs:**
- Decimal → Fraction equivalence (0.5 ↔ 5/10, 0.25 ↔ 25/100)
- Decimal → Expanded form (0.34 ↔ 0.3 + 0.04)
- Decimal → Place value description (0.7 ↔ "seven tenths")
- Equivalent decimals (0.50 ↔ 0.5, 0.100 ↔ 0.1)

**Grid:** 4×4 (8 pairs, no adaptive difficulty needed)

**Educational Purpose:** Consolidate understanding of multiple representations

---

## Skill Categories (Across All Games)

These categories appear across the adaptive games to track progress:

1. **place-value-reading** — Can identify the value of a decimal from a visual
2. **number-line-placement** — Can place a decimal on a number line
3. **decimal-equivalence** — Understands 0.5 = 0.50
4. **compare-same-places** — Can compare decimals with same number of decimal places
5. **compare-different-places** — Can compare decimals with different decimal places
6. **order-multiple** — Can order 3+ decimals
7. **add-tenths** — Can add tenths (no regrouping)
8. **add-mixed-places** — Can add decimals of different places
9. **subtract-decimals** — Can subtract decimals

---

## Translation Keys Required

All UI text must use i18n keys. New keys to be added:

### English (translations-en.json)

```json
{
  "primary": {
    "decimals": {
      "title": "Decimal Fractions",
      "description": "Learn to work with decimal numbers. Understand place value, compare decimals, and practice addition and subtraction."
    }
  },
  "decimals": {
    "title": "Decimal Fractions",
    "intro": "Decimals are numbers that represent parts of a whole. Explore how they work!",
    "formulaPlaceValue": "Place Value",
    "formulaAddition": "Addition",
    "formulaSubtraction": "Subtraction",
    "formulaEquivalence": "Equivalent Decimals",
    "section1Title": "Number Line Explorer",
    "section1Desc": "Slide the point along the number line to see where decimals sit between whole numbers.",
    "section2Title": "Build Decimal Numbers",
    "section2Desc": "Adjust the place values to build decimal numbers.",
    "section3Title": "Compare Decimals",
    "section3Desc": "Which decimal is larger? Use visual comparison to understand how decimals compare.",
    "linePositionQuestion": "What decimal is marked on the number line?",
    "linePositionQuestionPlacement": "Place {decimal} on the number line.",
    "comparisonQuestion": "Which is larger: {a} or {b}?",
    "orderingQuestion": "Order from smallest to largest: {decimals}",
    "additionQuestion": "{a} + {b} = ?",
    "subtractionQuestion": "{a} - {b} = ?",
    "placeValueHint": "Remember: the first digit after the point is tenths, the second is hundredths.",
    "placeValueSubstitution": "In {a}, the {place} digit is {digit}.",
    "decimalEquivalenceHint": "Trailing zeros don't change the value: 0.5 = 0.50 = 0.500",
    "alignPlaceValuesHint": "Make sure to line up the decimal points when adding or subtracting.",
    "correct": "Correct!",
    "incorrect": "Try again",
    "check": "Check",
    "next": "Next",
    "questionOf": "Question {current} of {total}",
    "keepPracticing": "Keep practicing these skills",
    "yourAnswer": "Your answer",
    "matchPairsTitle": "Decimal Pair Match",
    "matchPairsDesc": "Match equivalent decimals, fractions, and descriptions.",
    "detailedExplanation": "Full solution"
  },
  "games": {
    "startGame": "Start Game",
    "tryAgain": "Try Again",
    "complete": "Game Complete!",
    "matched": "Matched!",
    "moves": "Moves",
    "allMatched": "All pairs matched!",
    "wellDone": "Well done!",
    "nextChallenge": "Next Challenge",
    "challenge": "Challenge"
  },
  "hints": {
    "showHint": "Show hint",
    "locked": "Answer incorrectly {count} more time(s) to unlock hint",
    "solutionSteps": "Solution Steps",
    "step": "Step {n}",
    "showNextStep": "Show next step"
  }
}
```

### Polish (translations-pl.json)

```json
{
  "primary": {
    "decimals": {
      "title": "Ułamki Dziesiętne",
      "description": "Naucz się pracować z liczbami dziesiętnymi. Zrozum wartość miejsc, porównuj ułamki dziesiętne i ćwicz dodawanie i odejmowanie."
    }
  },
  "decimals": {
    "title": "Ułamki Dziesiętne",
    "intro": "Ułamki dziesiętne to liczby reprezentujące części całości. Odkryj, jak one działają!",
    "formulaPlaceValue": "Wartość Miejsca",
    "formulaAddition": "Dodawanie",
    "formulaSubtraction": "Odejmowanie",
    "formulaEquivalence": "Równoważne Ułamki Dziesiętne",
    "section1Title": "Oś Liczbowa",
    "section1Desc": "Przesuń punkt wzdłuż osi liczbowej, aby zobaczyć, gdzie znajdują się ułamki dziesiętne między liczbami całkowitymi.",
    "section2Title": "Buduj Ułamki Dziesiętne",
    "section2Desc": "Reguluj wartości miejsc, aby budować ułamki dziesiętne.",
    "section3Title": "Porównaj Ułamki Dziesiętne",
    "section3Desc": "Który ułamek dziesiętny jest większy? Użyj porównania wizualnego, aby zrozumieć, jak porównywać ułamki dziesiętne.",
    "linePositionQuestion": "Jakie ułamki dziesiętne są zaznaczone na osi liczbowej?",
    "linePositionQuestionPlacement": "Umieść {decimal} na osi liczbowej.",
    "comparisonQuestion": "Który jest większy: {a} lub {b}?",
    "orderingQuestion": "Uporządkuj od najmniejszego do największego: {decimals}",
    "additionQuestion": "{a} + {b} = ?",
    "subtractionQuestion": "{a} - {b} = ?",
    "placeValueHint": "Pamiętaj: pierwsza cyfra po przecinku to dziesiątki, druga to setne.",
    "placeValueSubstitution": "W {a}, cyfra {place} to {digit}.",
    "decimalEquivalenceHint": "Zera na końcu nie zmieniają wartości: 0,5 = 0,50 = 0,500",
    "alignPlaceValuesHint": "Upewnij się, że wyrównujesz przecinki podczas dodawania lub odejmowania.",
    "correct": "Poprawnie!",
    "incorrect": "Spróbuj ponownie",
    "check": "Sprawdź",
    "next": "Dalej",
    "questionOf": "Pytanie {current} z {total}",
    "keepPracticing": "Ćwicz te umiejętności",
    "yourAnswer": "Twoja odpowiedź",
    "matchPairsTitle": "Pasowanie Ułamków Dziesiętnych",
    "matchPairsDesc": "Dopasuj równoważne ułamki dziesiętne, ułamki zwykłe i opisy.",
    "detailedExplanation": "Pełne rozwiązanie"
  },
  "games": {
    "startGame": "Zacznij Grę",
    "tryAgain": "Spróbuj Ponownie",
    "complete": "Gra Ukończona!",
    "matched": "Dopasowane!",
    "moves": "Ruchy",
    "allMatched": "Wszystkie pary dopasowane!",
    "wellDone": "Świetnie!",
    "nextChallenge": "Następne Wyzwanie",
    "challenge": "Wyzwanie"
  },
  "hints": {
    "showHint": "Pokaż podpowiedź",
    "locked": "Odpowiedz niepoprawnie {count} więcej razy, aby odblokować podpowiedź",
    "solutionSteps": "Kroki Rozwiązania",
    "step": "Krok {n}",
    "showNextStep": "Pokaż następny krok"
  }
}
```

---

## File Structure in Outputs Directory

```
outputs/
├── plan.md                                           # This lesson plan
├── translations-en.json                              # New English keys to add
├── translations-pl.json                              # New Polish keys to add
├── lessons-entry.json                                # Entry to append to lessons.ts
├── src/
│   ├── app/
│   │   └── [locale]/
│   │       └── primary/
│   │           └── decimals/
│   │               └── page.tsx                       # Main lesson page
│   └── components/
│       └── lessons/
│           └── decimals/
│               ├── NumberLineExplorer.tsx            # Theory: number line visual
│               ├── PlaceValueBreakdown.tsx           # Theory: place value sliders
│               ├── DecimalComparison.tsx             # Theory: visual comparison
│               ├── NumberLineDetective.tsx           # Game 1: find/place decimal
│               ├── DecimalComparison.tsx             # Game 2: comparison challenge
│               ├── DecimalAddition.tsx               # Game 3: addition & subtraction
│               ├── decimalMatchPairs.tsx             # Game 4: pair generator
│               └── DecimalSVGs.tsx                   # Optional SVG diagrams
```

---

## Quality Checklist

- [x] Theory sections are interactive (3 explorers with sliders, visual feedback)
- [x] Each game has clear skill categories (9 categories across games)
- [x] Games use adaptive engine for difficulty and selection
- [x] Hints are progressive (concept → setup → full solution)
- [x] Numbers appropriate for primary school (0-10 range mostly)
- [x] Lesson builds simple → complex (number lines first, then operations)
- [x] All text uses i18n keys
- [x] Formula sidebar shows relevant formulas
- [x] Games vary in mechanics (explorer, detective, comparison, match pairs)
- [x] Visual feedback and animations included
- [x] All components use CSS variables for theming
