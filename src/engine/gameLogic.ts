export const CELL_STATE = {
  EMPTY: 0,
  CROSS: 1,
  QUEEN: 2,
} as const;

export type CellState = typeof CELL_STATE[keyof typeof CELL_STATE];

export const MAX_BOARD_SIZE = 8;

export interface Cell {
  state: CellState;
  regionId: number;
  isError: boolean;
}

export type Board = Cell[][];

export interface QueenCoord {
  rowIndex: number;
  columnIndex: number;
  regionId: number;
}

// Analyzes the board and returns a Set of string coordinates ("rowIndex,columnIndex")
// of queens that violate rules
export function getInvalidQueens(board: Board): Set<string> {
  const invalidCells = new Set<string>();
  const queens: QueenCoord[] = [];

  // Find all queens
  for (let rowIndex = 0; rowIndex < MAX_BOARD_SIZE; rowIndex++) {
    for (let columnIndex = 0; columnIndex < MAX_BOARD_SIZE; columnIndex++) {
      const cell = board[rowIndex]?.[columnIndex];
      if (cell && cell.state === CELL_STATE.QUEEN) {
        queens.push({ rowIndex, columnIndex, regionId: cell.regionId });
      }
    }
  }

  // Check pairs
  for (let i = 0; i < queens.length; i++) {
    for (let j = i + 1; j < queens.length; j++) {
      const firstQueen = queens[i];
      const secondQueen = queens[j];
      let isPlacementInvalid = false;

      // Rule 1: Same row
      if (firstQueen.rowIndex === secondQueen.rowIndex) isPlacementInvalid = true;
      // Rule 2: Same column
      if (firstQueen.columnIndex === secondQueen.columnIndex) isPlacementInvalid = true;
      // Rule 3: Same region
      if (firstQueen.regionId === secondQueen.regionId) isPlacementInvalid = true;
      // Rule 4: Touching diagonally or orthogonally
      if (Math.abs(firstQueen.rowIndex - secondQueen.rowIndex) <= 1 && Math.abs(firstQueen.columnIndex - secondQueen.columnIndex) <= 1) isPlacementInvalid = true;

      if (isPlacementInvalid) {
        invalidCells.add(`${firstQueen.rowIndex},${firstQueen.columnIndex}`);
        invalidCells.add(`${secondQueen.rowIndex},${secondQueen.columnIndex}`);
      }
    }
  }

  return invalidCells;
}

export function checkWinCondition(board: Board): boolean {
  let queenCount = 0;
  for (let rowIndex = 0; rowIndex < MAX_BOARD_SIZE; rowIndex++) {
    for (let columnIndex = 0; columnIndex < MAX_BOARD_SIZE; columnIndex++) {
      const cell = board[rowIndex]?.[columnIndex];
      if (cell && cell.state === CELL_STATE.QUEEN) {
        queenCount++;
      }
    }
  }

  if (queenCount !== MAX_BOARD_SIZE) return false;

  const invalidQueens = getInvalidQueens(board);
  return invalidQueens.size === 0;
}
