<script setup>
import { ref, onMounted, inject } from 'vue';
import api from '../servicios/cliente-api';
import '../activos/css/eventos.css';
const albums = ref([]);
const abrirVisor = inject('abrirVisor');
onMounted(async () => { albums.value = await api.obtener('/api/albums'); });
</script>
<template>
  <main class="eventos-main">
    <section class="eventos-intro"><h2>Eventos de la Escuela</h2></section>
    <div id="albums-container">
      <div v-for="album in albums" :key="album.id" class="album-card" @click="abrirVisor(album, 0)">
        <div class="album-collage">
          <div class="collage-item main"><img :src="`/api/uploads/${album.id}/${album.fotos[0]}`"></div>
        </div>
        <div class="album-info"><h3>{{ album.titulo }}</h3><p>{{ new Date(album.fecha).toLocaleDateString() }}</p></div>
      </div>
    </div>
  </main>
</template>
