<script setup>
import { computed } from 'vue';

const props = defineProps({
  state: Number, // 0: empty, 1: X, 2: Queen
  regionId: Number,
  isError: Boolean, // if the queen here violates a rule
  grid: Array, // full 2D grid array (optional)
  rowIndex: Number, // current row index (optional)
  columnIndex: Number, // current column index (optional)
});

const emit = defineEmits(['cell-pointer-down', 'cell-pointer-enter']);

const regionColors = [
  '#fecaca', // 0: Pastel Red
  '#fef08a', // 1: Pastel Yellow
  '#bbf7d0', // 2: Pastel Green
  '#bfdbfe', // 3: Pastel Blue
  '#d8b4fe', // 4: Soft Pastel Purple (Lavender)
  '#fed7aa', // 5: Pastel Orange
  '#99f6e4', // 6: Pastel Teal
  '#fbcfe8'  // 7: Soft Pastel Pink
];

const bgColor = computed(() => regionColors[props.regionId % regionColors.length]);

const borderStyle = computed(() => {
  if (!props.grid || props.rowIndex === undefined || props.columnIndex === undefined) {
    return {
      border: '1px solid rgba(0, 0, 0, 0.12)'
    };
  }

  const rowIndex = props.rowIndex;
  const columnIndex = props.columnIndex;
  const regionId = props.regionId;
  const boardSize = props.grid.length;

  // Determine borders by checking adjacent cells to outline the region boundaries
  const isTopBorderThick = rowIndex === 0 || props.grid[rowIndex - 1][columnIndex].regionId !== regionId;
  const isBottomBorderThick = rowIndex === boardSize - 1 || props.grid[rowIndex + 1][columnIndex].regionId !== regionId;
  const isLeftBorderThick = columnIndex === 0 || props.grid[rowIndex][columnIndex - 1].regionId !== regionId;
  const isRightBorderThick = columnIndex === boardSize - 1 || props.grid[rowIndex][columnIndex + 1].regionId !== regionId;

  const thickBorder = '1px solid rgba(0, 0, 0, 0.4)';
  const thinBorder = '1px solid rgba(0, 0, 0, 0.08)';

  return {
    borderTop: isTopBorderThick ? thickBorder : thinBorder,
    borderBottom: isBottomBorderThick ? thickBorder : thinBorder,
    borderLeft: isLeftBorderThick ? thickBorder : thinBorder,
    borderRight: isRightBorderThick ? thickBorder : thinBorder,
  };
});
</script>

<template>
  <div 
    class="cell" 
    :style="{ backgroundColor: bgColor, ...borderStyle }"
    :class="{ 'has-error': isError }"
    @pointerdown.prevent="emit('cell-pointer-down', $event)"
    @pointerenter.prevent="emit('cell-pointer-enter')"
  >
    <div v-if="state === 1" class="mark cross">✕</div>
    <div v-else-if="state === 2" class="mark queen">👑</div>
  </div>
</template>

<style scoped>
.cell {
  width: var(--cell-size);
  height: var(--cell-size);
  max-width: 60px;
  max-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: calc(var(--cell-size) * 0.4);
  cursor: pointer;
  transition: transform 0.1s, background-color 0.2s;
  box-sizing: border-box;
}

.cell.has-error {
  background-color: var(--error-color) !important;
  animation: shake 0.4s;
}

.mark {
  pointer-events: none; /* Let pointer events pass to cell */
  user-select: none;
}

.cross {
  color: rgba(0, 0, 0, 0.3);
  font-weight: bold;
}

.queen {
  font-size: calc(var(--cell-size) * 0.55);
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}
</style>
