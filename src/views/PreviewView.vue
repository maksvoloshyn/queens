<script setup>
import { ref } from 'vue';
import Board from '../components/Board.vue';
import { generatePuzzle } from '../engine/puzzleGenerator';
import { savePuzzle } from '../services/db';
import { MAX_BOARD_SIZE } from '../engine/gameLogic';

const puzzleGrid = ref([]);
const puzzleData = ref(null);
const targetDate = ref('');
const isSaved = ref(false);

function generate() {
  isSaved.value = false;
  const puzzle = generatePuzzle();
  if (puzzle) {
    puzzleData.value = puzzle;
    const grid = [];
    for (let rowIndex = 0; rowIndex < MAX_BOARD_SIZE; rowIndex++) {
      const row = [];
      for (let columnIndex = 0; columnIndex < MAX_BOARD_SIZE; columnIndex++) {
        row.push({
          state: 0,
          regionId: puzzle.regions[rowIndex][columnIndex],
          isError: false
        });
      }
      grid.push(row);
    }
    puzzleGrid.value = grid;
  }
}

async function handleApprove() {
  if (!targetDate.value || !puzzleData.value) return;
  const success = await savePuzzle(targetDate.value, {
    regions: puzzleData.value.regions
  });
  if (success) {
    isSaved.value = true;
  }
}
</script>

<template>
  <div class="admin-container">
    <h2>Admin: Generate Puzzle</h2>
    
    <div class="controls">
      <button @click="generate" class="gen-btn">Generate Random Puzzle</button>
    </div>
    
    <div v-if="puzzleGrid.length > 0" class="preview-area">
      <Board :grid="puzzleGrid" @update-cell="() => {}" @swipe-cell="() => {}" />
      
      <div class="save-section">
        <label>Date to feature this puzzle:</label>
        <input type="date" v-model="targetDate" />
        <button :disabled="!targetDate" @click="handleApprove" class="save-btn">
          Approve & Save to Firebase
        </button>
        <div v-if="isSaved" class="success">Saved to DB for {{ targetDate }}!</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-container {
  padding: 1rem;
  max-width: 500px;
  margin: 0 auto;
}

h2 {
  color: var(--primary-color);
  text-align: center;
}

.controls {
  text-align: center;
  margin-bottom: 2rem;
}

button {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  font-weight: bold;
  cursor: pointer;
}

.gen-btn {
  background-color: var(--primary-color);
  color: white;
}

.save-btn {
  background-color: #10b981;
  color: white;
  width: 100%;
  margin-top: 1rem;
}

.save-btn:disabled {
  background-color: #475569;
  cursor: not-allowed;
}

.save-section {
  margin-top: 2rem;
  background: rgba(255,255,255,0.05);
  padding: 1rem;
  border-radius: 8px;
}

input[type="date"] {
  width: 100%;
  padding: 0.75rem;
  margin-top: 0.5rem;
  border-radius: 8px;
  border: 1px solid #334155;
  background: #0f172a;
  color: white;
  box-sizing: border-box;
}

.success {
  margin-top: 1rem;
  color: #34d399;
  font-weight: bold;
  text-align: center;
}
</style>
