<template>
  <div v-if="isOpen" id="lightbox" class="lightbox active" @click.self="close">
    <button id="lightbox-close" class="lightbox-close" aria-label="Cerrar" @click="close">&times;</button>

    <div class="lightbox-main-area">
      <button
        v-if="album.fotos.length > 1"
        id="lightbox-prev"
        class="lightbox-nav lightbox-prev"
        aria-label="Anterior"
        @click="prev"
      >&#10094;</button>

      <img id="lightbox-image" class="lightbox-image" :src="currentPhotoUrl" :alt="album.titulo">

      <button
        v-if="album.fotos.length > 1"
        id="lightbox-next"
        class="lightbox-nav lightbox-next"
        aria-label="Siguiente"
        @click="next"
      >&#10095;</button>

      <div id="lightbox-info" class="lightbox-info">
        <h3>{{ album.titulo }}</h3>
        <p v-if="album.descripcion">{{ album.descripcion }}</p>
      </div>
      <div id="lightbox-counter" class="lightbox-counter">
        {{ currentIndex + 1 }} / {{ album.fotos.length }}
      </div>
    </div>

    <!-- Sidebar de Miniaturas (Escritorio) -->
    <div class="lightbox-sidebar">
      <div
        v-for="(foto, index) in album.fotos"
        :key="index"
        class="thumbnail-item"
        :class="{ 'active': index === currentIndex }"
        @click="currentIndex = index"
      >
        <img :src="getThumbnailUrl(foto)" alt="Miniatura">
      </div>
    </div>

    <!-- Contenedor Scroll Móvil -->
    <div id="lightbox-mobile-scroll" class="lightbox-mobile-scroll">
      <img
        v-for="(foto, index) in album.fotos"
        :key="index"
        :src="getThumbnailUrl(foto)"
        :class="{ 'active': index === currentIndex }"
        @click="currentIndex = index"
        alt="Miniatura móvil"
      >
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  album: Object,
  initialIndex: Number
});

const emit = defineEmits(['close']);

const isOpen = ref(false);
const currentIndex = ref(0);

const currentPhotoUrl = computed(() => {
  if (!props.album) return '';
  return `/api/uploads/${props.album.id}/${props.album.fotos[currentIndex.value]}`;
});

function getThumbnailUrl(filename) {
  return `/api/uploads/${props.album.id}/${filename}`; // O usar miniaturas si existen
}

function open(index = 0) {
  currentIndex.value = index;
  isOpen.value = true;
  document.body.style.overflow = 'hidden';
}

function close() {
  isOpen.value = false;
  document.body.style.overflow = '';
  emit('close');
}

function next() {
  currentIndex.value = (currentIndex.value + 1) % props.album.fotos.length;
}

// Pre-carga de la siguiente imagen para una transición más fluida
watch(currentIndex, (newIndex) => {
  if (!props.album) return;
  const nextIndex = (newIndex + 1) % props.album.fotos.length;
  const img = new Image();
  img.src = `/api/uploads/${props.album.id}/${props.album.fotos[nextIndex]}`;
});

function prev() {
  currentIndex.value = (currentIndex.value - 1 + props.album.fotos.length) % props.album.fotos.length;
}

// Teclas de navegación
const handleKeyDown = (e) => {
  if (!isOpen.value) return;
  if (e.key === 'ArrowRight') next();
  if (e.key === 'ArrowLeft') prev();
  if (e.key === 'Escape') close();
};

watch(() => props.album, (newAlbum) => {
  if (newAlbum) {
    currentIndex.value = props.initialIndex || 0;
    isOpen.value = true;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
  } else {
    isOpen.value = false;
    document.body.style.overflow = '';
    window.removeEventListener('keydown', handleKeyDown);
  }
});

defineExpose({ open, close });
</script>

<style scoped>
/* Estilos adicionales si no están en lightbox.css */
.thumbnail-item.active {
  border: 2px solid var(--primario);
}
</style>
