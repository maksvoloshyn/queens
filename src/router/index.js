import { createRouter, createWebHistory } from 'vue-router';
import GameView from '../views/GameView.vue';
import PreviewView from '../views/PreviewView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: GameView
    },
    {
      path: '/preview',
      name: 'preview',
      component: PreviewView
    }
  ]
});

export default router;
