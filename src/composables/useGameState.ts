import { ref, computed, Ref } from 'vue';
import { getDailyPuzzle, saveScore, getLeaderboard, saveLocalProgress, getLocalProgress } from '../services/db';
import type { LeaderboardScore } from '../services/db';
import { CELL_STATE, getInvalidQueens, checkWinCondition, MAX_BOARD_SIZE } from '../engine/gameLogic';
import type { Board } from '../engine/gameLogic';

export function useGameState(dateString: string, usernameRef: Ref<string>) {
  const grid = ref<Board>([]);
  const isLoading = ref(true);
  const isSolved = ref(false);
  const timerSeconds = ref(0);
  const leaderboardScores = ref<LeaderboardScore[]>([]);
  let timerInterval: ReturnType<typeof setInterval> | null = null;

  async function initGame() {
    isLoading.value = true;
    if (timerInterval) clearInterval(timerInterval);
    timerSeconds.value = 0;
    isSolved.value = false;

    // 2. Fetch daily puzzle and leaderboard concurrently
    const [puzzle, leaderboard] = await Promise.all([
      getDailyPuzzle(dateString),
      getLeaderboard(dateString)
    ]);

    leaderboardScores.value = leaderboard;

    // 4. Check if user name is in leaderboard, if it is, the puzzle is solved.
    const hasSolved = leaderboard.some(s => s.username === usernameRef.value);

    // Retrieve local progress (if any)
    const localProgress = getLocalProgress(dateString, usernameRef.value);

    if (puzzle && puzzle.regions) {
      if (hasSolved) {
        isSolved.value = true;
        // If local progress exists, use it so we see custom queens and crosses
        if (localProgress && localProgress.grid) {
          grid.value = localProgress.grid;
          timerSeconds.value = localProgress.timerSeconds;
        } else {
          // Fallback to solution from puzzle data
          const newGrid: Board = [];
          for (let rowIndex = 0; rowIndex < MAX_BOARD_SIZE; rowIndex++) {
            const row: Board[number] = [];
            for (let columnIndex = 0; columnIndex < MAX_BOARD_SIZE; columnIndex++) {
              const isQueen = puzzle.solution?.some(
                s => s.rowIndex === rowIndex && s.columnIndex === columnIndex
              );
              row.push({
                state: isQueen ? CELL_STATE.QUEEN : CELL_STATE.EMPTY,
                regionId: puzzle.regions[rowIndex][columnIndex],
                isError: false
              });
            }
            newGrid.push(row);
          }
          grid.value = newGrid;

          // Set timer to completion time from leaderboard
          const userScore = leaderboard.find(s => s.username === usernameRef.value);
          timerSeconds.value = userScore ? userScore.timeSeconds : 0;
        }
      } else {
        // Active play: load local progress if it exists, otherwise initialize empty board
        if (localProgress && localProgress.grid) {
          grid.value = localProgress.grid;
          timerSeconds.value = localProgress.timerSeconds;
        } else {
          const newGrid: Board = [];
          for (let rowIndex = 0; rowIndex < MAX_BOARD_SIZE; rowIndex++) {
            const row: Board[number] = [];
            for (let columnIndex = 0; columnIndex < MAX_BOARD_SIZE; columnIndex++) {
              row.push({
                state: CELL_STATE.EMPTY,
                regionId: puzzle.regions[rowIndex][columnIndex],
                isError: false
              });
            }
            newGrid.push(row);
          }
          grid.value = newGrid;
        }

        updateErrors();
        startTimer();
      }
    } else {
      console.warn("No puzzle found for today.");
    }

    isLoading.value = false;
  }

  function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      timerSeconds.value++;
      persistProgress();
    }, 1000);
  }

  const formattedTime = computed(() => {
    const minutes = Math.floor(timerSeconds.value / 60);
    const seconds = timerSeconds.value % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  });

  function updateErrors() {
    const invalidSet = getInvalidQueens(grid.value);
    for (let rowIndex = 0; rowIndex < MAX_BOARD_SIZE; rowIndex++) {
      for (let columnIndex = 0; columnIndex < MAX_BOARD_SIZE; columnIndex++) {
        const cell = grid.value[rowIndex]?.[columnIndex];
        if (cell) {
          cell.isError = invalidSet.has(`${rowIndex},${columnIndex}`);
        }
      }
    }
  }

  function persistProgress() {
    if (usernameRef.value && !isSolved.value) {
      saveLocalProgress(dateString, usernameRef.value, {
        grid: grid.value,
        timerSeconds: timerSeconds.value,
        isSolved: false
      });
    }
  }

  function handleUpdateCell(rowIndex: number, columnIndex: number) {
    if (isSolved.value) return; // Locked: user cannot solve it again
    const cell = grid.value[rowIndex]?.[columnIndex];
    if (!cell) return;

    if (cell.state === CELL_STATE.EMPTY) cell.state = CELL_STATE.CROSS;
    else if (cell.state === CELL_STATE.CROSS) cell.state = CELL_STATE.QUEEN;
    else cell.state = CELL_STATE.EMPTY;

    processMove();
  }

  function handleSwipeCell(rowIndex: number, columnIndex: number) {
    if (isSolved.value) return; // Locked: user cannot solve it again
    const cell = grid.value[rowIndex]?.[columnIndex];
    if (!cell) return;

    if (cell.state === CELL_STATE.EMPTY) {
      cell.state = CELL_STATE.CROSS;
      processMove();
    } else if (cell.state === CELL_STATE.CROSS) {
      cell.state = CELL_STATE.EMPTY;
      processMove();
    }
  }

  async function processMove() {
    updateErrors();
    persistProgress();

    if (checkWinCondition(grid.value)) {
      isSolved.value = true;
      if (timerInterval) clearInterval(timerInterval);

      // Save score to Firebase Leaderboard
      await saveScore(dateString, usernameRef.value, timerSeconds.value);

      // Save final solved progress locally so we retain all custom crosses & queens on reload
      saveLocalProgress(dateString, usernameRef.value, {
        grid: grid.value,
        timerSeconds: timerSeconds.value,
        isSolved: true
      });

      // Refetch updated leaderboard to display immediately
      leaderboardScores.value = await getLeaderboard(dateString);
    }
  }

  return {
    grid,
    isLoading,
    isSolved,
    formattedTime,
    leaderboardScores,
    initGame,
    handleUpdateCell,
    handleSwipeCell
  };
}
