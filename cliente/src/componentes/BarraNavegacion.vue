<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
const menuExpandido = ref(false);
const desplazado = ref(false);
const conmutarMenu = () => menuExpandido.value = !menuExpandido.value;
const cerrarMenu = () => menuExpandido.value = false;
const manejarDesplazamiento = () => desplazado.value = window.scrollY > 50;
onMounted(() => {
  window.addEventListener('scroll', manejarDesplazamiento);
  manejarDesplazamiento();
});
onUnmounted(() => window.removeEventListener('scroll', manejarDesplazamiento));
</script>
<template>
  <nav class="navBar" :class="{ 'scrolled': desplazado }" id="header-top" aria-label="Principal">
    <div class="escuela-titulo"><h1>CENTRO ESCOLAR "CANTÓN EL AMATAL"</h1></div>
    <button class="menu-toggle" :aria-expanded="menuExpandido" @click="conmutarMenu">
      <span class="sr-only">Abrir menú</span>☰
    </button>
    <ul id="nav-menu" :class="{ 'show': menuExpandido }">
      <li><router-link to="/" @click="cerrarMenu">Inicio</router-link></li>
      <li><router-link to="/eventos" @click="cerrarMenu">Eventos</router-link></li>
      <li><router-link to="/documentos" @click="cerrarMenu">Documentos</router-link></li>
      <li><a href="/#ubicacion" @click="cerrarMenu">Ubicación</a></li>
      <li><router-link to="/login" @click="cerrarMenu">Login</router-link></li>
    </ul>
  </nav>
</template>
