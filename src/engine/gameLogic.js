export const CELL_STATE = {
  EMPTY: 0,
  CROSS: 1,
  QUEEN: 2,
};

export const MAX_BOARD_SIZE = 8;

// Analyzes the board and returns a Set of string coordinates ("rowIndex,columnIndex") of queens that violate rules
export function getInvalidQueens(board) {
  const invalidCells = new Set();
  const queens = [];

  // Find all queens
  for (let rowIndex = 0; rowIndex < MAX_BOARD_SIZE; rowIndex++) {
    for (let columnIndex = 0; columnIndex < MAX_BOARD_SIZE; columnIndex++) {
      if (board[rowIndex][columnIndex].state === CELL_STATE.QUEEN) {
        queens.push({ rowIndex, columnIndex, regionId: board[rowIndex][columnIndex].regionId });
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

export function checkWinCondition(board) {
  let queenCount = 0;
  for (let rowIndex = 0; rowIndex < MAX_BOARD_SIZE; rowIndex++) {
    for (let columnIndex = 0; columnIndex < MAX_BOARD_SIZE; columnIndex++) {
      if (board[rowIndex][columnIndex].state === CELL_STATE.QUEEN) {
        queenCount++;
      }
    }
  }
  
  if (queenCount !== MAX_BOARD_SIZE) return false;
  
  const invalidQueens = getInvalidQueens(board);
  return invalidQueens.size === 0;
}
