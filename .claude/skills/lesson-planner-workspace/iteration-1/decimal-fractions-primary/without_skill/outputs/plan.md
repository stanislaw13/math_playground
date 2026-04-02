# Decimal Fractions Lesson Plan for Primary School

## Overview
This lesson teaches primary school students the foundations of decimal numbers, focusing on place value, comparing decimals, and basic arithmetic with decimals. The lesson includes interactive explorers, games, and adaptive problem-solving to meet each student where they are.

**Target Grade Level:** 4-6 (Primary)
**Duration:** Multi-section lesson with 7 key sections
**Learning Outcomes:** Students will understand decimal place values, compare decimals, and perform basic addition/subtraction with decimals.

---

## Learning Objectives

1. **Understand Place Value in Decimals**
   - Recognize tenths, hundredths, and thousandths positions
   - Read and write decimal numbers correctly
   - Understand the relationship between fractions and decimals

2. **Compare Decimal Numbers**
   - Compare decimals using inequality symbols (<, >, =)
   - Order decimals from smallest to largest
   - Understand that 0.5 ≠ 0.50 in representation but they're equal in value

3. **Basic Arithmetic with Decimals**
   - Add decimal numbers (same number of decimal places)
   - Subtract decimal numbers (same number of decimal places)
   - Align decimal points correctly
   - Understand money as a real-world application

---

## Lesson Structure (7 Sections)

### Section 1: Introduction to Decimals
- **Type:** Custom (intro)
- **Content:**
  - Explanation of what decimals are
  - Connection to fractions (0.5 = 1/2, 0.25 = 1/4, etc.)
  - Real-world examples (money, measurement)
  - Visual representation of decimal place values

### Section 2: Number Line Explorer
- **Type:** Interactive Playground
- **Component:** DecimalNumberLineExplorer
- **Purpose:**
  - Visualize where decimals sit between whole numbers
  - Zoom in/out to see different scales (0-1, 0-10, etc.)
  - Click to place decimals and see their exact values
  - Understand decimal density
- **Features:**
  - Draggable slider showing position on number line
  - Decimal value display updating in real-time
  - Toggle between different ranges
  - Visual markers for 0.5, 0.25, 0.75, etc.

### Section 3: Place Value Explorer
- **Type:** Interactive Playground
- **Component:** PlaceValueExplorer
- **Purpose:**
  - Break down decimals into ones, tenths, hundredths, thousandths
  - Show how each digit contributes to the value
  - Color-coded place value columns
- **Features:**
  - Sliders for each place value (ones, tenths, hundredths, thousandths)
  - Live visual representation of the decimal
  - Base-10 blocks or grid representation
  - Input field to show breakdown of a decimal number

### Section 4: Compare Decimals Game
- **Type:** Game (Adaptive)
- **Component:** CompareDecimalsGame
- **Purpose:**
  - Practice comparing two decimal numbers
  - Understand <, >, = operators
  - Adaptive difficulty scaling
- **Features:**
  - Present two decimals, student chooses the correct comparison operator
  - Visual number line showing both numbers
  - Adaptive difficulty:
    - Easy: Compare numbers with different whole parts (1.5 vs 3.2)
    - Medium: Compare numbers with same whole part, different tenths (2.3 vs 2.7)
    - Hard: Very close decimals (1.25 vs 1.26)
  - Tracks skill categories:
    - "compare-different-wholes" (easy)
    - "compare-tenths" (medium)
    - "compare-hundredths" (hard)

### Section 5: Addition & Subtraction Game
- **Type:** Game (Adaptive)
- **Component:** DecimalArithmeticGame
- **Purpose:**
  - Practice adding and subtracting decimals
  - Understand decimal alignment and place value
  - Adaptive difficulty with problem variety
- **Features:**
  - Present addition or subtraction problems with decimals
  - Space for students to write answers
  - Visual grid or blocks to support calculation
  - Adaptive difficulty:
    - Easy: 1 or 2 decimal places, simple numbers (0.3 + 0.5)
    - Medium: 2 decimal places, numbers up to 9.99 (2.45 + 3.28)
    - Hard: 3 decimal places or regrouping needed (4.35 - 2.68)
  - Tracks skill categories:
    - "addition-simple" (1-2 place values)
    - "addition-complex" (regrouping, 3 decimal places)
    - "subtraction-simple"
    - "subtraction-complex"

### Section 6: Decimal Ordering Match Game
- **Type:** Game (Match Pairs with Adaptive Engine)
- **Component:** Custom match-pairs generator
- **Purpose:**
  - Match decimal representations with equivalent values
  - Practice multiple representations of the same number
- **Pairs:**
  - Decimal ↔ Fraction (0.5 ↔ 1/2, 0.25 ↔ 1/4, etc.)
  - Decimal ↔ Money ($1.50 ↔ 1.50, etc.)
  - Decimal ↔ Decimal words (0.7 ↔ "seven tenths")
  - Decimal ↔ Number line position

### Section 7: Real-World Challenge: Money & Measurement
- **Type:** Game
- **Component:** RealWorldDecimalChallenge
- **Purpose:**
  - Apply decimal knowledge to practical scenarios
  - Money (shopping, change)
  - Measurement (length, weight)
  - Problem-solving with multiple decimals
- **Features:**
  - Scenario-based problems
  - Multiple solution paths
  - Adaptive difficulty based on previous performance
  - Combines addition, subtraction, and comparison

---

## Adaptive Learning Strategy

### Skill Categories
The lesson uses these adaptive skill categories to personalize the experience:

1. **place-value-recognition** (intro)
2. **number-line-positioning** (visual)
3. **compare-different-wholes** (easy comparison)
4. **compare-tenths** (medium comparison)
5. **compare-hundredths** (hard comparison)
6. **addition-simple** (no regrouping)
7. **addition-complex** (with regrouping)
8. **subtraction-simple** (no regrouping)
9. **subtraction-complex** (with regrouping)
10. **decimal-equivalents** (fractions, money, words)

### How Adaptation Works
- **Tracking:** Each game records correct/incorrect for each category
- **Difficulty Scaling:** Students who struggle with a category get easier problems; those who master it advance to harder versions
- **Problem Generation:** Question generators use the adaptive engine's difficulty recommendation
- **Motivation:** Students see their progress and focus on areas where they need improvement

---

## Key Features

### Number Line Explorer
The centerpiece of this lesson — students can:
- Drag a slider to position decimals on a number line
- See the exact value change in real-time
- Zoom between different scales (0-1, 0-10, 0-100)
- Understand that 0.5 is halfway to 1, 0.25 is one-quarter way, etc.
- Compare multiple decimals side-by-side

### Visual Representations
- **Base-10 blocks** for place value understanding
- **Grid/100-square** visualization for hundredths
- **Number lines** for comparison and ordering
- **Money representation** for practical application

### Games with Feedback
- Immediate feedback on correctness
- Hint system for struggling students
- Progress tracking across all games
- Summary statistics at lesson end

---

## Translations
The lesson uses translation keys for full i18n support:
- All game titles, instructions, and feedback in `decimals` namespace
- All shared terms in `common` and `games` namespaces
- Support for English (en) and Polish (pl)

---

## Technical Implementation

### Components
- `page.tsx` — Main lesson page using LessonShell
- `DecimalNumberLineExplorer.tsx` — Interactive number line
- `PlaceValueExplorer.tsx` — Place value visualizer
- `CompareDecimalsGame.tsx` — Comparison game with adaptive engine
- `DecimalArithmeticGame.tsx` — Addition/subtraction with adaptive engine
- `RealWorldDecimalChallenge.tsx` — Scenario-based game

### Adaptive Engine Integration
- Uses `useAdaptiveEngine` hook from `/hooks/useAdaptiveEngine.ts`
- Each game tracks which skill categories students struggle with
- System recommends problem difficulty based on performance
- Students see summary of weakest to strongest areas at lesson end

### Scoring System
- Uses existing `getPointsForAttempt()` from `/lib/scoring.ts`
- Points awarded based on attempt number and difficulty
- Encourages first-attempt success but allows retries

---

## Assessment & Progress
- **Formative Assessment:** Each game provides immediate feedback
- **Progress Tracking:** All games record performance data
- **Summary Report:** End-of-lesson summary shows:
  - Overall accuracy
  - Breakdown by skill category
  - Recommended focus areas
  - Motivation: "You're improving in compare-decimals! Keep going!"

---

## Next Steps After This Lesson
- **Decimals (Advanced):** Multiplication and division with decimals
- **Percentages:** Connect decimals to percentage representation
- **Scientific Notation:** Express large numbers with decimals
- **Related Fractions:** Deeper exploration of fraction-decimal equivalence

---

## Files to Create

1. **page.tsx** — Main lesson component
2. **DecimalNumberLineExplorer.tsx** — Interactive number line
3. **PlaceValueExplorer.tsx** — Place value breakdown
4. **CompareDecimalsGame.tsx** — Comparison game
5. **DecimalArithmeticGame.tsx** — Addition/subtraction game
6. **RealWorldDecimalChallenge.tsx** — Practical applications
7. **decimalGameGenerators.ts** — Adaptive question generators
8. **translations-en.json** — English translations
9. **translations-pl.json** — Polish translations
10. **lessons-entry.json** — Entry for lessons.ts registry

