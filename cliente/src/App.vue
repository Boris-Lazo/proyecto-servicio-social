<script setup>
import { ref, provide } from 'vue';
import BarraNavegacion from './componentes/BarraNavegacion.vue';
import PiePagina from './componentes/PiePagina.vue';
import VisualizadorImagen from './componentes/VisualizadorImagen.vue';

// Importar estilos globales
import './activos/css/style.css';
import './activos/css/gallery.css';

const visorEstado = ref({
  mostrar: false,
  album: null,
  indiceInicial: 0
});

const abrirVisor = (album, indice = 0) => {
  visorEstado.value = {
    mostrar: true,
    album,
    indiceInicial: indice
  };
};

const cerrarVisor = () => {
  visorEstado.value.mostrar = false;
};

// Proveer la función abrirVisor a todos los componentes descendientes
provide('abrirVisor', abrirVisor);
</script>

<template>
  <BarraNavegacion />

  <router-view />

  <PiePagina />

  <VisualizadorImagen
    :mostrar="visorEstado.mostrar"
    :album="visorEstado.album"
    :indice-inicial="visorEstado.indiceInicial"
    @cerrar="cerrarVisor"
  />
</template>

<style>
/* Estilos globales que no están en los archivos CSS externos */
#app {
  width: 100%;
}
</style>
