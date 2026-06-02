<script setup lang="ts">
import { ref } from 'vue';
import Cell from './Cell.vue';
import type { Board } from '../engine/gameLogic';

defineProps<{
    grid: Board;
}>();

const emit = defineEmits<{
    (e: 'update-cell', rowIndex: number, columnIndex: number): void;
    (e: 'swipe-cell', rowIndex: number, columnIndex: number): void;
}>();

const isSwiping = ref(false);
const lastSwipedCell = ref<string | null>(null);

const startX = ref(0);
const startY = ref(0);
const startRow = ref<number | null>(null);
const startCol = ref<number | null>(null);
const hasMoved = ref(false);

function handlePointerDown(
    e: PointerEvent,
    rowIndex: number,
    columnIndex: number,
) {
    isSwiping.value = true;
    hasMoved.value = false;
    startX.value = e.clientX;
    startY.value = e.clientY;
    startRow.value = rowIndex;
    startCol.value = columnIndex;
    lastSwipedCell.value = `${rowIndex},${columnIndex}`;
}

function handlePointerMove(e: PointerEvent) {
    if (!isSwiping.value) return;

    const dist = Math.hypot(e.clientX - startX.value, e.clientY - startY.value);
    if (!hasMoved.value && dist > 6) {
        hasMoved.value = true;
        if (startRow.value !== null && startCol.value !== null) {
            emit('swipe-cell', startRow.value, startCol.value);
        }
    }

    const element = document.elementFromPoint(e.clientX, e.clientY);
    if (!element) return;

    const cellEl = element.closest('[data-row]') as HTMLElement | null;
    if (cellEl) {
        const rowIndex = parseInt(cellEl.dataset.row || '0', 10);
        const columnIndex = parseInt(cellEl.dataset.col || '0', 10);
        const cellKey = `${rowIndex},${columnIndex}`;

        if (lastSwipedCell.value !== cellKey) {
            lastSwipedCell.value = cellKey;
            if (!hasMoved.value) {
                hasMoved.value = true;
                if (startRow.value !== null && startCol.value !== null) {
                    emit('swipe-cell', startRow.value, startCol.value);
                }
            }
            emit('swipe-cell', rowIndex, columnIndex);
        }
    }
}

function handlePointerUp() {
    if (
        isSwiping.value &&
        !hasMoved.value &&
        startRow.value !== null &&
        startCol.value !== null
    ) {
        emit('update-cell', startRow.value, startCol.value);
    }
    isSwiping.value = false;
    lastSwipedCell.value = null;
    startRow.value = null;
    startCol.value = null;
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
                :grid="grid"
                :row-index="rowIndex"
                :column-index="columnIndex"
                @cell-pointer-down="
                    handlePointerDown($event, rowIndex, columnIndex)
                "
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
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    margin: 1rem auto;
    width: fit-content;
    background-color: #0f172a;
}
.row {
    display: flex;
    touch-action: none;
}
</style>
