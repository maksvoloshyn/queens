import { MAX_BOARD_SIZE } from './gameLogic';

export interface SimpleQueenCoord {
    rowIndex: number;
    columnIndex: number;
}

export interface Puzzle {
    regions: number[][];
    solution: SimpleQueenCoord[];
}

function createPRNG(seedString: string) {
    // Simple hash function to convert string to a 32-bit integer seed
    let seed = 0;
    for (let i = 0; i < seedString.length; i++) {
        seed = (seed * 31 + seedString.charCodeAt(i)) | 0;
    }

    // Mulberry32 generator
    return function () {
        let t = (seed += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export function generatePuzzle(seed?: string): Puzzle | null {
    const random = seed ? createPRNG(seed) : Math.random;
    const queens = placeQueens(random);
    if (!queens) return null;

    const regions = growRegions(queens, random);

    return {
        regions,
        solution: queens,
    };
}

function placeQueens(random: () => number): SimpleQueenCoord[] | null {
    const queens: SimpleQueenCoord[] = [];

    function solve(rowIndex: number): boolean {
        if (rowIndex === MAX_BOARD_SIZE) return true;

        // shuffle columns to get random boards
        const columns = Array.from(
            { length: MAX_BOARD_SIZE },
            (_, i) => i,
        ).sort(() => random() - 0.5);

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

function isValidPlacement(
    rowIndex: number,
    columnIndex: number,
    queens: SimpleQueenCoord[],
): boolean {
    for (const queen of queens) {
        if (queen.rowIndex === rowIndex || queen.columnIndex === columnIndex)
            return false;
        if (
            Math.abs(queen.rowIndex - rowIndex) <= 1 &&
            Math.abs(queen.columnIndex - columnIndex) <= 1
        )
            return false;
    }
    return true;
}

interface GrowQueueItem {
    rowIndex: number;
    columnIndex: number;
    regionId: number;
}

function growRegions(
    queens: SimpleQueenCoord[],
    random: () => number,
): number[][] {
    const grid: number[][] = Array(MAX_BOARD_SIZE)
        .fill(0)
        .map(() => Array(MAX_BOARD_SIZE).fill(-1));
    const queue: GrowQueueItem[] = [];

    queens.forEach((queen, index) => {
        grid[queen.rowIndex][queen.columnIndex] = index;
        queue.push({
            rowIndex: queen.rowIndex,
            columnIndex: queen.columnIndex,
            regionId: index,
        });
    });

    while (queue.length > 0) {
        const queueIndex = Math.floor(random() * queue.length);
        const current = queue[queueIndex];
        queue.splice(queueIndex, 1);

        const directions: [number, number][] = [
            [0, 1],
            [1, 0],
            [0, -1],
            [-1, 0],
        ];
        directions.sort(() => random() - 0.5);

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
                queue.push({
                    rowIndex: current.rowIndex,
                    columnIndex: current.columnIndex,
                    regionId: current.regionId,
                });
                // Add new child
                queue.push({
                    rowIndex: neighborRow,
                    columnIndex: neighborCol,
                    regionId: current.regionId,
                });
                break;
            }
        }
    }

    return grid;
}
