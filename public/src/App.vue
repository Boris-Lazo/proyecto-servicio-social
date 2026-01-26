<template>
  <div class="app-container">
    <BarraNavegacion />

    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>

    <PiePagina />
  </div>
</template>

<script setup>
import BarraNavegacion from '@/componentes/BarraNavegacion.vue';
import PiePagina from '@/componentes/PiePagina.vue';
</script>

<style>
@import '@/assets/css/estilos.css';

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
  flex: 1;
}
</style>
