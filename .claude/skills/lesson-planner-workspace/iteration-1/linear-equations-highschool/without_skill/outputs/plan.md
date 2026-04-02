# Linear Equations High School Lesson Plan

## Overview
This lesson introduces high school students to solving linear equations in one variable with operations on both sides. The lesson covers:
- Basic equation structure (left side = right side)
- Solving equations with variables on one side
- Solving equations with variables on both sides
- Practical applications and verification

## Learning Objectives
By the end of this lesson, students will be able to:
1. Identify and understand equation balance
2. Solve simple linear equations (2x + 3 = 11)
3. Solve equations with variables on both sides (2x + 3 = x + 7)
4. Apply inverse operations correctly
5. Verify solutions by substitution

## Lesson Structure (7 Sections)

### Section 1: Introduction & Equation Balance
- Explain what an equation is (balance metaphor)
- Show visual representation of balanced scales
- Interactive: Adjust values to maintain balance
- Key concept: Whatever you do to one side, you must do to the other

### Section 2: Solving with Addition/Subtraction
- Simplest equations: x + 3 = 7
- Explain inverse operations
- Multiple sliders to explore
- Difficulty levels: easy (x + a = b), medium (ax + b = c)

### Section 3: Solving with Multiplication/Division
- Equations like 2x = 10 or 3x = 12
- Build intuition: how division "undoes" multiplication
- Interactive exploration with visual feedback

### Section 4: Two-Step Equations
- Combine addition and multiplication: 2x + 3 = 11
- Show step-by-step process
- Interactive solver with hints
- Adaptive difficulty increases

### Section 5: Variables on Both Sides
- Equations like 2x + 3 = x + 7
- Strategy: move variables to one side first
- Interactive exploration
- Visual representation of "collecting like terms"

### Section 6: Match Pairs Game
- Match equations to their solutions
- Difficulty-adaptive pairs (easy: x + 2 = 5; hard: 3x - 2 = x + 6)
- Scoring based on performance

### Section 7: Equation Detective Game
- Given an equation and a claimed solution, verify it
- Find the missing value to balance an equation
- Adaptive difficulty based on performance

## Interactive Components

### EquationExplorer
- Visual balance scale showing both sides
- Sliders to adjust coefficients and constants
- Real-time calculation of result
- Shows the inverse operations needed

### EquationSolver
- Step-by-step guided problem solving
- Hint system unlocked after wrong attempts
- Supports all equation types covered
- Adaptive difficulty selection

### EquationMatchPairs
- Match equations to solutions
- Grid layout with adaptive difficulty
- Scoring system

### EquationDetective
- Given: equation and proposed solution
- Task: verify or find the correct solution
- Builds verification skills

## Adaptive Features

### Difficulty Progression
- **Easy**: One-step equations (x + a = b), small integers
- **Medium**: Two-step equations (ax + b = c), larger numbers, some decimals
- **Hard**: Variables on both sides (ax + b = cx + d), negative coefficients, fractions

### Skill Categories (for adaptive engine)
1. `one-step-add-subtract` - Equations with addition/subtraction only
2. `one-step-multiply-divide` - Equations with multiplication/division only
3. `two-step-basic` - Standard two-step (ax + b = c)
4. `two-step-order` - Equations requiring attention to order of operations
5. `both-sides` - Variables on both sides (ax + b = cx + d)
6. `verification` - Checking if a value is a solution

### Adaptive Engine Logic
- Track accuracy in each skill category
- Boost weight for weak categories (< 60% accuracy)
- Reduce weight for strong categories (> 85% accuracy)
- Promote difficulty after 3 consecutive correct answers
- Demote difficulty if 3 of last 4 are incorrect

## Translation Keys
All UI strings are i18n-enabled with keys like:
- `linearEquations.title`
- `linearEquations.balanceMetaphor`
- `linearEquations.inverseOperation`
- Etc.

## File Structure
```
outputs/
├── plan.md (this file)
├── translations-en.json (English i18n)
├── translations-pl.json (Polish i18n)
├── lessons-entry.json (Lesson registry entry)
└── src/
    ├── app/[locale]/highschool/linear-equations/
    │   └── page.tsx (Main lesson page)
    └── components/lessons/linear-equations/
        ├── EquationExplorer.tsx (Interactive explorer with sliders)
        ├── EquationSolver.tsx (Guided solver component)
        ├── EquationMatchPairs.tsx (Match pairs game with pairs generator)
        ├── EquationDetective.tsx (Detective game component)
        ├── equationUtils.ts (Utility functions)
        └── types.ts (TypeScript types)
```

## Key Concepts Covered

1. **Equation Structure**: ax + b = cx + d
2. **Inverse Operations**: Addition ↔ Subtraction, Multiplication ↔ Division
3. **Balance Principle**: Maintain equality on both sides
4. **Simplification**: Combine like terms, isolate variable
5. **Verification**: Check solution by substitution
6. **Different Equation Forms**: Fractions, decimals, negative numbers

## Assessment
- Game scores track accuracy across skill categories
- Adaptive engine provides performance summary
- Students see which skill areas need more practice
- Encourages replay to improve weaker areas
