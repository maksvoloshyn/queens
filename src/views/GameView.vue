<script setup>
import { onMounted, ref } from 'vue';
import Board from '../components/Board.vue';
import Leaderboard from '../components/Leaderboard.vue';
import { getDailyDateString } from '../utils/date';
import { useGameState } from '../composables/useGameState';

const username = ref(localStorage.getItem('queens_username') || '');
const showSetup = ref(!username.value);
const dateString = getDailyDateString();

const { 
  grid, 
  isLoading, 
  isSolved, 
  formattedTime, 
  initGame, 
  handleUpdateCell, 
  handleSwipeCell 
} = useGameState(dateString, username);

onMounted(() => {
  if (username.value) {
    initGame();
  }
});

function saveUserSetup(e) {
  e.preventDefault();

  const input = new FormData(e.target).get('username');

  if (input && input.trim()) {
    username.value = input.trim();
    localStorage.setItem('queens_username', username.value);
    showSetup.value = false;
    initGame();
  }
}
</script>

<template>
  <div class="game-container">
    <div v-if="showSetup" class="modal-overlay">
      <div class="modal">
        <h2>Welcome to Queens</h2>
        <p>Enter a nickname so your friend knows who you are.</p>
        <form @submit="saveUserSetup">
          <input name="username" type="text" placeholder="Your Nickname" required autofocus autocomplete="off"/>
          <button type="submit">Start Playing</button>
        </form>
      </div>
    </div>

    <header class="header">
      <h1>Queens</h1>
      <div class="stats">
        <span class="timer">{{ formattedTime }}</span>
      </div>
    </header>

    <div v-if="isLoading" class="loading">Loading Puzzle...</div>
    <div v-else-if="grid.length === 0" class="no-puzzle">
      <p>No puzzle available for today.</p>
      <p>Go to <router-link to="/preview">/preview</router-link> to generate one.</p>
    </div>
    <div v-else class="board-wrapper">
      <Board 
        :grid="grid" 
        @update-cell="handleUpdateCell" 
        @swipe-cell="handleSwipeCell"
      />
      <div v-if="isSolved" class="success-message">
        <h2>Magnificent! 🎉</h2>
        <p>You solved today's puzzle in {{ formattedTime }}.</p>
      </div>
      
      <Leaderboard :dateString="dateString" />
    </div>
  </div>
</template>

<style scoped>
.game-container {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 400px;
  margin-bottom: 1rem;
}

.header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
}

.timer {
  font-size: 1.25rem;
  font-weight: bold;
  font-variant-numeric: tabular-nums;
  background: rgba(255,255,255,0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
}

.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(4px);
}

.modal {
  background: #1e293b;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  width: 90%;
  max-width: 320px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
}

.modal input {
  width: 100%;
  padding: 0.75rem;
  margin: 1rem 0;
  border-radius: 8px;
  border: 1px solid #334155;
  background: #0f172a;
  color: white;
  font-size: 1rem;
  box-sizing: border-box;
}

.modal button {
  width: 100%;
  padding: 0.75rem;
  border-radius: 8px;
  border: none;
  background: var(--primary-color);
  color: white;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
}

.loading, .no-puzzle {
  margin-top: 3rem;
  text-align: center;
  color: #94a3b8;
}

.success-message {
  margin-top: 2rem;
  text-align: center;
  animation: slideUp 0.5s ease-out;
}

.success-message h2 {
  color: #34d399;
  margin-bottom: 0.5rem;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
