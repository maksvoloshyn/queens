<script setup>
import { computed } from 'vue';

const props = defineProps({
  state: Number, // 0: empty, 1: X, 2: Queen
  regionId: Number,
  isError: Boolean, // if the queen here violates a rule
});

const emit = defineEmits(['cell-pointer-down', 'cell-pointer-enter']);

const regionColors = [
  '#fecaca', '#fef08a', '#bbf7d0', '#bfdbfe',
  '#e9d5ff', '#fed7aa', '#99f6e4', '#fbcfe8'
];

const bgColor = computed(() => regionColors[props.regionId % regionColors.length]);
</script>

<template>
  <div 
    class="cell" 
    :style="{ backgroundColor: bgColor }"
    :class="{ 'has-error': isError }"
    @pointerdown.prevent="emit('cell-pointer-down')"
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
  border: 1px solid rgba(0, 0, 0, 0.1);
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
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
  font-size: calc(var(--cell-size) * 0.55);
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}
</style>
