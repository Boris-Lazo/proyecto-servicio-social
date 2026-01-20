<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
const props = defineProps({ album: Object, indiceInicial: { type: Number, default: 0 }, mostrar: Boolean });
const emit = defineEmits(['cerrar']);
const indiceActual = ref(0);
watch(() => props.indiceInicial, (n) => indiceActual.value = n);
watch(() => props.mostrar, (m) => document.body.style.overflow = m ? 'hidden' : '');
const cerrar = () => emit('cerrar');
const anterior = () => { if (indiceActual.value > 0) indiceActual.value--; };
const siguiente = () => { if (props.album && indiceActual.value < props.album.fotos.length - 1) indiceActual.value++; };
const manejarTeclado = (e) => {
  if (!props.mostrar) return;
  if (e.key === 'Escape') cerrar();
  if (e.key === 'ArrowLeft') anterior();
  if (e.key === 'ArrowRight') siguiente();
};
onMounted(() => window.addEventListener('keydown', manejarTeclado));
onUnmounted(() => window.removeEventListener('keydown', manejarTeclado));
</script>
<template>
  <div id="lightbox" class="lightbox" :class="{ 'active': mostrar }" @click.self="cerrar">
    <button class="lightbox-close" @click="cerrar">&times;</button>
    <div v-if="album" class="lightbox-main-area">
      <button class="lightbox-nav lightbox-prev" @click="anterior" :disabled="indiceActual === 0">&#10094;</button>
      <img class="lightbox-image" :src="`/api/uploads/${album.id}/${album.fotos[indiceActual]}`">
      <button class="lightbox-nav lightbox-next" @click="siguiente" :disabled="indiceActual === album.fotos.length - 1">&#10095;</button>
      <div class="lightbox-info">
        <h3>{{ album.titulo }}</h3>
        <p>📅 {{ new Date(album.fecha).toLocaleDateString() }} • Foto {{ indiceActual + 1 }} de {{ album.fotos.length }}</p>
      </div>
    </div>
    <div v-if="album" class="lightbox-sidebar">
      <div v-for="(f, i) in album.fotos" :key="i" class="lightbox-thumb" :class="{ 'active': i === indiceActual }" @click="indiceActual = i">
        <img :src="`/api/uploads/${album.id}/${f}`">
      </div>
    </div>
  </div>
</template>
