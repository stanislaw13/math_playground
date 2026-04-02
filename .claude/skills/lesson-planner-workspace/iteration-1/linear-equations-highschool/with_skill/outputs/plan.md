# Lesson Plan: Solving Linear Equations (High School)

## Assumptions Made
Since the user request was minimal ("Just the basics — one variable, both sides"), I've made the following reasonable assumptions about what a high school linear equations lesson should cover:

1. **Topics to cover:**
   - Solving one-step equations (addition/subtraction)
   - Solving two-step equations (multiplication/division after addition/subtraction)
   - Solving equations with variables on both sides
   - Solving equations requiring combining like terms
   - Solving equations with simple distribution/parentheses
   - Simple word problem applications

2. **Grade level:** High school (grades 9-10), foundational algebra skills

3. **Prerequisites:** Students should already know:
   - Basic arithmetic operations
   - Properties of equality (what you do to one side, you do to the other)
   - Integer and simple fraction arithmetic

4. **Game preferences:** Mix of different game mechanics:
   - Interactive explorer for visualizing equation solving
   - Match-pairs for equation-to-solution matching
   - Two adaptive practice games with different question types

---

## Lesson Structure

### Section 1: Interactive Explorer (Theory)
**"Build an Equation"** - Students explore how equations balance and how operations affect both sides.

Interactive components:
- **Equation Balance Visualizer**: Visual representation of an equation as a balanced scale
- Sliders/inputs to add/subtract/multiply/divide both sides simultaneously
- Shows how the equation stays balanced when applying the same operation to both sides
- Visual feedback: scale tips if operations aren't equal on both sides

**Key concepts covered:**
- Equation as a statement of equality
- Both sides must remain balanced
- Inverse operations

---

### Section 2: Interactive Explorer (Theory)
**"Step-by-Step Solver"** - Students work through solving equations interactively with visual feedback.

Interactive components:
- Shows an unsolved equation
- Step selector: students choose the operation needed (add, subtract, multiply, divide)
- Visual representation of the operation on both sides
- Automatic feedback on whether the move was logical
- Guides students toward the solution step-by-step

**Key concepts covered:**
- Order of operations for solving (work backwards from operations)
- Isolating the variable
- Inverse operations application

---

### Section 3-6: Four Adaptive Games

#### Game 1: **Equation Solver** (Detective-style)
Students solve increasingly complex equations with adaptive difficulty.

**Skill Categories:**
1. `one-step-add-sub` - One-step addition/subtraction (e.g., x + 5 = 12)
2. `one-step-mult-div` - One-step multiplication/division (e.g., 3x = 15)
3. `two-step` - Two-step equations (e.g., 2x + 3 = 7)
4. `variables-both-sides` - Variables on both sides (e.g., 2x + 1 = x + 5)
5. `combining-like-terms` - Equations requiring combining like terms (e.g., 2x + 3x = 10)

**Difficulty Scaling:**
- Easy: Integer coefficients, positive numbers, one or two operations
- Medium: Negative numbers, fractions with halves/thirds, combination of operations
- Hard: Larger numbers, mixed operations, more complex variable distribution

**Total Questions:** 12

**Question Generation:**
- Generates equations of appropriate complexity for category and difficulty
- Uses adaptiveInt() for number ranges
- Equation variables are x, y, or z with visual display
- Multiple hint steps: identify operation needed, set up inverse, solve

---

#### Game 2: **Equation Match** (MatchPairsGame)
Card matching game: equations on left, solutions on right.

**Pairs (8-10):**
- x + 5 = 12 ↔ 7
- 3x = 15 ↔ 5
- 2x + 1 = 7 ↔ 3
- x/2 = 4 ↔ 8
- 2x + 3x = 15 ↔ 3
- 4x - 2 = 10 ↔ 3
- x + x = 8 ↔ 4
- 5x = 20 ↔ 4
- 3x + 2 = 11 ↔ 3
- x - 7 = 2 ↔ 9

**Gameplay:** Students flip cards to find matches. Scoring based on efficiency (fewer wrong guesses).

---

#### Game 3: **Solve the Challenge** (ShapeBuilder-style adapted for algebra)
Students manipulate an equation using slider/input controls to match a target solution.

**Mechanic:**
- Shows: "Equation: ___ x + ___ = ___"
- Target solution shown: "Solve for x = 5"
- Students adjust the blanks (coefficients and constant)
- Visual feedback shows whether equation is solvable to the target
- Check button verifies the equation

**Skill Categories:**
1. `construction-simple` - Build simple equations
2. `construction-balance` - Build balanced equations with operations on both sides
3. `construction-complex` - Build equations with multiple terms

**Difficulty:** Constraints on valid numbers increase with difficulty.

**Total Questions:** 10

---

#### Game 4: **Word Problem Solver** (Adaptive text-to-equation game)
Students convert word problems to equations and solve.

**Skill Categories:**
1. `wp-single-operation` - "A number increased by 5 equals 12. Find the number."
2. `wp-two-operations` - "Twice a number plus 3 equals 11. Find the number."
3. `wp-two-variables-scenario` - "Tom has twice as many marbles as Sarah. Together they have 12. How many does Tom have?"

**Difficulty Scaling:**
- Easy: Simple language, single operation
- Medium: Slightly complex language, two operations
- Hard: Complex scenarios, multiple relationships

**Total Questions:** 10

---

## Formulas Sidebar

Display key formulas and rules:

1. **Addition/Subtraction Property of Equality**
   - If a = b, then a + c = b + c
   - If a = b, then a - c = b - c

2. **Multiplication/Division Property of Equality**
   - If a = b, then a × c = b × c
   - If a = b, then a ÷ c = b ÷ c (c ≠ 0)

3. **General Steps**
   - Distribute (if needed)
   - Combine like terms
   - Undo addition/subtraction
   - Undo multiplication/division

---

## Learning Progression

**Difficulty Flow:**
1. Users start with simple one-step equations
2. Engine tracks performance on different operation types
3. Weak areas get more practice
4. Difficulty scales: easy → medium → hard within each category
5. By end of lesson, students should master multi-step equations

**Adaptive Engine Ensures:**
- Students who struggle with multiplication spend more time on multiplication-related problems
- Students who master one category quickly move to harder problems in weak areas
- Overall balanced practice with emphasis on struggling skill categories

---

## Key Design Principles Applied

✓ **Interactive, not passive:** Explorers with sliders and visual feedback, not just text
✓ **Adaptive:** All games use the adaptive engine for intelligent question selection
✓ **Varied mechanics:** 4 different game types to maintain engagement
✓ **Clear hints:** 3-step hints for each problem (identify operation, set up, solve)
✓ **Age-appropriate:** High school level with real-world word problems
✓ **Accessible:** Gradual progression from simple to complex
✓ **Scaffolded:** Theory section before games, explorers build intuition

---

## Files to Generate

1. `src/app/[locale]/highschool/linear-equations/page.tsx` - Main lesson page
2. `src/components/lessons/linear-equations/EquationBalanceExplorer.tsx` - Balance visualization
3. `src/components/lessons/linear-equations/StepByStepSolver.tsx` - Interactive solver explorer
4. `src/components/lessons/linear-equations/EquationSolver.tsx` - Detective-style game
5. `src/components/lessons/linear-equations/SolveTheChallenge.tsx` - Constructor game
6. `src/components/lessons/linear-equations/WordProblemSolver.tsx` - Word problem game
7. `src/components/lessons/linear-equations/linearEquationMatchPairs.tsx` - Pair generator
8. `src/components/lessons/linear-equations/linearEquationSVGs.tsx` - Visual diagrams (if needed)
9. `outputs/lessons-entry.json` - Entry for lessons.ts
10. `outputs/translations-en.json` - English translations
11. `outputs/translations-pl.json` - Polish translations
