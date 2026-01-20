<script setup>
import { ref, onMounted, inject } from 'vue';
import api from '../servicios/cliente-api';
const ultimoAlbum = ref(null);
const ultimoDoc = ref(null);
const abrirVisor = inject('abrirVisor');
onMounted(async () => {
  try {
    const albums = await api.obtener('/api/albums');
    if (albums.length > 0) ultimoAlbum.value = albums[0];
    const docs = await api.obtener('/api/docs');
    if (docs.length > 0) ultimoDoc.value = docs[0];
  } catch (e) { console.error(e); }
});
</script>
<template>
  <header class="escuela-header">
    <img class="vista-fondo" src="../activos/img/fondo-index.jpg" alt="Fondo">
    <section class="info-escuela">
      <p>BIENVENIDOS. <br>El Centro Escolar Cantón El Amatal es una institución educativa de El Salvador.</p>
    </section>
  </header>
  <main>
    <section>
      <h2>📸 Eventos</h2>
      <div v-if="ultimoAlbum" class="album-card">
        <div class="album-collage" @click="abrirVisor(ultimoAlbum, 0)">
          <div class="collage-item main"><img :src="`/api/uploads/${ultimoAlbum.id}/${ultimoAlbum.fotos[0]}`"></div>
        </div>
        <div class="album-info"><h3>{{ ultimoAlbum.titulo }}</h3></div>
      </div>
      <router-link to="/eventos" class="boton-llamada-accion">Ver todos →</router-link>
    </section>
    <section>
      <h2>📄 Documentos</h2>
      <div v-if="ultimoDoc">
        <a :href="`/api/docs/file/${ultimoDoc.filename}`" target="_blank" class="enlace-tarjeta-documento-inicio">
          <div class="tarjeta-documento-inicio"><h4>{{ ultimoDoc.titulo }}</h4></div>
        </a>
      </div>
      <router-link to="/documentos" class="boton-llamada-accion">Ver todos →</router-link>
    </section>
  </main>
</template>
