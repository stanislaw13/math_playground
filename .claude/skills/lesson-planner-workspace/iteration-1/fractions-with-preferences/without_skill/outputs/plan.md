# Fractions Lesson Plan

## Lesson Overview
A comprehensive primary school lesson on fractions designed for grades 4-6. The lesson uses engaging visual metaphors and interactive games to help students understand fractions, their equivalences, and decimal conversions.

**Lesson ID**: `primary-fractions`
**Category**: Primary School
**Order**: 2 (comes after Areas lesson)

## Learning Objectives
By the end of this lesson, students will be able to:
1. Understand fractions as parts of a whole
2. Visually identify and compare fractions using pie slices
3. Understand equivalent fractions (e.g., 2/4 = 1/2)
4. Convert fractions to decimal equivalents
5. Apply fraction knowledge through interactive gameplay

## Lesson Structure (7 Sections)

### Section 1: Fractions Introduction & Theory
- **Type**: Custom (text + interactive fraction bar explorer)
- **Content**: Introduction to fractions with definitions
- **Interactive Component**: FractionBarExplorer
  - Students can drag a slider to show different fractions
  - Visual representation of numerator and denominator
  - Displays decimal equivalent in real-time
  - Shows equivalent fractions (e.g., 2/4 = 4/8 = 1/2)
  - Adaptive difficulty: Basic mode (halves, thirds, quarters), Advanced mode (more complex fractions)

### Section 2: Pizza Slice Game - Visual Understanding
- **Type**: Game
- **Game ID**: `pizza-slices`
- **Game**: PizzaSlicesGame
- **Purpose**: Teach fraction identification and comparison using pizza/pie slices
- **Mechanics**:
  - Visually show a pizza with colored slices
  - Ask students to select the correct number of slices to match a target fraction
  - Multiple difficulty levels:
    - Easy: Simple fractions (1/2, 1/3, 1/4, 3/4)
    - Medium: More complex fractions (2/3, 3/5, 5/8)
    - Hard: Fractional addition (1/3 + 1/4, etc.)
  - Scoring: Points decrease for attempts, bonus for speed
  - Adaptive: Increases difficulty based on student performance

### Section 3: Matching Game - Fractions to Decimals
- **Type**: Game_Match_Pairs
- **Game ID**: `match-pairs-fractions`
- **Reuses**: MatchPairsGame component
- **Purpose**: Connect fraction notation with decimal values
- **Pair Generation**: FractionDecimalPairGenerator
  - Left side: Fraction notation (1/2, 3/4, 2/5, etc.)
  - Right side: Decimal values (.5, .75, .4, etc.)
  - Grid layout: 4 columns, 8 cards total (4 pairs)
  - Adaptive: Generate different difficulty levels
    - Easy: Common fractions (halves, quarters, fifths)
    - Medium: Less common but recognizable fractions
    - Hard: Mixed difficulty with percentages

### Section 4: Equivalent Fractions Explorer
- **Type**: Playground (two explorers side-by-side)
- **Components**:
  - EquivalentFractionExplorer: Shows how multiplying numerator and denominator by the same number creates equivalent fractions
  - VisualEquivalentComparison: Side-by-side pie charts showing equivalent fractions visually
- **Adaptive**: Difficulty controls the complexity of fractions shown

### Section 5: Fraction Simplification Challenge
- **Type**: Game
- **Game ID**: `fraction-simplifier`
- **Purpose**: Teach reducing fractions to simplest form
- **Mechanics**:
  - Show a fraction (e.g., 4/6)
  - Ask students to provide the simplified form (2/3)
  - Visual pie chart shows both forms side-by-side to confirm they're equal
  - Multiple choice or text input options
  - Adaptive scoring based on performance

### Section 6: Pizza Slice Game - Advanced
- **Type**: Game
- **Game ID**: `pizza-slices-advanced`
- **Purpose**: Reinforce understanding through more complex scenarios
- **Mechanics**:
  - Show multiple pizzas with different fractions
  - Fraction addition/subtraction scenarios
  - Comparing fractions
  - Adaptive difficulty increases throughout the game

### Section 7: Review & Assessment
- **Type**: Game
- **Game ID**: `fractions-quiz`
- **Purpose**: Review all concepts and assess understanding
- **Content**: Mixed questions covering:
  - Identifying fractions from visual representations
  - Converting fractions to decimals
  - Finding equivalent fractions
  - Simplifying fractions
  - Comparing fractions

## Formulas & Key Concepts

The formula sidebar will display:
1. **Fraction Basics**: numerator / denominator = part / whole
2. **Equivalent Fractions**: (a × k) / (b × k) = a / b
3. **Fraction to Decimal**: a / b = a ÷ b
4. **Simplifying**: Find GCD and divide both by it

## Adaptive Learning Features

All games implement adaptive difficulty:
- **Easy Mode**: Simpler fractions, larger visual units, immediate feedback
- **Medium Mode**: Standard fractions, balanced difficulty
- **Hard Mode**: Complex fractions, compound operations, time pressure

Difficulty adjustment logic:
- If student completes 3+ challenges perfectly → increase difficulty
- If student struggles (3+ wrong attempts) → decrease difficulty
- Visual feedback shows current difficulty level

## Translation Keys Required

**English namespace**: `fractions`
**Polish namespace**: `ułamki`

Key sections:
- fractions.title
- fractions.intro
- fractions.definition
- fractions.numerator / denominator / whole
- fractions.equivalent
- fractions.decimal
- fractions.simplify
- fractions.compare
- games.pizzaSlices / pizzaSlicesDesc
- games.matchPairsDesc (for fractions variant)
- games.fractionSimplifier / fractionSimplifierDesc

## File Structure

```
outputs/
├── plan.md (this file)
├── page.tsx (main lesson page)
├── FractionBarExplorer.tsx (interactive slider for equivalent fractions)
├── PizzaSlicesGame.tsx (pizza slice visual game with adaptive difficulty)
├── FractionDecimalPairGenerator.ts (generates pairs for MatchPairsGame)
├── EquivalentFractionExplorer.tsx (teaches equivalent fractions)
├── VisualEquivalentComparison.tsx (side-by-side pie charts)
├── FractionSimplifierGame.tsx (simplification game)
├── FractionQuiz.tsx (comprehensive review quiz)
├── translations-en.json (English translations)
├── translations-pl.json (Polish translations)
└── lessons-entry.json (entry to add to lessons registry)
```

## Integration Steps

1. Copy all TSX files to: `src/components/lessons/fractions/`
2. Add translation entries from translations-*.json to `src/messages/en.json` and `src/messages/pl.json`
3. Add lesson entry from lessons-entry.json to `src/content/lessons.ts`
4. Create page route: `src/app/[locale]/primary/fractions/page.tsx` (copy page.tsx to this location)
5. Update primary school navigation to include fractions lesson
6. (Optional) Create pizza SVG assets or use canvas rendering

## Design Notes

- **Color Scheme**: Uses existing CSS variables from the design system
- **Accessibility**: All interactive elements have proper ARIA labels
- **Responsive**: Mobile-first design, works on tablets and desktops
- **Animation**: Smooth transitions using Framer Motion
- **Performance**: Games are dynamically loaded with `next/dynamic` to avoid SSR issues
