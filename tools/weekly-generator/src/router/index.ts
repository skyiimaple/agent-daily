import { createWebHistory, createRouter } from 'vue-router';
import WeeklyGenerator from '../views/WeeklyGenerator.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'weekly-generator',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: WeeklyGenerator,
    },
  ],
});

export default router;
