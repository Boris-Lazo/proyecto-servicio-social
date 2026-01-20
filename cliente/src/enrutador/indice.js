import { createRouter, createWebHistory } from 'vue-router';
import VistaInicio from '../vistas/VistaInicio.vue';

const rutas = [
  { path: '/', name: 'Inicio', component: VistaInicio },
  { path: '/eventos', name: 'Eventos', component: () => import('../vistas/VistaEventos.vue') },
  { path: '/documentos', name: 'Documentos', component: () => import('../vistas/VistaDocumentos.vue') },
  { path: '/login', name: 'Login', component: () => import('../vistas/VistaLogin.vue') },
  { path: '/admin', name: 'Admin', component: () => import('../vistas/VistaAdmin.vue'), meta: { requiereAutenticacion: true } },
  { path: '/recuperar', name: 'Recuperar', component: () => import('../vistas/VistaRecuperar.vue') }
];

const enrutador = createRouter({
  history: createWebHistory(),
  routes: rutas,
  scrollBehavior(to) { return to.hash ? { el: to.hash } : { top: 0 }; }
});

enrutador.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  if (to.meta.requiereAutenticacion && !token) next('/login');
  else next();
});

export default enrutador;
