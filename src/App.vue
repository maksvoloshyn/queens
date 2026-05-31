<script setup>
import { RouterView } from 'vue-router';
</script>

<template>
    <main class="app-container">
        <RouterView />
    </main>
</template>

<style>
:root {
    --bg-color: #0f172a;
    --text-color: #f8fafc;
    --primary-color: #3b82f6;
    --error-color: #ef4444;
    --cell-size: 11vw;
    max-width: 500px;
    margin: 0 auto;
}

body {
    margin: 0;
    padding: 0;
    background-color: var(--bg-color);
    color: var(--text-color);
    font-family:
        'Inter',
        -apple-system,
        BlinkMacSystemFont,
        'Segoe UI',
        Roboto,
        sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    touch-action: manipulation; /* Prevent double-tap zoom on mobile */
    user-select: none; /* Prevent text selection during swiping */
}

.app-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}
</style>
