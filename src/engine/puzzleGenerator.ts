import { MAX_BOARD_SIZE } from './gameLogic';

export interface SimpleQueenCoord {
  rowIndex: number;
  columnIndex: number;
}

export interface Puzzle {
  regions: number[][];
  solution: SimpleQueenCoord[];
}

export function generatePuzzle(): Puzzle | null {
  const queens = placeQueens();
  if (!queens) return null;

  const regions = growRegions(queens);
  
  return {
    regions,
    solution: queens
  };
}

function placeQueens(): SimpleQueenCoord[] | null {
  const queens: SimpleQueenCoord[] = [];
  
  function solve(rowIndex: number): boolean {
    if (rowIndex === MAX_BOARD_SIZE) return true;
    
    // shuffle columns to get random boards
    const columns = Array.from({ length: MAX_BOARD_SIZE }, (_, i) => i).sort(() => Math.random() - 0.5);
    
    for (const columnIndex of columns) {
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

function isValidPlacement(rowIndex: number, columnIndex: number, queens: SimpleQueenCoord[]): boolean {
  for (const queen of queens) {
    if (queen.rowIndex === rowIndex || queen.columnIndex === columnIndex) return false;
    if (Math.abs(queen.rowIndex - rowIndex) <= 1 && Math.abs(queen.columnIndex - columnIndex) <= 1) return false;
  }
  return true;
}

interface GrowQueueItem {
  rowIndex: number;
  columnIndex: number;
  regionId: number;
}

function growRegions(queens: SimpleQueenCoord[]): number[][] {
  const grid: number[][] = Array(MAX_BOARD_SIZE).fill(0).map(() => Array(MAX_BOARD_SIZE).fill(-1));
  const queue: GrowQueueItem[] = [];
  
  queens.forEach((queen, index) => {
    grid[queen.rowIndex][queen.columnIndex] = index;
    queue.push({ rowIndex: queen.rowIndex, columnIndex: queen.columnIndex, regionId: index });
  });
  
  while (queue.length > 0) {
    const queueIndex = Math.floor(Math.random() * queue.length);
    const current = queue[queueIndex];
    queue.splice(queueIndex, 1);
    
    const directions: [number, number][] = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    directions.sort(() => Math.random() - 0.5);
    
    for (const [dRow, dCol] of directions) {
      const neighborRow = current.rowIndex + dRow;
      const neighborCol = current.columnIndex + dCol;
      
      if (
        neighborRow >= 0 &&
        neighborRow < MAX_BOARD_SIZE &&
        neighborCol >= 0 &&
        neighborCol < MAX_BOARD_SIZE &&
        grid[neighborRow][neighborCol] === -1
      ) {
        grid[neighborRow][neighborCol] = current.regionId;
        // Re-add parent to keep growing from it
        queue.push({ rowIndex: current.rowIndex, columnIndex: current.columnIndex, regionId: current.regionId });
        // Add new child
        queue.push({ rowIndex: neighborRow, columnIndex: neighborCol, regionId: current.regionId });
        break;
      }
    }
  }
  
  return grid;
}
