<script setup>
import { ref } from 'vue';
import Cell from './Cell.vue';

const props = defineProps({
  grid: Array, // 2D array of { state, regionId, isError }
});

const emit = defineEmits(['update-cell', 'swipe-cell']);

const isSwiping = ref(false);
const lastSwipedCell = ref(null);

function handlePointerDown(rowIndex, columnIndex) {
  isSwiping.value = true;
  lastSwipedCell.value = `${rowIndex},${columnIndex}`;
  emit('update-cell', rowIndex, columnIndex);
}

function handlePointerMove(e) {
  if (!isSwiping.value) return;
  
  const element = document.elementFromPoint(e.clientX, e.clientY);
  if (!element) return;
  
  const cellEl = element.closest('[data-row]');
  if (cellEl) {
    const rowIndex = parseInt(cellEl.dataset.row, 10);
    const columnIndex = parseInt(cellEl.dataset.col, 10);
    const cellKey = `${rowIndex},${columnIndex}`;
    
    if (lastSwipedCell.value !== cellKey) {
      lastSwipedCell.value = cellKey;
      emit('swipe-cell', rowIndex, columnIndex);
    }
  }
}

function handlePointerUp() {
  isSwiping.value = false;
  lastSwipedCell.value = null;
}
</script>

<template>
  <div 
    class="board" 
    @pointermove.prevent="handlePointerMove"
    @pointerup="handlePointerUp" 
    @pointerleave="handlePointerUp"
    @pointercancel="handlePointerUp"
  >
    <div v-for="(row, rowIndex) in grid" :key="'r' + rowIndex" class="row">
      <Cell 
        v-for="(cell, columnIndex) in row" 
        :key="'c' + columnIndex"
        :data-row="rowIndex"
        :data-col="columnIndex"
        :state="cell.state"
        :region-id="cell.regionId"
        :is-error="cell.isError"
        @cell-pointer-down="handlePointerDown(rowIndex, columnIndex)"
      />
    </div>
  </div>
</template>

<style scoped>
.board {
  display: flex;
  flex-direction: column;
  touch-action: none;
  border: 4px solid #1e293b;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  margin: 1rem auto;
  width: fit-content;
  background-color: #0f172a;
}
.row {
  display: flex;
}
</style>
