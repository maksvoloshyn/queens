# Coding Guidelines & Best Practices

These guidelines govern the codebase for the Queens game clone to ensure it remains maintainable, readable, and robust.

## 1. Core Philosophy: Readability over Smartness
- **Keep it Simple:** Write code that is easy to understand at a glance. Avoid "clever" one-liners or complex ternary chains. If a piece of logic requires a comment to explain *what* it does, it should be refactored to be self-documenting.
- **Explicit is better than implicit:** Avoid side effects in functions. Functions should ideally be pure, taking inputs and returning outputs without mutating global state unexpectedly.

## 2. Naming Conventions
- **Meaningful Variables:** Use descriptive names that convey intent. `rowIndex`, `columnIndex`, `gridCells` instead of `r`, `c`, `arr`. Single-letter variables are only acceptable as loop indices in tight scopes (`i`, `j`).
- **Booleans:** Prefix boolean variables with `is`, `has`, `should`, or `can` (e.g., `isPuzzleSolved`, `hasQueen`).
- **Casing:**
  - `camelCase` for variables, functions, and properties.
  - `PascalCase` for Vue components and classes (e.g., `GameBoard.vue`).
  - `UPPER_SNAKE_CASE` for constants (e.g., `MAX_BOARD_SIZE = 8`).
- **Event Handlers:** Prefix functions that handle events with `handle` (e.g., `handleCellTap`, `handleSwipe`).

## 3. Vue 3 Specific Guidelines
- **Composition API:** Exclusively use `<script setup>` with Vue 3's Composition API for all components.
- **Separation of Concerns:** If a component's `<script setup>` grows too large (e.g., complex game logic), extract that logic into a dedicated composable (e.g., `useGameEngine.js` or `useFirebaseSync.js`).
- **Props and Emits:** Explicitly define `props` and `emits`. Avoid mutating props directly within child components.

## 4. State Management & Firebase Integration
- **Encapsulation:** Do not scatter Firebase calls throughout UI components. Create a dedicated service or composable (e.g., `firebaseService.js`) to handle reading/writing puzzles, updating the leaderboard, and syncing progress.
- **Optimistic UI:** When the user makes a move, update the local state immediately for a snappy experience, then sync to Firebase in the background.
- **Graceful Failure:** Ensure the app handles offline states or failed database writes gracefully without crashing.

## 5. CSS & Styling
- **Scoped Styles:** Use `<style scoped>` in Vue components to ensure styles do not leak.
- **CSS Variables:** Define a core color palette and sizing variables in a global `styles.css` file to maintain visual consistency.
- **Mobile First:** Since the app is mobile-focused, use viewport-relative units (`vh`, `vw`, `vmin`) or flexible flexbox/grid layouts to ensure it scales elegantly on different phone sizes.

## 6. Puzzle Logic specific
- Separate the raw game algorithms (validating rules, checking if queens touch) from the UI components. These should be pure JavaScript functions that are easily testable.
