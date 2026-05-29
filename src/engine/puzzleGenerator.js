import { MAX_BOARD_SIZE } from './gameLogic';

export function generatePuzzle() {
  const queens = placeQueens();
  if (!queens) return null;

  const regions = growRegions(queens);
  
  return {
    regions,
    solution: queens
  };
}

function placeQueens() {
  const queens = [];
  
  function solve(rowIndex) {
    if (rowIndex === MAX_BOARD_SIZE) return true;
    
    // shuffle columns to get random boards
    const columns = Array.from({length: MAX_BOARD_SIZE}, (_, i) => i).sort(() => Math.random() - 0.5);
    
    for (let columnIndex of columns) {
      if (isValidPlacement(rowIndex, columnIndex, queens)) {
        queens.push({ rowIndex, columnIndex });
        if (solve(rowIndex + 1)) return true;
        queens.pop();
      }
    }
    return false;
  }
  
  if (solve(0)) return queens;
  return null;
}

function isValidPlacement(rowIndex, columnIndex, queens) {
  for (let queen of queens) {
    if (queen.rowIndex === rowIndex || queen.columnIndex === columnIndex) return false;
    if (Math.abs(queen.rowIndex - rowIndex) <= 1 && Math.abs(queen.columnIndex - columnIndex) <= 1) return false;
  }
  return true;
}

function growRegions(queens) {
  const grid = Array(MAX_BOARD_SIZE).fill(0).map(() => Array(MAX_BOARD_SIZE).fill(-1));
  const queue = [];
  
  queens.forEach((queen, index) => {
    grid[queen.rowIndex][queen.columnIndex] = index;
    queue.push({ rowIndex: queen.rowIndex, columnIndex: queen.columnIndex, regionId: index });
  });
  
  while (queue.length > 0) {
    const queueIndex = Math.floor(Math.random() * queue.length);
    const current = queue[queueIndex];
    queue.splice(queueIndex, 1);
    
    const directions = [[0,1],[1,0],[0,-1],[-1,0]];
    directions.sort(() => Math.random() - 0.5);
    
    for (let [dRow, dCol] of directions) {
      const neighborRow = current.rowIndex + dRow;
      const neighborCol = current.columnIndex + dCol;
      
      if (neighborRow >= 0 && neighborRow < MAX_BOARD_SIZE && neighborCol >= 0 && neighborCol < MAX_BOARD_SIZE && grid[neighborRow][neighborCol] === -1) {
        grid[neighborRow][neighborCol] = current.regionId;
        queue.push({ rowIndex: current.rowIndex, columnIndex: current.columnIndex, regionId: current.regionId }); // Re-add parent
        queue.push({ rowIndex: neighborRow, columnIndex: neighborCol, regionId: current.regionId }); // Add new child
        break;
      }
    }
  }
  
  return grid;
}
