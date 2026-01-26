<template>
  <nav class="navBar" :class="{ 'scrolled': isScrolled }" id="header-top" aria-label="Principal">
    <div class="container-limitado nav-content">
      <div class="escuela-titulo">
        <router-link to="/">
          <h1>CENTRO ESCOLAR "CANTÓN EL AMATAL"</h1>
        </router-link>
      </div>

      <button
        id="menu-toggle"
        class="menu-toggle"
        aria-controls="nav-menu"
        :aria-expanded="isMenuOpen"
        @click="isMenuOpen = !isMenuOpen"
      >
        <span class="sr-only">Abrir menú</span>☰
      </button>

      <ul id="nav-menu" :class="{ 'show': isMenuOpen }">
        <li><router-link to="/" @click="isMenuOpen = false">Inicio</router-link></li>
        <li><router-link to="/eventos" title="Fotografías de los eventos de la escuela" @click="isMenuOpen = false">Eventos</router-link></li>
        <li><router-link to="/documentos" title="Documentos de rendición de cuentas" @click="isMenuOpen = false">Documentos</router-link></li>
        <li><a href="/#ubicacion" title="Ubicación" @click="isMenuOpen = false">Ubicación</a></li>
        <li v-if="!isLoggedIn"><router-link to="/login" title="Login" @click="isMenuOpen = false">Login</router-link></li>
        <li v-else><router-link to="/admin" @click="isMenuOpen = false">Admin</router-link></li>
      </ul>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';

const isScrolled = ref(false);
const isMenuOpen = ref(false);

const isLoggedIn = computed(() => !!localStorage.getItem('token'));

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  handleScroll();
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
/* Los estilos base se importan globalmente,
   aquí solo ajustes específicos si son necesarios */
.escuela-titulo a {
  text-decoration: none;
  color: inherit;
}
</style>
