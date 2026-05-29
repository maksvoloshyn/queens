import { ref, computed } from 'vue';
import { getDailyPuzzle, saveProgress, getProgress, saveScore } from '../services/db';
import { CELL_STATE, getInvalidQueens, checkWinCondition, MAX_BOARD_SIZE } from '../engine/gameLogic';

export function useGameState(dateString, usernameRef) {
  const grid = ref([]);
  const isLoading = ref(true);
  const isSolved = ref(false);
  const timerSeconds = ref(0);
  let timerInterval = null;

  async function initGame() {
    isLoading.value = true;

    const progress = await getProgress(dateString, usernameRef.value);

    if (progress && progress.grid) {
      grid.value = progress.grid;
      timerSeconds.value = progress.timerSeconds || 0;
      isSolved.value = progress.isSolved || false;
    } else {
      const puzzle = await getDailyPuzzle(dateString);

      if (puzzle && puzzle.regions) {
        const newGrid = [];

        for (let rowIndex = 0; rowIndex < MAX_BOARD_SIZE; rowIndex++) {
          const row = [];
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
      } else {
        console.warn("No puzzle found for today. Need to generate one in /preview.");
      }
    }

    if (grid.value.length > 0) {
      updateErrors();
      if (!isSolved.value) {
        startTimer();
      }
    }

    isLoading.value = false;
  }

  function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      timerSeconds.value++;
      if (timerSeconds.value % 10 === 0) {
        persistProgress();
      }
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
        grid.value[rowIndex][columnIndex].isError = invalidSet.has(`${rowIndex},${columnIndex}`);
      }
    }
  }

  function persistProgress() {
    if (usernameRef.value && !isSolved.value) {
      saveProgress(dateString, usernameRef.value, {
        grid: grid.value,
        timerSeconds: timerSeconds.value,
        isSolved: false
      });
    }
  }

  function handleUpdateCell(rowIndex, columnIndex) {
    if (isSolved.value) return;
    const cell = grid.value[rowIndex][columnIndex];

    if (cell.state === CELL_STATE.EMPTY) cell.state = CELL_STATE.CROSS;
    else if (cell.state === CELL_STATE.CROSS) cell.state = CELL_STATE.QUEEN;
    else cell.state = CELL_STATE.EMPTY;

    processMove();
  }

  function handleSwipeCell(rowIndex, columnIndex) {
    if (isSolved.value) return;
    const cell = grid.value[rowIndex][columnIndex];

    if (cell.state === CELL_STATE.EMPTY) {
      cell.state = CELL_STATE.CROSS;
      processMove();
    }
  }

  function processMove() {
    updateErrors();
    persistProgress();

    if (checkWinCondition(grid.value)) {
      isSolved.value = true;
      clearInterval(timerInterval);
      saveProgress(dateString, usernameRef.value, {
        grid: grid.value,
        timerSeconds: timerSeconds.value,
        isSolved: true
      });
      saveScore(dateString, usernameRef.value, timerSeconds.value);
    }
  }

  return {
    grid,
    isLoading,
    isSolved,
    formattedTime,
    initGame,
    handleUpdateCell,
    handleSwipeCell
  };
}
