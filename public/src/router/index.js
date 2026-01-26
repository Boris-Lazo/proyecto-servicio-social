import { createRouter, createWebHistory } from 'vue-router';

// Lazy loading para optimizar el tamaño del paquete inicial
const Inicio = () => import('@/vistas/Inicio.vue');
const Eventos = () => import('@/vistas/Eventos.vue');
const Documentos = () => import('@/vistas/Documentos.vue');
const Login = () => import('@/vistas/Login.vue');
const Admin = () => import('@/vistas/Admin.vue');
const RecuperarClave = () => import('@/vistas/RecuperarClave.vue');

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
