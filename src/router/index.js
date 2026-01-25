import { createRouter, createWebHistory } from 'vue-router';
import Inicio from '@/vistas/Inicio.vue';
import Eventos from '@/vistas/Eventos.vue';
import Documentos from '@/vistas/Documentos.vue';
import Login from '@/vistas/Login.vue';
import Admin from '@/vistas/Admin.vue';
import RecuperarClave from '@/vistas/RecuperarClave.vue';

const routes = [
  { path: '/', component: Inicio },
  { path: '/eventos', component: Eventos },
  { path: '/documentos', component: Documentos },
  { path: '/login', component: Login },
  { path: '/admin', component: Admin, meta: { requiresAuth: true } },
  { path: '/recuperar', component: RecuperarClave },
  // Fallback
  { path: '/:pathMatch(.*)*', redirect: '/' }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' };
    }
    return { top: 0 };
  }
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  if (to.meta.requiresAuth && !token) {
    next('/login');
  } else {
    next();
  }
});

export default router;
