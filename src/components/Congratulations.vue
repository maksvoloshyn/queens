<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Leaderboard from './Leaderboard.vue';

defineProps<{
    formattedTime: string;
    dateString: string;
}>();

interface CongratulationsOption {
    text: string;
    emoji: string;
}

const congratulationsOptions: CongratulationsOption[] = [
    { text: 'Magnificent', emoji: '🎉' },
    { text: 'Outstanding', emoji: '🌟' },
    { text: 'Brilliant', emoji: '🏆' },
    { text: 'Fantastic', emoji: '🚀' },
    { text: 'Splendid', emoji: '💎' },
    { text: 'Spectacular', emoji: '✨' },
    { text: 'Incredible', emoji: '🌈' },
    { text: 'Phenomenal', emoji: '☄️' },
    { text: 'Superb', emoji: '👏' },
    { text: 'Majestic', emoji: '👑' },
    { text: 'Astonishing', emoji: '⚡' },
    { text: 'Masterful', emoji: '🧠' },
    { text: 'Sensational', emoji: '🌟' },
];

const selectedOption = ref<CongratulationsOption>(congratulationsOptions[0]);

onMounted(() => {
    const randomIndex = Math.floor(
        Math.random() * congratulationsOptions.length,
    );
    selectedOption.value = congratulationsOptions[randomIndex];
});
</script>

<template>
    <div class="congratulations-card">
        <h2 class="congrats-title">
            {{ selectedOption.text }}
            <span class="emoji-bounce">{{ selectedOption.emoji }}</span>
        </h2>

        <div class="stats-badge">
            <span class="badge-label">Solve Time</span>
            <span class="badge-value">{{ formattedTime }}</span>
        </div>

        <p class="congrats-sub">Come back tomorrow for a new puzzle!</p>

        <Leaderboard :date-string="dateString" />
    </div>
</template>

<style scoped>
.congratulations-card {
    background: rgba(30, 41, 59, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow:
        0 10px 30px rgba(0, 0, 0, 0.3),
        inset 0 1px 1px rgba(255, 255, 255, 0.05);
    border-radius: 16px;
    padding: 1.75rem;
    margin-top: 2rem;
    text-align: center;
    max-width: 400px;
    width: 100%;
    box-sizing: border-box;
    animation: scaleUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.congrats-title {
    font-size: 2.25rem;
    font-weight: 800;
    background: linear-gradient(135deg, #10b981, #3b82f6, #8b5cf6);
    background-size: 200% 200%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0 0 0.75rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    animation: gradientShift 4s ease infinite;
}

.emoji-bounce {
    display: inline-block;
    animation: bounce 1.2s ease infinite alternate;
    -webkit-text-fill-color: initial; /* Ensure emoji color is rendered and not gradient-clipped */
}

.stats-badge {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 0.75rem 1.5rem;
    margin: 1rem 0;
    min-width: 120px;
    transition:
        transform 0.2s ease,
        background-color 0.2s ease;
}

.stats-badge:hover {
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.08);
}

.badge-label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #94a3b8;
    margin-bottom: 0.25rem;
}

.badge-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #f8fafc;
    font-variant-numeric: tabular-nums;
}

.congrats-sub {
    font-size: 0.95rem;
    color: #94a3b8;
    margin-bottom: 1.5rem;
}

@keyframes scaleUp {
    0% {
        opacity: 0;
        transform: scale(0.9) translateY(20px);
    }
    100% {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

@keyframes gradientShift {
    0% {
        background-position: 0% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
    100% {
        background-position: 0% 50%;
    }
}

@keyframes bounce {
    0% {
        transform: translateY(0) scale(1);
    }
    100% {
        transform: translateY(-8px) scale(1.1);
    }
}
</style>
