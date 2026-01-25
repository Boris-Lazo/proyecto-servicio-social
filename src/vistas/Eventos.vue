<template>
  <main class="eventos-main">
    <section class="eventos-intro">
      <h2>Eventos de la Escuela</h2>
      <p>Descubre los momentos más especiales de nuestra comunidad educativa a través de nuestras galerías
        fotográficas.</p>
    </section>

    <div id="albums-container">
      <div v-if="loading" class="loading-message">Cargando eventos...</div>
      <div v-else-if="albums.length === 0" class="empty-message">No hay eventos publicados aún.</div>
      <div v-else class="albums-grid">
        <div v-for="album in albums" :key="album.id" class="album-card">
          <div class="album-collage">
             <div v-if="album.fotos.length > 0" class="collage-item main" @click="abrirVisor(album, 0)">
                <img :src="`/api/uploads/${album.id}/${album.fotos[0]}`" alt="Principal" loading="lazy">
             </div>
             <div v-if="album.fotos.length > 1" class="collage-item sub" @click="abrirVisor(album, 1)">
                <img :src="`/api/uploads/${album.id}/${album.fotos[1]}`" alt="Sub 1" loading="lazy">
             </div>
             <div v-if="album.fotos.length > 2" class="collage-item sub" @click="abrirVisor(album, 2)">
                <img :src="`/api/uploads/${album.id}/${album.fotos[2]}`" alt="Sub 2" loading="lazy">
                <div v-if="album.fotos.length > 3" class="more-photos-overlay">+{{ album.fotos.length - 3 }}</div>
             </div>
          </div>
          <div class="album-info">
            <h3>{{ album.titulo }}</h3>
            <div class="album-date">{{ formatLongDate(album.fecha) }}</div>
            <p v-if="album.descripcion" class="album-description">{{ album.descripcion }}</p>
          </div>
        </div>
      </div>
    </div>

    <VisorImagenes :album="albumSeleccionado" :initialIndex="indiceInicial" @close="albumSeleccionado = null" />
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/api/clienteApi';
import VisorImagenes from '@/componentes/VisorImagenes.vue';

const albums = ref([]);
const loading = ref(true);
const albumSeleccionado = ref(null);
const indiceInicial = ref(0);

function formatLongDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-SV', { year: 'numeric', month: 'long', day: 'numeric' });
}

function abrirVisor(album, index) {
  albumSeleccionado.value = album;
  indiceInicial.value = index;
}

onMounted(async () => {
  try {
    albums.value = await api.obtener('/api/albums');
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
});
</script>

<style src="@/assets/css/eventos.css"></style>
<style src="@/assets/css/galeria.css"></style>
