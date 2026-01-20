<script setup>
import { ref, onMounted } from 'vue';
import api from '../servicios/cliente-api';
import '../activos/css/documentos.css';
const documentos = ref([]);
onMounted(async () => { documentos.value = await api.obtener('/api/docs'); });
</script>
<template>
  <main class="documentos-main">
    <section class="documentos-intro"><h2>Documentos de Rendición de Cuentas</h2></section>
    <div id="documentos-container">
      <div v-for="doc in documentos" :key="doc.id" class="documento-card">
        <a :href="`/api/docs/file/${doc.filename}`" target="_blank">
          <h4>{{ doc.titulo }}</h4>
          <p>{{ doc.mes }}</p>
        </a>
      </div>
    </div>
  </main>
</template>
