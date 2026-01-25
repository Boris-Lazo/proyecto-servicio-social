<template>
  <main class="documentos-main">
    <section class="documentos-intro">
      <h2>Documentos de Rendición de Cuentas</h2>
      <p>En cumplimiento con la Ley de Acceso a la Información Pública, ponemos a disposición de la comunidad
        educativa y ciudadanía en general los documentos de rendición de cuentas de nuestra institución.</p>
    </section>

    <div id="documentos-container">
      <div v-if="loading" class="loading-message">Cargando documentos...</div>
      <div v-else-if="documents.length === 0" class="empty-message">No hay documentos publicados aún.</div>
      <div v-else>
         <div v-for="year in sortedYears" :key="year" class="year-section">
            <h2 class="year-header">📅 {{ year }}</h2>
            <div v-for="month in sortedMonths(year)" :key="month" class="month-section">
                <h3 class="month-header">{{ getMonthName(month) }} {{ year }}</h3>
                <div class="documentos-grid">
                  <a v-for="doc in organizedDocs[year][month]" :key="doc.id" :href="`/api/docs/file/${doc.filename}`" target="_blank" class="documento-card-link">
                    <article class="documento-card">
                      <div class="documento-preview">
                        <img :src="`/api/docs/thumbnail/${doc.filename}`" alt="Vista previa" loading="lazy">
                      </div>
                      <h4>{{ doc.titulo }}</h4>
                    </article>
                  </a>
                </div>
            </div>
         </div>
      </div>
    </div>

    <section class="documentos-nota">
      <p><strong>Nota:</strong> Si necesita algún documento adicional o tiene consultas sobre la información
        publicada, puede contactarnos a través de nuestros canales oficiales o acercarse directamente a las
        instalaciones del centro escolar.</p>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '@/api/clienteApi';

const documents = ref([]);
const loading = ref(true);

const organizedDocs = computed(() => {
  const organized = {};
  documents.value.forEach(doc => {
    const [year, month] = doc.mes.split('-');
    if (!organized[year]) organized[year] = {};
    if (!organized[year][month]) organized[year][month] = [];
    organized[year][month].push(doc);
  });
  return organized;
});

const sortedYears = computed(() => Object.keys(organizedDocs.value).sort((a, b) => b - a));

function sortedMonths(year) {
  return Object.keys(organizedDocs.value[year]).sort((a, b) => b - a);
}

function getMonthName(monthStr) {
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return months[parseInt(monthStr) - 1];
}

onMounted(async () => {
  try {
    documents.value = await api.obtener('/api/docs');
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
});
</script>

<style src="@/assets/css/documentos.css"></style>
