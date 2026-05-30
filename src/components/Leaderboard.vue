<script setup>
import { ref, onMounted } from 'vue';
import { getLeaderboard } from '../services/db';

const props = defineProps({
  dateString: String,
});

const scores = ref([]);
const isLoading = ref(true);

onMounted(async () => {
  if (props.dateString) {
    scores.value = await getLeaderboard(props.dateString);
    isLoading.value = false;
  }
});

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}
</script>

<template>
  <div class="leaderboard">
    <h3>Today's Ranking</h3>
    <div v-if="isLoading" class="loading">Loading scores...</div>
    <div v-else-if="scores.length === 0" class="empty">No one has solved today's puzzle yet. You can be the first!</div>
    <ul v-else class="score-list">
      <li v-for="(score, index) in scores" :key="index" class="score-item">
        <span class="rank">#{{ index + 1 }}</span>
        <span class="name">{{ score.username }}</span>
        <span class="time">{{ formatTime(score.timeSeconds) }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.leaderboard {
  margin-top: 2rem;
  padding: 1rem;
  background: rgba(255,255,255,0.05);
  border-radius: 12px;
  width: 100%;
  box-sizing: border-box;
}

h3 {
  margin-top: 0;
  color: var(--primary-color);
  text-align: center;
}

.score-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.score-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.score-item:last-child {
  border-bottom: none;
}

.rank {
  color: #94a3b8;
  width: 30px;
}

.name {
  flex-grow: 1;
  font-weight: bold;
}

.time {
  font-variant-numeric: tabular-nums;
  color: #34d399;
}

.empty, .loading {
  text-align: center;
  color: #94a3b8;
  font-style: italic;
}
</style>
